"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Trash2, Plus } from "lucide-react"
import { useLogPageView } from "@/hooks/useLogPageView"

interface Author {
  id: string
  name: string
  slug: string
  bio: string | null
  imageUrl: string | null
  _count: { ebooks: number }
}

export default function AdminAutoresPage() {
  useLogPageView("Autores")
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newBio, setNewBio] = useState("")

  const fetchAuthors = useCallback(async () => {
    const res = await fetch("/api/admin/authors")
    if (res.ok) setAuthors(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAuthors() }, [fetchAuthors])

  async function handleCreate() {
    if (!newName.trim()) return
    const res = await fetch("/api/admin/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, bio: newBio || null }),
    })
    if (res.ok) {
      toast.success("Autor criado")
      setNewName("")
      setNewBio("")
      fetchAuthors()
    } else {
      const data = await res.json()
      toast.error(data.error || "Erro ao criar")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza?")) return
    const res = await fetch(`/api/admin/authors/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Autor removido")
      fetchAuthors()
    } else {
      toast.error("Erro ao remover")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Autores</h1>

      <Card>
        <CardHeader><CardTitle>Novo Autor</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Nome do autor" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Textarea placeholder="Biografia (opcional)" value={newBio} onChange={(e) => setNewBio(e.target.value)} rows={3} />
          <Button onClick={handleCreate} disabled={!newName.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Criar
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead className="text-right">E-books</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            ) : authors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum autor.</TableCell>
              </TableRow>
            ) : (
              authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell className="font-medium">{author.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{author.slug}</TableCell>
                  <TableCell className="text-sm max-w-[300px] truncate">{author.bio || "-"}</TableCell>
                  <TableCell className="text-right">{author._count.ebooks}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(author.id)}>
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
