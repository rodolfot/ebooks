import { createLog, LogAction, LogResource } from "./audit"

export function trackError(error: unknown, context?: Record<string, unknown>) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  console.error("[Error Tracked]", errorMessage, context)

  createLog({
    action: LogAction.ERROR,
    resource: LogResource.SYSTEM,
    description: errorMessage,
    errorMessage: stack || errorMessage,
    metadata: context,
  })
}
