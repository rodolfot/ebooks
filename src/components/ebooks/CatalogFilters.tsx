"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const priceRanges = [
  { value: "all", label: "Todos os preços" },
  { value: "0-29", label: "Até R$ 29,90" },
  { value: "30-59", label: "R$ 30 - R$ 59,90" },
  { value: "60-99", label: "R$ 60 - R$ 99,90" },
  { value: "100+", label: "Acima de R$ 100" },
]

const sortOptions = [
  { value: "recent", label: "Mais recentes" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "rating", label: "Melhor avaliados" },
  { value: "bestseller", label: "Mais vendidos" },
]

export function CatalogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([
    { value: "all", label: "Todas as categorias" },
  ])

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: { name: string }[]) => {
        setCategories([
          { value: "all", label: "Todas as categorias" },
          ...data.map((c) => ({ value: c.name, label: c.name })),
        ])
      })
      .catch(() => {})
  }, [])

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page")
    router.push(`/ebooks?${params.toString()}`)
  }

  function clearFilters() {
    router.push("/ebooks")
  }

  const hasFilters = searchParams.has("category") || searchParams.has("price") || searchParams.has("sort")

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select
          value={searchParams.get("category") || "all"}
          onValueChange={(v) => updateFilter("category", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("price") || "all"}
          onValueChange={(v) => updateFilter("price", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Preço" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("sort") || "recent"}
          onValueChange={(v) => updateFilter("sort", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
      <Separator />
    </div>
  )
}
