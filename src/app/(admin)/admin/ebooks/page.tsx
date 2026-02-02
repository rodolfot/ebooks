import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { Plus } from "lucide-react"
import Link from "next/link"
import { EbookActions } from "@/components/admin/EbookActions"
import { logPageView } from "@/lib/log-page-view"

export const dynamic = "force-dynamic"

export const metadata = { title: "Admin - E-books" }

export default async function AdminEbooksPage() {
  logPageView("E-books", "/admin/ebooks")
  const ebooks = await prisma.ebook.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">E-books</h1>
        <Link href="/admin/ebooks/novo">
          <Button><Plus className="h-4 w-4 mr-2" /> Novo E-book</Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Vendas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ebooks.map((ebook) => (
            <TableRow key={ebook.id}>
              <TableCell className="font-medium">{ebook.title}</TableCell>
              <TableCell>{ebook.category}</TableCell>
              <TableCell>{formatPrice(ebook.price)}</TableCell>
              <TableCell>{ebook.salesCount}</TableCell>
              <TableCell><Badge variant={ebook.status === "PUBLISHED" ? "default" : "secondary"}>{ebook.status}</Badge></TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/ebooks/${ebook.id}/editar`}>
                    <Button size="sm" variant="outline">Editar</Button>
                  </Link>
                  <EbookActions ebookId={ebook.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
