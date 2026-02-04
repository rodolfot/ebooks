"use client"

import { useSyncExternalStore } from "react"
import { ShoppingCart, Check } from "lucide-react"
import { useCartStore, type CartItem } from "@/stores/cart"
import { Button } from "@/components/ui/button"
import { showCartToast, showCartDuplicateToast } from "./CartToast"

interface AddToCartButtonProps {
  item: CartItem
  size?: "default" | "sm" | "lg"
  className?: string
}

const emptySubscribe = () => () => {}

export function AddToCartButton({ item, size = "default", className }: AddToCartButtonProps) {
  const { addItem, hasItem } = useCartStore()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const inCart = mounted && hasItem(item.id)

  function handleAdd() {
    if (inCart) {
      showCartDuplicateToast(item.title)
      return
    }
    addItem(item)
    showCartToast({ title: item.title, price: item.price, coverUrl: item.coverUrl })
  }

  return (
    <Button onClick={handleAdd} size={size} className={className} variant={inCart ? "secondary" : "default"} disabled={inCart}>
      {inCart ? (
        <><Check className="mr-2 h-4 w-4" /> No Carrinho</>
      ) : (
        <><ShoppingCart className="mr-2 h-4 w-4" /> Adicionar</>
      )}
    </Button>
  )
}
