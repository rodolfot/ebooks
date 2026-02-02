import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = { title: "Histórico de Downloads" }

export default async function DownloadHistoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const downloads = await prisma.download.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  // Fetch ebook titles
  const ebookIds = [...new Set(downloads.map((d) => d.ebookId))]
  const ebooks = await prisma.ebook.findMany({
    where: { id: { in: ebookIds } },
    select: { id: true, title: true },
  })
  const ebookMap = new Map(ebooks.map((e) => [e.id, e.title]))

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/biblioteca">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </Link>
        <h1 className="font-serif text-3xl font-bold">Histórico de Downloads</h1>
      </div>

      {downloads.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum download realizado.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-book</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloads.map((download) => (
                <TableRow key={download.id}>
                  <TableCell className="font-medium">{ebookMap.get(download.ebookId) || "Desconhecido"}</TableCell>
                  <TableCell className="uppercase text-sm">{download.format}</TableCell>
                  <TableCell className="text-sm">{download.createdAt.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{download.ip || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
