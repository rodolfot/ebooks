"use client"

import { useState, useRef, useCallback } from "react"
import { X, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ImageUploadProps {
  onUpload: (url: string, thumbnailUrl: string) => void
  currentUrl?: string
}

export function ImageUpload({ onUpload, currentUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast.error("Formato invalido. Use JPEG, PNG ou WebP.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Maximo 10MB.")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const { url, thumbnailUrl } = await res.json()
        setPreview(url)
        onUpload(url, thumbnailUrl)
        toast.success("Imagem enviada!")
      } else {
        const err = await res.json()
        toast.error(err.error || "Erro ao enviar imagem")
      }
    } catch {
      toast.error("Erro ao enviar imagem")
    } finally {
      setUploading(false)
    }
  }, [onUpload])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleRemove() {
    setPreview(null)
    onUpload("", "")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="w-40 h-52 object-cover rounded-lg border" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
          ) : (
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading ? "Enviando..." : "Arraste uma imagem ou clique para selecionar"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">JPEG, PNG ou WebP - Max 10MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
