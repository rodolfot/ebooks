"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/admin/ImageUpload"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useLogPageView } from "@/hooks/useLogPageView"

interface UploadedImage {
  url: string
  thumbnailUrl: string
}

export default function AdminMediaPage() {
  useLogPageView("Midias")
  const [images, setImages] = useState<UploadedImage[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  function handleUpload(url: string, thumbnailUrl: string) {
    if (url) {
      setImages((prev) => [{ url, thumbnailUrl }, ...prev])
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast.success("URL copiada!")
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Midias</h1>

      <Card>
        <CardHeader><CardTitle>Enviar Imagem</CardTitle></CardHeader>
        <CardContent>
          <ImageUpload onUpload={handleUpload} />
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Imagens Enviadas</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((img) => (
                <div key={img.url} className="group relative">
                  <img
                    src={img.thumbnailUrl || img.url}
                    alt="Uploaded"
                    className="w-full aspect-[3/4] object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyUrl(img.url)}
                    >
                      {copiedUrl === img.url ? (
                        <><Check className="h-3 w-3 mr-1" /> Copiado</>
                      ) : (
                        <><Copy className="h-3 w-3 mr-1" /> Copiar URL</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
