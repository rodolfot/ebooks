import { auth } from "@/lib/auth"
import { createLog } from "@/lib/audit"

/**
 * Fire-and-forget page view log for server components.
 * Does not block rendering.
 */
export function logPageView(pageName: string, endpoint: string) {
  auth().then((session) => {
    if (!session?.user?.id) return
    createLog({
      userId: session.user.id,
      action: "VIEW",
      resource: "PAGE",
      description: `Acessou ${pageName}`,
      endpoint,
    })
  }).catch(() => {
    // silently ignore - logging should never break the page
  })
}
