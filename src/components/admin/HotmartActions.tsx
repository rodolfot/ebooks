"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Pencil, ToggleLeft, ToggleRight, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/admin/ImageUpload"

interface Ad {
  id: string
  title: string
  targetUrl: string
  position: string
  active: boolean
  imageUrl?: string | null
  coverImageUrl?: string | null
  productType?: string | null
  price?: number | null
}

interface HotmartActionsProps {
  ad: Ad
  onUpdate: () => void
}

export function HotmartActions({ ad, onUpdate }: HotmartActionsProps) {
  const [loading, setLoading] = useState<"edit" | "toggle" | "delete" | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [title, setTitle] = useState(ad.title)
  const [targetUrl, setTargetUrl] = useState(ad.targetUrl)
  const [position, setPosition] = useState(ad.position)
  const [productType, setProductType] = useState(ad.productType || "ad")
  const [price, setPrice] = useState(ad.price != null ? ad.price.toFixed(2) : "")
  const [imageUrl, setImageUrl] = useState(ad.imageUrl || "")
  const [coverImageUrl, setCoverImageUrl] = useState(ad.coverImageUrl || "")

  async function handleToggle() {
    setLoading("toggle")
    try {
      const res = await fetch(`/api/admin/hotmart/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !ad.active }),
      })
      if (res.ok) {
        toast.success(ad.active ? "Anuncio desativado" : "Anuncio ativado")
        onUpdate()
      } else {
        toast.error("Erro ao atualizar anuncio")
      }
    } catch {
      toast.error("Erro ao atualizar anuncio")
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este anuncio? Esta acao e irreversivel.")) return
    setLoading("delete")
    try {
      const res = await fetch(`/api/admin/hotmart/${ad.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Anuncio excluido")
        onUpdate()
      } else {
        toast.error("Erro ao excluir anuncio")
      }
    } catch {
      toast.error("Erro ao excluir anuncio")
    } finally {
      setLoading(null)
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setLoading("edit")
    try {
      const res = await fetch(`/api/admin/hotmart/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          targetUrl,
          position,
          productType,
          price: price ? parseFloat(price) : null,
          imageUrl: imageUrl || null,
          coverImageUrl: coverImageUrl || null,
        }),
      })
      if (res.ok) {
        toast.success("Anuncio atualizado")
        setEditOpen(false)
        onUpdate()
      } else {
        toast.error("Erro ao atualizar anuncio")
      }
    } catch {
      toast.error("Erro ao atualizar anuncio")
    } finally {
      setLoading(null)
    }
  }

  function openEdit() {
    setTitle(ad.title)
    setTargetUrl(ad.targetUrl)
    setPosition(ad.position)
    setProductType(ad.productType || "ad")
    setPrice(ad.price != null ? ad.price.toFixed(2) : "")
    setImageUrl(ad.imageUrl || "")
    setCoverImageUrl(ad.coverImageUrl || "")
    setEditOpen(true)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={openEdit}
          disabled={loading !== null}
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          disabled={loading !== null}
          title={ad.active ? "Desativar" : "Ativar"}
        >
          {loading === "toggle" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : ad.active ? (
            <ToggleRight className="h-4 w-4 text-green-600" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={loading !== null}
          title="Excluir"
        >
          {loading === "delete" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Anuncio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Titulo</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Posicao</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner (Home)</SelectItem>
                  <SelectItem value="sidebar">Sidebar (Detalhe)</SelectItem>
                  <SelectItem value="inline">Inline (Catalogo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Imagem do Anuncio</Label>
              <ImageUpload
                currentUrl={imageUrl || undefined}
                onUpload={(url, thumbUrl) => {
                  setImageUrl(url)
                  setCoverImageUrl(thumbUrl)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Produto</Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ad">Anuncio (Banner/Sidebar)</SelectItem>
                  <SelectItem value="ebook">E-book (Aparece no Catalogo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {productType === "ebook" && (
              <div className="space-y-2">
                <Label>Preco (R$)</Label>
                <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="49.90" />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading === "edit"}>
                {loading === "edit" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
