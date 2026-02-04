"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
      <h1 className="font-serif text-3xl font-bold mb-4">Algo deu errado</h1>
      <p className="text-muted-foreground mb-8">
        Ocorreu um erro inesperado. Por favor, tente novamente.
      </p>
      <div className="flex gap-4 justify-center">
        <Button onClick={reset}>Tentar Novamente</Button>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Voltar ao Início
        </Button>
      </div>
    </div>
  )
}
