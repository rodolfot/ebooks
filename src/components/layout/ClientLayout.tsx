"use client"

import { useEffect } from "react"
import { AuthProvider } from "@/providers/AuthProvider"
import { AnalyticsProvider } from "@/providers/AnalyticsProvider"
import { Toaster } from "@/components/ui/sonner"
import { CookieConsent } from "@/components/marketing/CookieConsent"
import { ExitIntentPopup } from "@/components/marketing/ExitIntentPopup"
import { WhatsAppButton } from "@/components/shared/WhatsAppButton"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }
  }, [])
  return (
    <AuthProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <WhatsAppButton />
      <Toaster richColors position="bottom-right" closeButton />
      <CookieConsent />
      <ExitIntentPopup />
      <AnalyticsProvider />
    </AuthProvider>
  )
}
