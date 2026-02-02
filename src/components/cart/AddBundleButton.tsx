"use client"

import { useCartStore } from "@/stores/cart"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check } from "lucide-react"
import { toast } from "sonner"

interface BundleItem {
  id: string
  title: string
  slug: string
  author: string
  price: number
  coverUrl: string | null
}

interface AddBundleButtonProps {
  items: BundleItem[]
  bundleTitle: string
}

export function AddBundleButton({ items, bundleTitle }: AddBundleButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const hasItem = useCartStore((s) => s.hasItem)

  const allInCart = items.every((item) => hasItem(item.id))

  function handleAdd() {
    let added = 0
    for (const item of items) {
      if (!hasItem(item.id)) {
        addItem(item)
        added++
      }
    }
    if (added > 0) {
      toast.success(`${added} e-book(s) do bundle "${bundleTitle}" adicionado(s) ao carrinho`)
    } else {
      toast.info("Todos os e-books do bundle já estão no carrinho")
    }
  }

  if (allInCart) {
    return (
      <Button disabled className="w-full" size="lg">
        <Check className="h-4 w-4 mr-2" /> Todos no carrinho
      </Button>
    )
  }

  return (
    <Button onClick={handleAdd} className="w-full" size="lg">
      <ShoppingCart className="h-4 w-4 mr-2" /> Adicionar Bundle ao Carrinho
    </Button>
  )
}
