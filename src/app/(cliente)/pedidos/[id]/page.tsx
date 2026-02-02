import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatPrice, formatDateTime } from "@/lib/utils"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata = { title: "Detalhes do Pedido" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    include: { items: { include: { ebook: true } }, coupon: true },
  })

  if (!order) notFound()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="font-serif text-3xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
        {(order.status === "PAID" || order.status === "REFUNDED") && (
          <Link
            href={`/api/orders/${order.id}/receipt`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Baixar Recibo
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge>{order.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagamento</span>
              <span>{order.paymentMethod || "-"}</span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pago em</span>
                <span>{formatDateTime(order.paidAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Itens</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.ebook.title}</span>
                <span>{formatPrice(item.price)}</span>
              </div>
            ))}
            <Separator />
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto {order.coupon?.code && `(${order.coupon.code})`}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
