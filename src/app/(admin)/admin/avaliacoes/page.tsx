"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StarRating } from "@/components/shared/StarRating"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { useLogPageView } from "@/hooks/useLogPageView"

interface Review {
  id: string
  rating: number
  comment: string | null
  approved: boolean
  createdAt: string
  user: { name: string | null; email: string }
  ebook: { title: string }
}

export default function AdminReviewsPage() {
  useLogPageView("Avaliacoes")
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then(setReviews)
  }, [])

  async function handleAction(id: string, approved: boolean) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    })
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)))
      toast.success(approved ? "Aprovada!" : "Rejeitada!")
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" })
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success("Excluída!")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Avaliações</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>E-book</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Comentário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell className="font-medium">{review.ebook.title}</TableCell>
              <TableCell>{review.user.name || review.user.email}</TableCell>
              <TableCell><StarRating rating={review.rating} size="sm" /></TableCell>
              <TableCell className="max-w-xs truncate">{review.comment || "-"}</TableCell>
              <TableCell>
                <Badge variant={review.approved ? "default" : "secondary"}>
                  {review.approved ? "Aprovada" : "Pendente"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {!review.approved && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(review.id, true)}>Aprovar</Button>
                  )}
                  {review.approved && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(review.id, false)}>Rejeitar</Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(review.id)}>Excluir</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
