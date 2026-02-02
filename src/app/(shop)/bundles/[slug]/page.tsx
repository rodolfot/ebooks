import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EbookCard } from "@/components/ebooks/EbookCard"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { Layers } from "lucide-react"
import { AddBundleButton } from "@/components/cart/AddBundleButton"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const bundle = await prisma.bundle.findUnique({ where: { slug } })
  return { title: bundle ? `${bundle.title} - Bundles` : "Bundle não encontrado" }
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params
  const bundle = await prisma.bundle.findUnique({
    where: { slug, active: true },
    include: {
      items: {
        include: {
          ebook: true,
        },
      },
    },
  })

  if (!bundle) notFound()

  const originalTotal = bundle.items.reduce((sum, i) => sum + i.ebook.price, 0)
  const savings = originalTotal - bundle.price

  const bundleItems = bundle.items.map((item) => ({
    id: item.ebook.id,
    title: item.ebook.title,
    slug: item.ebook.slug,
    author: item.ebook.author,
    price: item.ebook.price,
    coverUrl: item.ebook.coverUrl,
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-8 w-8 text-primary" />
          <h1 className="font-serif text-3xl font-bold">{bundle.title}</h1>
        </div>
        {bundle.description && (
          <p className="text-lg text-muted-foreground mb-4">{bundle.description}</p>
        )}
        <div className="bg-muted/50 rounded-lg p-6 inline-block space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(bundle.price)}</span>
            {savings > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(originalTotal)}</span>
                <Badge className="bg-green-100 text-green-800">Economize {formatPrice(savings)}</Badge>
              </>
            )}
          </div>
          <AddBundleButton items={bundleItems} bundleTitle={bundle.title} />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">E-books incluídos ({bundle.items.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bundle.items.map((item) => (
          <EbookCard key={item.ebook.id} ebook={item.ebook} />
        ))}
      </div>
    </div>
  )
}
