import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { PenTool } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = { title: "Autores" }

export default async function AuthorsPage() {
  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { ebooks: true } } },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">Autores</h1>
      {authors.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum autor cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {authors.map((author) => (
            <Link key={author.id} href={`/autores/${author.slug}`}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <PenTool className="h-8 w-8 text-primary/50" />
                  </div>
                  <h2 className="font-semibold text-lg">{author.name}</h2>
                  {author.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{author.bio}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{author._count.ebooks} e-book(s)</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
