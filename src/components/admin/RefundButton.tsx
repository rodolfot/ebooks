"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { RotateCcw } from "lucide-react"

interface RefundButtonProps {
  orderId: string
}

export function RefundButton({ orderId }: RefundButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRefund() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro ao processar reembolso")
        return
      }
      toast.success("Reembolso processado com sucesso")
      setOpen(false)
      window.location.reload()
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" /> Reembolsar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Reembolso</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja reembolsar este pedido? Esta ação não pode ser desfeita.
            O valor será devolvido ao cliente pelo mesmo método de pagamento.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleRefund} disabled={loading}>
            {loading ? "Processando..." : "Confirmar Reembolso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
