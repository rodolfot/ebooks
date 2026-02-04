"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { User, Camera, Loader2 } from "lucide-react"
import Image from "next/image"

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
    cpf: string | null
    image: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [name, setName] = useState(user.name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [avatarUrl, setAvatarUrl] = useState(user.image)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })
      if (res.ok) {
        toast.success("Perfil atualizado!")
        router.refresh()
      } else {
        toast.error("Erro ao atualizar perfil")
      }
    } catch {
      toast.error("Erro ao atualizar perfil")
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setAvatarUrl(data.url)
        toast.success("Foto atualizada!")
        router.refresh()
      } else {
        toast.error(data.error || "Erro ao enviar foto")
      }
    } catch {
      toast.error("Erro ao enviar foto")
    } finally {
      setAvatarLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleExportData() {
    const res = await fetch("/api/user/data-export")
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "meus-dados.json"
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Dados exportados!")
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Tem certeza que deseja excluir sua conta? Esta acao e irreversivel.")) return
    const res = await fetch("/api/user/data-deletion", { method: "POST" })
    if (res.ok) {
      toast.success("Conta excluida")
      window.location.href = "/"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Foto de Perfil</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Foto de perfil"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                {avatarLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>
            <div>
              <p className="text-sm font-medium">Alterar foto</p>
              <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP. Maximo 5MB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dados Pessoais</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alteracoes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>LGPD - Seus Dados</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Em conformidade com a LGPD, voce pode exportar ou excluir seus dados a qualquer momento.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleExportData}>Exportar Meus Dados</Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Excluir Conta</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
