import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { Layers } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = { title: "Bundles" }

export default async function BundlesPage() {
  const bundles = await prisma.bundle.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { ebook: { select: { title: true, price: true } } } },
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold mb-2">Bundles</h1>
      <p className="text-muted-foreground mb-8">Pacotes de e-books com preços especiais</p>
      {bundles.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum bundle disponível.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => {
            const originalTotal = bundle.items.reduce((sum, i) => sum + i.ebook.price, 0)
            const savings = originalTotal - bundle.price
            return (
              <Link key={bundle.id} href={`/bundles/${bundle.slug}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Layers className="h-8 w-8 text-primary" />
                      <h2 className="font-semibold text-lg">{bundle.title}</h2>
                    </div>
                    {bundle.description && (
                      <p className="text-sm text-muted-foreground">{bundle.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {bundle.items.map((item) => (
                        <Badge key={item.id} variant="outline" className="text-xs">{item.ebook.title}</Badge>
                      ))}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">{formatPrice(bundle.price)}</span>
                      {savings > 0 && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">{formatPrice(originalTotal)}</span>
                          <Badge className="bg-green-100 text-green-800">Economize {formatPrice(savings)}</Badge>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{bundle.items.length} e-book(s) incluídos</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
