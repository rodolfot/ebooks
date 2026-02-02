"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { HotmartActions } from "@/components/admin/HotmartActions"
import { useLogPageView } from "@/hooks/useLogPageView"

interface Ad {
  id: string
  title: string
  targetUrl: string
  position: string
  active: boolean
  clickCount: number
  imageUrl?: string | null
  coverImageUrl?: string | null
  productType?: string | null
  price?: number | null
}

export default function AdminHotmartPage() {
  useLogPageView("Hotmart Ads")
  const [ads, setAds] = useState<Ad[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [targetUrl, setTargetUrl] = useState("https://hotm.art/I0WwSyZ")
  const [position, setPosition] = useState("banner")
  const [productType, setProductType] = useState("ad")
  const [price, setPrice] = useState("")

  const refreshAds = useCallback(() => {
    fetch("/api/admin/hotmart").then((r) => r.ok ? r.json() : []).then(setAds)
  }, [])

  useEffect(() => {
    refreshAds()
  }, [refreshAds])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/hotmart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        targetUrl,
        position,
        active: true,
        productType,
        price: price ? parseFloat(price) : null,
      }),
    })
    if (res.ok) {
      setShowForm(false)
      setTitle("")
      toast.success("Anuncio criado!")
      refreshAds()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Hotmart Ads</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> Novo Anuncio</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Novo Anuncio</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <Button type="submit">Criar</Button>
            </form>
          </CardContent>
        </Card>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titulo</TableHead>
            <TableHead>Posicao</TableHead>
            <TableHead>Cliques</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell className="font-medium">{ad.title}</TableCell>
              <TableCell>{ad.position}</TableCell>
              <TableCell>{ad.clickCount}</TableCell>
              <TableCell><Badge variant={ad.active ? "default" : "secondary"}>{ad.active ? "Ativo" : "Inativo"}</Badge></TableCell>
              <TableCell>
                <HotmartActions ad={ad} onUpdate={refreshAds} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
