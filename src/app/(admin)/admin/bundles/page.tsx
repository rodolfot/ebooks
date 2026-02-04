"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Trash2, Plus } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useLogPageView } from "@/hooks/useLogPageView"

interface BundleItem {
  id: string
  ebook: { id: string; title: string; price: number }
}

interface Bundle {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  originalPrice: number | null
  active: boolean
  items: BundleItem[]
}

interface Ebook {
  id: string
  title: string
  price: number
}

export default function AdminBundlesPage() {
  useLogPageView("Bundles")
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [selectedEbooks, setSelectedEbooks] = useState<string[]>([])

  useEffect(() => {
    async function loadData() {
      const [bundlesRes, ebooksRes] = await Promise.all([
        fetch("/api/admin/bundles"),
        fetch("/api/admin/ebooks"),
      ])
      if (bundlesRes.ok) setBundles(await bundlesRes.json())
      if (ebooksRes.ok) {
        const data = await ebooksRes.json()
        setEbooks(Array.isArray(data) ? data : data.ebooks || [])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const fetchBundles = useCallback(async () => {
    const res = await fetch("/api/admin/bundles")
    if (res.ok) setBundles(await res.json())
  }, [])

  async function handleCreate() {
    if (!title.trim() || !price || selectedEbooks.length === 0) return
    const res = await fetch("/api/admin/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        price,
        ebookIds: selectedEbooks,
      }),
    })
    if (res.ok) {
      toast.success("Bundle criado")
      setTitle("")
      setDescription("")
      setPrice("")
      setSelectedEbooks([])
      setShowForm(false)
      fetchBundles()
    } else {
      const data = await res.json()
      toast.error(data.error || "Erro ao criar")
    }
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/admin/bundles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    })
    fetchBundles()
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza?")) return
    const res = await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Bundle removido")
      fetchBundles()
    } else {
      toast.error("Erro ao remover")
    }
  }

  function toggleEbook(id: string) {
    setSelectedEbooks((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Bundles</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Bundle
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Novo Bundle</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Titulo do bundle" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input type="number" step="0.01" placeholder="Preço (R$)" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <Input placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div>
              <p className="text-sm font-medium mb-2">Selecionar E-books:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                {ebooks.map((ebook) => (
                  <label key={ebook.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedEbooks.includes(ebook.id)}
                      onChange={() => toggleEbook(ebook.id)}
                      className="rounded"
                    />
                    <span className="truncate">{ebook.title}</span>
                    <span className="text-muted-foreground ml-auto">{formatPrice(ebook.price)}</span>
                  </label>
                ))}
              </div>
              {selectedEbooks.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{selectedEbooks.length} selecionado(s)</p>
              )}
            </div>
            <Button onClick={handleCreate} disabled={!title.trim() || !price || selectedEbooks.length === 0}>
              Criar Bundle
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titulo</TableHead>
              <TableHead>E-books</TableHead>
              <TableHead className="text-right">Preco</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            ) : bundles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum bundle.</TableCell>
              </TableRow>
            ) : (
              bundles.map((bundle) => (
                <TableRow key={bundle.id}>
                  <TableCell className="font-medium">{bundle.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {bundle.items.map((item) => (
                        <Badge key={item.id} variant="outline" className="text-xs">{item.ebook.title}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatPrice(bundle.price)}</TableCell>
                  <TableCell>
                    <Switch checked={bundle.active} onCheckedChange={(v) => handleToggle(bundle.id, v)} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(bundle.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
