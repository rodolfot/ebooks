import { prisma } from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Eye } from "lucide-react"
import { logPageView } from "@/lib/log-page-view"

export const dynamic = "force-dynamic"

export const metadata = { title: "Admin - Clientes" }

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

export default async function AdminCustomersPage() {
  logPageView("Clientes", "/admin/clientes")
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Clientes</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Pedidos</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name || "-"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.cpf || "-"}</TableCell>
              <TableCell>{user._count.orders}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusColors[user.status] || ""}>
                  {statusLabels[user.status] || user.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <Link href={`/admin/clientes/${user.id}`}>
                  <Button variant="ghost" size="sm" title="Ver detalhes">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
