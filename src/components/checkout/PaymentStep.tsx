"use client"

import { useState } from "react"
import { useCartStore } from "@/stores/cart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { PixPayment } from "./PixPayment"
import { Gift } from "lucide-react"

interface PaymentStepProps {
  onSuccess: (orderId: string) => void
  onProcessing: (orderId: string) => void
}

export function PaymentStep({ onSuccess, onProcessing }: PaymentStepProps) {
  const { items, couponCode, clearCart, total } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<{ orderId: string; qrCode: string; qrCodeBase64: string } | null>(null)
  const [boletoData, setBoletoData] = useState<{ orderId: string; boletoUrl: string; barcode: string } | null>(null)

  const cartTotal = total()

  async function handlePayment(method: "PIX" | "CREDIT_CARD" | "CRYPTO" | "BOLETO" | "FREE_COUPON") {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ ebookId: i.id, price: i.price })),
          paymentMethod: method,
          couponCode: couponCode || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro no pagamento")
        return
      }

      switch (method) {
        case "FREE_COUPON":
          clearCart()
          onSuccess(data.orderId)
          break
        case "PIX":
          setPixData({
            orderId: data.orderId,
            qrCode: data.qrCode,
            qrCodeBase64: data.qrCodeBase64,
          })
          break
        case "CREDIT_CARD":
          if (data.status === "approved") {
            clearCart()
            onSuccess(data.orderId)
          } else {
            onProcessing(data.orderId)
          }
          break
        case "CRYPTO":
          if (data.chargeUrl) {
            window.location.href = data.chargeUrl
          }
          break
        case "BOLETO":
          setBoletoData({
            orderId: data.orderId,
            boletoUrl: data.boletoUrl,
            barcode: data.barcode,
          })
          break
      }
    } catch {
      toast.error("Erro ao processar pagamento")
    } finally {
      setLoading(false)
    }
  }

  if (pixData) {
    return (
      <PixPayment
        orderId={pixData.orderId}
        qrCode={pixData.qrCode}
        qrCodeBase64={pixData.qrCodeBase64}
        onPaid={() => {
          clearCart()
          onSuccess(pixData.orderId)
        }}
      />
    )
  }

  if (boletoData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Boleto Gerado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Seu boleto foi gerado. O pagamento pode levar até 3 dias úteis para ser confirmado.
          </p>
          {boletoData.barcode && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Código de barras:</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted p-2 rounded text-xs break-all">{boletoData.barcode}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(boletoData.barcode)
                    toast.success("Código copiado!")
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
          )}
          {boletoData.boletoUrl && (
            <a href={boletoData.boletoUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full">Abrir Boleto</Button>
            </a>
          )}
        </CardContent>
      </Card>
    )
  }

  if (cartTotal === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedido Gratuito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg text-center">
            <Gift className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <p className="text-lg font-semibold text-green-700 dark:text-green-400">
              Seu pedido e 100% gratis!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              O cupom aplicado cobre o valor total. Nenhum pagamento sera processado.
            </p>
          </div>
          <Button
            onClick={() => handlePayment("FREE_COUPON")}
            disabled={loading}
            className="w-full cta-gradient text-white border-0"
            size="lg"
          >
            {loading ? "Processando..." : "Finalizar Pedido Gratuito"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forma de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pix">
          <TabsList className="w-full">
            <TabsTrigger value="pix" className="flex-1">PIX</TabsTrigger>
            <TabsTrigger value="card" className="flex-1">Cartao</TabsTrigger>
            <TabsTrigger value="boleto" className="flex-1">Boleto</TabsTrigger>
            <TabsTrigger value="crypto" className="flex-1">Crypto</TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Pague instantaneamente via PIX. O QR code sera gerado apos confirmar.
            </p>
            <Button onClick={() => handlePayment("PIX")} disabled={loading} className="w-full">
              {loading ? "Gerando PIX..." : "Pagar com PIX"}
            </Button>
          </TabsContent>

          <TabsContent value="card" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Pagamento com cartao de credito processado pelo Mercado Pago. Parcelamento disponivel.
            </p>
            <Button onClick={() => handlePayment("CREDIT_CARD")} disabled={loading} className="w-full">
              {loading ? "Processando..." : "Pagar com Cartao"}
            </Button>
          </TabsContent>

          <TabsContent value="boleto" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Pague com boleto bancário. O prazo de compensação é de até 3 dias úteis. CPF obrigatório.
            </p>
            <Button onClick={() => handlePayment("BOLETO")} disabled={loading} className="w-full">
              {loading ? "Gerando boleto..." : "Gerar Boleto"}
            </Button>
          </TabsContent>

          <TabsContent value="crypto" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Pague com Bitcoin, Ethereum ou outras criptomoedas via Coinbase Commerce.
            </p>
            <Button onClick={() => handlePayment("CRYPTO")} disabled={loading} className="w-full">
              {loading ? "Redirecionando..." : "Pagar com Crypto"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
