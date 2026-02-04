import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils"
import { ArrowLeft, ShoppingCart, DollarSign, Star, Heart, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClientStatusActions } from "@/components/admin/ClientStatusActions"
import { logPageView } from "@/lib/log-page-view"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true } })
  return { title: `Admin - ${user?.name || user?.email || "Cliente"}` }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  logPageView("Cliente Detalhes", `/admin/clientes/${id}`)

  const client = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          items: { include: { ebook: { select: { title: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        include: { ebook: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          orders: true,
          favorites: true,
          reviews: true,
          downloads: true,
        },
      },
    },
  })

  if (!client) notFound()

  const activityLogs = await prisma.activityLog.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  const paidOrders = client.orders.filter((o) => o.status === "PAID")
  const totalSpent = paidOrders.reduce((sum, o) => sum + o.total, 0)
  const avgTicket = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0
  const lastPurchase = paidOrders[0]?.createdAt || null

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    SUSPENDED: "bg-yellow-100 text-yellow-800",
    BANNED: "bg-red-100 text-red-800",
  }

  const statusLabels: Record<string, string> = {
    ACTIVE: "Ativo",
    SUSPENDED: "Suspenso",
    BANNED: "Banido",
  }

  const orderStatusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-purple-100 text-purple-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  }

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    APPROVE: "bg-emerald-100 text-emerald-800",
    REJECT: "bg-orange-100 text-orange-800",
    TOGGLE: "bg-purple-100 text-purple-800",
    LOGIN: "bg-cyan-100 text-cyan-800",
    EXPORT: "bg-yellow-100 text-yellow-800",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/clientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {client.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={client.image} alt={client.name || ""} className="w-16 h-16 rounded-full object-cover border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
              {(client.name || client.email)[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-serif text-3xl font-bold">{client.name || "Sem nome"}</h1>
            <p className="text-muted-foreground">{client.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={statusColors[client.status] || ""}>
                {statusLabels[client.status] || client.status}
              </Badge>
              <Badge variant="outline">{client.role}</Badge>
              {client.cpf && <span className="text-xs text-muted-foreground">CPF: {client.cpf}</span>}
              {client.phone && <span className="text-xs text-muted-foreground">Tel: {client.phone}</span>}
            </div>
          </div>
        </div>

        <ClientStatusActions userId={client.id} currentStatus={client.status} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client._count.orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Medio</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(avgTicket)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ultima Compra</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{lastPurchase ? formatDate(lastPurchase) : "Nunca"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client._count.favorites}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliacoes</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client._count.reviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Info row */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cadastro:</span>
              <p className="font-medium">{formatDateTime(client.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Newsletter:</span>
              <p className="font-medium">{client.newsletter ? "Sim" : "Nao"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Downloads:</span>
              <p className="font-medium">{client._count.downloads}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email verificado:</span>
              <p className="font-medium">{client.emailVerified ? formatDate(client.emailVerified) : "Nao"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders History */}
      <div>
        <h2 className="font-serif text-xl font-bold mb-4">Historico de Pedidos ({client.orders.length})</h2>
        {client.orders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum pedido registrado.
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.items.map((item) => (
                        <div key={item.id}>{item.ebook.title}</div>
                      ))}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="font-medium">{formatPrice(order.total)}</span>
                      {order.discount > 0 && (
                        <span className="text-xs text-green-600 ml-1">(-{formatPrice(order.discount)})</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{order.paymentMethod || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={orderStatusColors[order.status] || ""}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/pedidos/${order.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Reviews */}
      {client.reviews.length > 0 && (
        <div>
          <h2 className="font-serif text-xl font-bold mb-4">Avaliacoes Recentes</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ebook</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Aprovada</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="text-sm font-medium">{review.ebook.title}</TableCell>
                    <TableCell className="text-sm">{review.rating}/5</TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate">{review.comment || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={review.approved ? "default" : "secondary"}>
                        {review.approved ? "Sim" : "Nao"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(review.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Activity Logs */}
      {activityLogs.length > 0 && (
        <div>
          <h2 className="font-serif text-xl font-bold mb-4">Atividade Recente</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Acao</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Descricao</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={actionColors[log.action] || ""}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.resource}</TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate">{log.description || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
