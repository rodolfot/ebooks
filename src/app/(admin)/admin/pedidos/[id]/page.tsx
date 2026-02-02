import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatPrice, formatDateTime } from "@/lib/utils"
import { RefundButton } from "@/components/admin/RefundButton"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface Props { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true, items: { include: { ebook: true } }, coupon: true },
  })
  if (!order) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="font-serif text-3xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
        <Badge>{order.status}</Badge>
        {order.status === "PAID" && <RefundButton orderId={order.id} />}
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
          <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Nome:</strong> {order.user.name || "-"}</p>
            <p><strong>Email:</strong> {order.user.email}</p>
            <p><strong>CPF:</strong> {order.customerCpf || "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pagamento</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Método:</strong> {order.paymentMethod || "-"}</p>
            <p><strong>ID:</strong> {order.paymentId || "-"}</p>
            <p><strong>Data:</strong> {formatDateTime(order.createdAt)}</p>
            {order.paidAt && <p><strong>Pago em:</strong> {formatDateTime(order.paidAt)}</p>}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Itens</CardTitle></CardHeader>
        <CardContent>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
              <span>{item.ebook.title}</span>
              <span className="font-medium">{formatPrice(item.price)}</span>
            </div>
          ))}
          <Separator className="my-3" />
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto {order.coupon && `(${order.coupon.code})`}</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
