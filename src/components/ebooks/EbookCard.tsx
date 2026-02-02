"use client"

import Link from "next/link"
import { FileText, BookOpen, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/shared/StarRating"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { formatPrice } from "@/lib/utils"
import { getInstallmentLabel } from "@/lib/installments"

interface EbookCardProps {
  ebook: {
    id: string
    title: string
    slug: string
    author: string
    price: number
    originalPrice?: number | null
    coverUrl?: string | null
    category: string
    avgRating: number
    reviewCount: number
    featured: boolean
  }
  isPartner?: boolean
  partnerUrl?: string
}

export function EbookCard({ ebook, isPartner, partnerUrl }: EbookCardProps) {
  const hasDiscount = ebook.originalPrice && ebook.originalPrice > ebook.price
  const discountPercent = hasDiscount
    ? Math.round(((ebook.originalPrice! - ebook.price) / ebook.originalPrice!) * 100)
    : 0

  const cardContent = (
    <>
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/5 flex items-center justify-center overflow-hidden">
        <BookOpen className="h-16 w-16 text-primary/30 group-hover:scale-110 transition-transform duration-300" />
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 badge-discount font-bold shadow-sm">
            -{discountPercent}%
          </Badge>
        )}
        {ebook.featured && !isPartner && (
          <Badge className="absolute top-2 left-2 badge-bestseller shadow-sm">Destaque</Badge>
        )}
        {isPartner && (
          <Badge className="absolute top-2 left-2 bg-amber-500 text-white shadow-sm">Parceiro</Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          <span>{isPartner ? "Produto Parceiro" : "PDF / EPUB / MOBI"}</span>
        </div>
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {ebook.title}
        </h3>
        <p className="text-xs text-muted-foreground">{ebook.author}</p>
        {!isPartner && (
          <div className="flex items-center gap-2">
            <StarRating rating={ebook.avgRating} size="sm" />
            <span className="text-xs text-muted-foreground">({ebook.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{formatPrice(ebook.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(ebook.originalPrice!)}
              </span>
            )}
          </div>
        </div>
        {getInstallmentLabel(ebook.price) && (
          <p className="text-xs text-muted-foreground">{getInstallmentLabel(ebook.price)}</p>
        )}
        {isPartner && partnerUrl ? (
          <a href={partnerUrl} target="_blank" rel="noopener noreferrer sponsored">
            <Button size="sm" variant="outline" className="w-full">
              Ver Oferta <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </a>
        ) : (
          <AddToCartButton
            item={{
              id: ebook.id,
              title: ebook.title,
              slug: ebook.slug,
              author: ebook.author,
              price: ebook.price,
              originalPrice: ebook.originalPrice || undefined,
              coverUrl: ebook.coverUrl || null,
            }}
            size="sm"
            className="w-full"
          />
        )}
      </CardContent>
    </>
  )

  if (isPartner && partnerUrl) {
    return (
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-amber-200/50">
        {cardContent}
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/ebooks/${ebook.slug}`}>
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/5 flex items-center justify-center overflow-hidden">
          <BookOpen className="h-16 w-16 text-primary/30 group-hover:scale-110 transition-transform duration-300" />
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 badge-discount font-bold shadow-sm">
              -{discountPercent}%
            </Badge>
          )}
          {ebook.featured && (
            <Badge className="absolute top-2 left-2 badge-bestseller shadow-sm">Destaque</Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          <span>PDF / EPUB / MOBI</span>
        </div>
        <Link href={`/ebooks/${ebook.slug}`}>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
            {ebook.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground">{ebook.author}</p>
        <div className="flex items-center gap-2">
          <StarRating rating={ebook.avgRating} size="sm" />
          <span className="text-xs text-muted-foreground">({ebook.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{formatPrice(ebook.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(ebook.originalPrice!)}
              </span>
            )}
          </div>
        </div>
        {getInstallmentLabel(ebook.price) && (
          <p className="text-xs text-muted-foreground">{getInstallmentLabel(ebook.price)}</p>
        )}
        <AddToCartButton
          item={{
            id: ebook.id,
            title: ebook.title,
            slug: ebook.slug,
            author: ebook.author,
            price: ebook.price,
            originalPrice: ebook.originalPrice || undefined,
            coverUrl: ebook.coverUrl || null,
          }}
          size="sm"
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}
