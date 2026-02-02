"use client"

import { BookOpen, FileText, Download, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/shared/StarRating"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { formatPrice } from "@/lib/utils"
import { getInstallmentLabel } from "@/lib/installments"

interface EbookDetailProps {
  ebook: {
    id: string
    title: string
    slug: string
    author: string
    description: string
    shortDescription?: string | null
    price: number
    originalPrice?: number | null
    category: string
    tags: string[]
    pages?: number | null
    language: string
    isbn?: string | null
    publisher?: string | null
    avgRating: number
    reviewCount: number
    salesCount: number
  }
}

export function EbookDetail({ ebook }: EbookDetailProps) {
  const hasDiscount = ebook.originalPrice && ebook.originalPrice > ebook.price

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
            <BookOpen className="h-24 w-24 text-primary/30" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div>
          <Badge variant="secondary" className="mb-2">{ebook.category}</Badge>
          <h1 className="font-serif text-3xl font-bold mb-2">{ebook.title}</h1>
          <p className="text-lg text-muted-foreground">por {ebook.author}</p>
        </div>

        <div className="flex items-center gap-4">
          <StarRating rating={ebook.avgRating} size="lg" />
          <span className="text-sm text-muted-foreground">
            {ebook.avgRating.toFixed(1)} ({ebook.reviewCount} avaliações)
          </span>
          <span className="text-sm text-muted-foreground">
            {ebook.salesCount} vendas
          </span>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(ebook.price)}</span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(ebook.originalPrice!)}
              </span>
            )}
          </div>
          {getInstallmentLabel(ebook.price) && (
            <p className="text-sm text-muted-foreground">{getInstallmentLabel(ebook.price)}</p>
          )}

          <AddToCartButton
            item={{
              id: ebook.id,
              title: ebook.title,
              slug: ebook.slug,
              author: ebook.author,
              price: ebook.price,
              originalPrice: ebook.originalPrice || undefined,
              coverUrl: null,
            }}
            size="lg"
            className="w-full"
          />

          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="flex flex-col items-center gap-1">
              <Download className="h-5 w-5 text-primary" />
              <span>Download Imediato</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FileText className="h-5 w-5 text-primary" />
              <span>PDF, EPUB, MOBI</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield className="h-5 w-5 text-primary" />
              <span>Pagamento Seguro</span>
            </div>
          </div>
        </div>

        {ebook.shortDescription && (
          <p className="text-lg text-muted-foreground">{ebook.shortDescription}</p>
        )}

        <Separator />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {ebook.pages && (
            <div>
              <span className="text-muted-foreground">Páginas</span>
              <p className="font-medium">{ebook.pages}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Idioma</span>
            <p className="font-medium">{ebook.language}</p>
          </div>
          {ebook.isbn && (
            <div>
              <span className="text-muted-foreground">ISBN</span>
              <p className="font-medium">{ebook.isbn}</p>
            </div>
          )}
          {ebook.publisher && (
            <div>
              <span className="text-muted-foreground">Editora</span>
              <p className="font-medium">{ebook.publisher}</p>
            </div>
          )}
        </div>

        {ebook.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ebook.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
