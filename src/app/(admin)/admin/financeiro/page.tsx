import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { DollarSign, TrendingUp, Tag, ShoppingCart, BarChart3, Percent, Download } from "lucide-react"
import Link from "next/link"
import { logPageView } from "@/lib/log-page-view"

export const dynamic = "force-dynamic"

export const metadata = { title: "Admin - Financeiro" }

export default async function AdminFinanceiroPage() {
  logPageView("Financeiro", "/admin/financeiro")

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Section 1: Revenue cards
  const [revenueToday, revenueWeek, revenueMonth, revenueTotal, discountsTotal, totalPaidOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "PAID", paidAt: { gte: todayStart } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: "PAID", paidAt: { gte: weekStart } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { discount: true },
    }),
    prisma.order.count({ where: { status: "PAID" } }),
  ])

  const totalRev = revenueTotal._sum.total || 0
  const avgTicket = totalPaidOrders > 0 ? totalRev / totalPaidOrders : 0

  // Section 2: Revenue by month (raw SQL)
  const monthlyRevenue = await prisma.$queryRawUnsafe<
    { month: Date; orders: bigint; revenue: number; avg_ticket: number }[]
  >(`
    SELECT
      DATE_TRUNC('month', "paidAt") as month,
      COUNT(*)::bigint as orders,
      SUM(total) as revenue,
      AVG(total) as avg_ticket
    FROM "Order"
    WHERE status = 'PAID' AND "paidAt" IS NOT NULL
    GROUP BY DATE_TRUNC('month', "paidAt")
    ORDER BY month DESC
    LIMIT 12
  `)

  // Section 3: Revenue by payment method
  const paymentMethods = await prisma.order.groupBy({
    by: ["paymentMethod"],
    where: { status: "PAID" },
    _count: true,
    _sum: { total: true },
  })

  const paymentTotal = paymentMethods.reduce((sum, m) => sum + (m._sum.total || 0), 0)

  // Section 4: Top 10 ebooks by revenue (raw SQL)
  const topEbooks = await prisma.$queryRawUnsafe<
    { title: string; sales: bigint; unit_price: number; revenue: number }[]
  >(`
    SELECT
      e.title,
      COUNT(oi.id)::bigint as sales,
      e.price as unit_price,
      SUM(oi.price) as revenue
    FROM "OrderItem" oi
    JOIN "Order" o ON o.id = oi."orderId"
    JOIN "Ebook" e ON e.id = oi."ebookId"
    WHERE o.status = 'PAID'
    GROUP BY e.id, e.title, e.price
    ORDER BY revenue DESC
    LIMIT 10
  `)

  // Section 5: Coupon impact
  const [couponOrders, totalOrders] = await Promise.all([
    prisma.order.count({ where: { status: "PAID", couponId: { not: null } } }),
    prisma.order.count({ where: { status: "PAID" } }),
  ])

  const couponUsageRate = totalOrders > 0 ? (couponOrders / totalOrders) * 100 : 0

  const topCoupons = await prisma.$queryRawUnsafe<
    { code: string; discount_type: string; discount_value: number; uses: bigint; total_discount: number }[]
  >(`
    SELECT
      c.code,
      c."discountType" as discount_type,
      c."discountValue" as discount_value,
      COUNT(o.id)::bigint as uses,
      SUM(o.discount) as total_discount
    FROM "Coupon" c
    JOIN "Order" o ON o."couponId" = c.id
    WHERE o.status = 'PAID'
    GROUP BY c.id, c.code, c."discountType", c."discountValue"
    ORDER BY total_discount DESC
    LIMIT 10
  `)

  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]

  const paymentMethodLabels: Record<string, string> = {
    PIX: "PIX",
    CREDIT_CARD: "Cartao de Credito",
    CRYPTO: "Criptomoeda",
    FREE_COUPON: "Cupom Gratis",
    MANUAL: "Manual",
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Financeiro</h1>
        <Link href="/api/admin/financeiro/export" target="_blank">
          <button className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
        </Link>
      </div>

      {/* Section 1: Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(revenueToday._sum.total || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(revenueWeek._sum.total || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(revenueMonth._sum.total || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRev)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descontos Dados</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatPrice(discountsTotal._sum.discount || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Medio</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(avgTicket)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Revenue by Month */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyRevenue.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum dado disponivel.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Ticket Medio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyRevenue.map((row) => {
                  const d = new Date(row.month)
                  return (
                    <TableRow key={d.toISOString()}>
                      <TableCell className="font-medium">
                        {monthNames[d.getMonth()]} {d.getFullYear()}
                      </TableCell>
                      <TableCell className="text-right">{Number(row.orders)}</TableCell>
                      <TableCell className="text-right">{formatPrice(Number(row.revenue))}</TableCell>
                      <TableCell className="text-right">{formatPrice(Number(row.avg_ticket))}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Revenue by Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Metodo de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum dado disponivel.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metodo</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead className="text-right">Receita Total</TableHead>
                  <TableHead className="text-right">% da Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods
                  .sort((a, b) => (b._sum.total || 0) - (a._sum.total || 0))
                  .map((method) => (
                    <TableRow key={method.paymentMethod || "unknown"}>
                      <TableCell className="font-medium">
                        {method.paymentMethod
                          ? paymentMethodLabels[method.paymentMethod] || method.paymentMethod
                          : "Nao informado"}
                      </TableCell>
                      <TableCell className="text-right">{method._count}</TableCell>
                      <TableCell className="text-right">{formatPrice(method._sum.total || 0)}</TableCell>
                      <TableCell className="text-right">
                        {paymentTotal > 0 ? ((method._sum.total || 0) / paymentTotal * 100).toFixed(1) : "0.0"}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Top 10 Ebooks by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 E-books por Receita</CardTitle>
        </CardHeader>
        <CardContent>
          {topEbooks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum dado disponivel.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Titulo</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">Preco Unitario</TableHead>
                  <TableHead className="text-right">Receita Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEbooks.map((ebook, index) => (
                  <TableRow key={ebook.title}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{ebook.title}</TableCell>
                    <TableCell className="text-right">{Number(ebook.sales)}</TableCell>
                    <TableCell className="text-right">{formatPrice(Number(ebook.unit_price))}</TableCell>
                    <TableCell className="text-right">{formatPrice(Number(ebook.revenue))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Coupon Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Impacto dos Cupons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Tag className="h-4 w-4" /> Descontos Totais
              </div>
              <div className="text-2xl font-bold text-red-600">
                {formatPrice(discountsTotal._sum.discount || 0)}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <ShoppingCart className="h-4 w-4" /> Pedidos com Cupom
              </div>
              <div className="text-2xl font-bold">{couponOrders}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Percent className="h-4 w-4" /> Taxa de Uso
              </div>
              <div className="text-2xl font-bold">{couponUsageRate.toFixed(1)}%</div>
            </div>
          </div>

          {topCoupons.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Usos</TableHead>
                  <TableHead className="text-right">Desconto Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCoupons.map((coupon) => (
                  <TableRow key={coupon.code}>
                    <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.discount_type === "PERCENTAGE" ? "Porcentagem" : "Fixo"}
                    </TableCell>
                    <TableCell className="text-right">
                      {coupon.discount_type === "PERCENTAGE"
                        ? `${coupon.discount_value}%`
                        : formatPrice(Number(coupon.discount_value))}
                    </TableCell>
                    <TableCell className="text-right">{Number(coupon.uses)}</TableCell>
                    <TableCell className="text-right">{formatPrice(Number(coupon.total_discount))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
