import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EbookCard } from "@/components/ebooks/EbookCard"
import { PenTool } from "lucide-react"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const author = await prisma.author.findUnique({ where: { slug } })
  return { title: author ? `${author.name} - Autores` : "Autor não encontrado" }
}

export default async function AuthorDetailPage({ params }: Props) {
  const { slug } = await params
  const author = await prisma.author.findUnique({
    where: { slug },
    include: {
      ebooks: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!author) notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <PenTool className="h-6 w-6 text-primary/50" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold">{author.name}</h1>
          {author.bio && <p className="text-muted-foreground mt-1">{author.bio}</p>}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">E-books de {author.name}</h2>
      {author.ebooks.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum e-book publicado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {author.ebooks.map((ebook) => (
            <EbookCard key={ebook.id} ebook={ebook} />
          ))}
        </div>
      )}
    </div>
  )
}
