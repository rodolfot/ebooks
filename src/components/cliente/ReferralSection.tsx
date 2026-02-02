"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Copy, Gift, Users } from "lucide-react"

interface ReferralSectionProps {
  referralCode: string
  referralCount: number
  completedCount: number
}

export function ReferralSection({ referralCode, referralCount, completedCount }: ReferralSectionProps) {
  const appUrl = typeof window !== "undefined" ? window.location.origin : ""
  const referralLink = `${appUrl}/cadastro?ref=${referralCode}`
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success("Link copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" /> Programa de Indicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Indique amigos e ganhe cupons de 15% de desconto quando eles fizerem a primeira compra!
        </p>
        <div className="flex gap-2">
          <Input value={referralLink} readOnly className="font-mono text-sm" />
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-1" /> {copied ? "Copiado!" : "Copiar"}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-3 text-center">
            <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{referralCount}</p>
            <p className="text-xs text-muted-foreground">Indicações</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <Gift className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
