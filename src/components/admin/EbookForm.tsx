"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { slugify } from "@/lib/utils"
import { ImageUpload } from "@/components/admin/ImageUpload"

const fallbackCategories = [
  "Programação", "Marketing Digital", "Empreendedorismo",
  "Finanças Pessoais", "Produtividade", "Inteligência Artificial",
]

interface EbookFormProps {
  ebook?: {
    id: string
    title: string
    slug: string
    author: string
    description: string
    shortDescription: string | null
    price: number
    originalPrice: number | null
    category: string
    tags: string[]
    pages: number | null
    isbn: string | null
    publisher: string | null
    status: string
    featured: boolean
    metaTitle: string | null
    metaDescription: string | null
  }
}

export function EbookForm({ ebook }: EbookFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>(fallbackCategories)

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: { name: string }[]) => {
        if (data.length > 0) setCategories(data.map((c) => c.name))
      })
      .catch(() => {})
  }, [])
  const [title, setTitle] = useState(ebook?.title || "")
  const [slug, setSlug] = useState(ebook?.slug || "")
  const [author, setAuthor] = useState(ebook?.author || "")
  const [description, setDescription] = useState(ebook?.description || "")
  const [shortDescription, setShortDescription] = useState(ebook?.shortDescription || "")
  const [price, setPrice] = useState(ebook?.price?.toString() || "")
  const [originalPrice, setOriginalPrice] = useState(ebook?.originalPrice?.toString() || "")
  const [category, setCategory] = useState(ebook?.category || "")
  const [tags, setTags] = useState(ebook?.tags?.join(", ") || "")
  const [pages, setPages] = useState(ebook?.pages?.toString() || "")
  const [isbn, setIsbn] = useState(ebook?.isbn || "")
  const [publisher, setPublisher] = useState(ebook?.publisher || "")
  const [status, setStatus] = useState(ebook?.status || "DRAFT")
  const [featured, setFeatured] = useState(ebook?.featured || false)
  const [coverUrl, setCoverUrl] = useState("")

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!ebook) setSlug(slugify(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const data = {
      title, slug, author, description, shortDescription,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      category, tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      pages: pages ? parseInt(pages) : null,
      isbn: isbn || null, publisher: publisher || null,
      status, featured,
      coverUrl: coverUrl || null,
    }

    try {
      const url = ebook ? `/api/admin/ebooks/${ebook.id}` : "/api/admin/ebooks"
      const method = ebook ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success(ebook ? "E-book atualizado!" : "E-book criado!")
        router.push("/admin/ebooks")
        router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error || "Erro ao salvar")
      }
    } catch {
      toast.error("Erro ao salvar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Autor</Label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição Curta</Label>
            <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descrição Completa</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} required />
          </div>
          <div className="space-y-2">
            <Label>Tags (separadas por vírgula)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preço e Detalhes</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Preço (R$)</Label>
            <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Preço Original (R$)</Label>
            <Input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Páginas</Label>
            <Input type="number" value={pages} onChange={(e) => setPages(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>ISBN</Label>
            <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Editora</Label>
            <Input value={publisher} onChange={(e) => setPublisher(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="PUBLISHED">Publicado</SelectItem>
                <SelectItem value="ARCHIVED">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Imagem de Capa</CardTitle></CardHeader>
        <CardContent>
          <ImageUpload
            onUpload={(url) => setCoverUrl(url)}
            currentUrl={coverUrl}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={featured} onCheckedChange={setFeatured} />
          <Label>Destaque</Label>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : ebook ? "Atualizar" : "Criar E-book"}
        </Button>
      </div>
    </form>
  )
}
