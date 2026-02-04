"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface PixPaymentProps {
  orderId: string
  qrCode: string
  qrCodeBase64: string
  onPaid: () => void
}

export function PixPayment({ orderId, qrCode, qrCodeBase64, onPaid }: PixPaymentProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status/${orderId}`)
        const data = await res.json()
        if (data.status === "PAID") {
          clearInterval(pollInterval)
          onPaid()
        }
      } catch {}
    }, 5000)
    return () => clearInterval(pollInterval)
  }, [orderId, onPaid])

  function handleCopy() {
    navigator.clipboard.writeText(qrCode)
    setCopied(true)
    toast.success("Código PIX copiado!")
    setTimeout(() => setCopied(false), 3000)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Pagar com PIX</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="text-sm text-muted-foreground">
          Escaneie o QR Code ou copie o código PIX
        </div>

        {qrCodeBase64 && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code PIX"
              className="w-48 h-48"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="bg-muted p-3 rounded-md text-xs break-all font-mono">
            {qrCode}
          </div>
          <Button variant="outline" onClick={handleCopy} className="w-full">
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copiado!" : "Copiar código PIX"}
          </Button>
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground">Expira em: </span>
          <span className="font-mono font-semibold">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          Aguardando confirmação do pagamento...
        </div>
      </CardContent>
    </Card>
  )
}
