import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice, formatDate } from "@/lib/utils"
import { PaymentMethodBadge } from "@/components/admin/PaymentMethodBadge"
import Link from "next/link"
import { logPageView } from "@/lib/log-page-view"

export const dynamic = "force-dynamic"

export const metadata = { title: "Admin - Pedidos" }

const statusConfig: Record<string, string> = {
  PAID: "bg-green-100 text-green-800 border-green-200",
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-purple-100 text-purple-800 border-purple-200",
  EXPIRED: "bg-gray-100 text-gray-800 border-gray-200",
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string }>
}) {
  logPageView("Pedidos", "/admin/pedidos")
  const params = await searchParams
  const where: Record<string, unknown> = {}
  if (params.status) where.status = params.status
  if (params.payment) where.paymentMethod = params.payment

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Pedidos</h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/pedidos">
          <Badge variant={!params.status && !params.payment ? "default" : "outline"} className="cursor-pointer">
            Todos
          </Badge>
        </Link>
        {["PAID", "PENDING", "CANCELLED"].map((s) => (
          <Link key={s} href={`/admin/pedidos?status=${s}${params.payment ? `&payment=${params.payment}` : ""}`}>
            <Badge variant={params.status === s ? "default" : "outline"} className="cursor-pointer">
              {s}
            </Badge>
          </Link>
        ))}
        <span className="border-l mx-1" />
        {["PIX", "CREDIT_CARD", "CRYPTO", "FREE_COUPON"].map((p) => (
          <Link key={p} href={`/admin/pedidos?payment=${p}${params.status ? `&status=${params.status}` : ""}`}>
            <Badge variant={params.payment === p ? "default" : "outline"} className="cursor-pointer">
              {p}
            </Badge>
          </Link>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link href={`/admin/pedidos/${order.id}`} className="text-primary hover:underline font-mono text-sm">
                  #{order.id.slice(0, 8)}
                </Link>
              </TableCell>
              <TableCell>{order.user.name || order.user.email}</TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>{formatPrice(order.total)}</TableCell>
              <TableCell><PaymentMethodBadge method={order.paymentMethod} /></TableCell>
              <TableCell>
                <Badge variant="outline" className={statusConfig[order.status] || ""}>
                  {order.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
