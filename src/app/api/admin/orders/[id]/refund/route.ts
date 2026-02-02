import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/permissions"
import { createLog, LogAction, LogResource } from "@/lib/audit"
import { Payment } from "mercadopago"
import { mercadopago } from "@/lib/mercadopago"

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Props) {
  try {
    const session = await auth()
    const denied = requirePermission(session, "order", "update")
    if (denied) return denied

    const { id } = await params

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    if (order.status !== "PAID") {
      return NextResponse.json({ error: "Apenas pedidos pagos podem ser reembolsados" }, { status: 400 })
    }

    // Attempt refund via MercadoPago if paymentId exists
    if (order.paymentId && order.paymentMethod !== "FREE_COUPON" && order.paymentMethod !== "CRYPTO") {
      try {
        const payment = new Payment(mercadopago)
        await (payment as unknown as { refund: (opts: { payment_id: string }) => Promise<unknown> }).refund({ payment_id: order.paymentId })
      } catch (error) {
        console.error("MercadoPago refund error:", error)
        // Continue with status update even if gateway refund fails
      }
    }

    await prisma.order.update({
      where: { id },
      data: { status: "REFUNDED" },
    })

    await createLog({
      userId: session!.user!.id,
      action: LogAction.REFUND,
      resource: LogResource.ORDER,
      resourceId: id,
      description: `Reembolso do pedido #${id.slice(0, 8)} - ${order.total.toFixed(2)}`,
      request,
    })

    return NextResponse.json({ message: "Reembolso processado" })
  } catch (error) {
    console.error("Refund error:", error)
    return NextResponse.json({ error: "Erro ao processar reembolso" }, { status: 500 })
  }
}
