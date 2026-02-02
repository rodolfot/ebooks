import { prisma } from "./prisma"
import { LogAction, LogResource } from "@/generated/prisma/client"
import type { Prisma } from "@/generated/prisma/client"

export { LogAction, LogResource }

interface CreateLogInput {
  userId?: string
  action: LogAction
  resource: LogResource
  resourceId?: string
  description?: string
  metadata?: Record<string, unknown>
  changedFields?: string[]
  errorMessage?: string
  request?: Request
  endpoint?: string
  duration?: number
  statusCode?: number
}

export async function createLog(input: CreateLogInput) {
  try {
    let ip: string | undefined
    let userAgent: string | undefined
    let method: string | undefined
    let endpoint: string | undefined = input.endpoint

    if (input.request) {
      ip =
        input.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        input.request.headers.get("x-real-ip") ||
        undefined
      userAgent = input.request.headers.get("user-agent") || undefined
      method = input.request.method
      if (!endpoint) {
        try {
          endpoint = new URL(input.request.url).pathname
        } catch {
          endpoint = undefined
        }
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        description: input.description,
        ip,
        userAgent,
        method,
        endpoint,
        statusCode: input.statusCode,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? undefined,
        changedFields: input.changedFields ?? [],
        errorMessage: input.errorMessage,
        duration: input.duration,
      },
    })
  } catch (error) {
    console.error("Failed to write activity log:", error)
  }
}
