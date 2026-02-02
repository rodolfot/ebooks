"use client"

import { useEffect, useRef } from "react"

/**
 * Fire-and-forget page view log for client components.
 * Uses useRef to prevent double execution in StrictMode.
 */
export function useLogPageView(pageName: string) {
  const logged = useRef(false)

  useEffect(() => {
    if (logged.current) return
    logged.current = true

    fetch("/api/admin/log-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pageName }),
    }).catch(() => {
      // silently ignore
    })
  }, [pageName])
}
