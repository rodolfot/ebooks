import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/permissions"
import { createLog, LogAction, LogResource } from "@/lib/audit"

export async function GET(request: Request) {
  try {
    const session = await auth()
    const denied = requirePermission(session, "analytics", "view")
    if (denied) return denied

    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const status = url.searchParams.get("status")

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate + "T23:59:59.999Z")
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { ebook: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    })

    const BOM = "\uFEFF"
    const headers = ["ID", "Data", "Cliente", "Email", "Itens", "Metodo", "Subtotal", "Desconto", "Total", "Status"]
    const rows = orders.map((order) => {
      const itemTitles = order.items.map((i) => i.ebook.title).join("; ")
      const subtotal = order.total + order.discount
      return [
        order.id.slice(0, 8),
        order.createdAt.toISOString().slice(0, 19).replace("T", " "),
        (order.customerName || order.user.name || "-").replace(/"/g, '""'),
        (order.customerEmail || order.user.email || "-"),
        itemTitles.replace(/"/g, '""'),
        order.paymentMethod || "-",
        subtotal.toFixed(2),
        order.discount.toFixed(2),
        order.total.toFixed(2),
        order.status,
      ].map((v) => `"${v}"`).join(",")
    })

    const csv = BOM + headers.join(",") + "\n" + rows.join("\n")

    createLog({
      userId: session!.user!.id,
      action: LogAction.EXPORT,
      resource: LogResource.ORDER,
      description: `Exportação financeira CSV - ${orders.length} registros`,
      request,
    })

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="financeiro-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error("Financial export error:", error)
    return NextResponse.json({ error: "Erro ao exportar" }, { status: 500 })
  }
}
