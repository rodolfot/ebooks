"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Trash2, Plus } from "lucide-react"
import { useLogPageView } from "@/hooks/useLogPageView"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  active: boolean
  sortOrder: number
}

export default function AdminCategoriasPage() {
  useLogPageView("Categorias")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories")
    if (res.ok) setCategories(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  async function handleCreate() {
    if (!newName.trim()) return
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDescription || null }),
    })
    if (res.ok) {
      toast.success("Categoria criada")
      setNewName("")
      setNewDescription("")
      fetchCategories()
    } else {
      const data = await res.json()
      toast.error(data.error || "Erro ao criar")
    }
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    })
    fetchCategories()
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza?")) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Categoria removida")
      fetchCategories()
    } else {
      toast.error("Erro ao remover")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Categorias</h1>

      <Card>
        <CardHeader><CardTitle>Nova Categoria</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Input placeholder="Nome da categoria" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="flex-1 space-y-1">
              <Input placeholder="Descrição (opcional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            </div>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Criar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Ativa</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma categoria.</TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{cat.slug}</TableCell>
                  <TableCell className="text-sm">{cat.description || "-"}</TableCell>
                  <TableCell>
                    <Switch checked={cat.active} onCheckedChange={(v) => handleToggle(cat.id, v)} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>
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
