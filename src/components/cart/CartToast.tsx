"use client"

import { toast } from "sonner"
import { BookOpen, ShoppingCart } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface CartToastItem {
  title: string
  price: number
  coverUrl: string | null
}

export function showCartToast(item: CartToastItem) {
  toast.custom(
    () => (
      <div className="flex items-center gap-3 bg-card border rounded-lg p-4 shadow-lg w-80">
        <div className="h-12 w-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatPrice(item.price)} - Adicionado ao carrinho
          </p>
        </div>
        <ShoppingCart className="h-4 w-4 text-primary flex-shrink-0" />
      </div>
    ),
    {
      duration: 4000,
      position: "bottom-right",
    }
  )
}

export function showCartDuplicateToast(title: string) {
  toast.info("Este e-book ja esta no carrinho", {
    description: title,
    action: {
      label: "Ver Carrinho",
      onClick: () => {},
    },
  })
}
