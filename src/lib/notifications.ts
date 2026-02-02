import { prisma } from "./prisma"

interface CreateNotificationInput {
  userId: string
  title: string
  message: string
  type?: string
  link?: string
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type || "info",
        link: input.link || null,
      },
    })
  } catch (error) {
    console.error("Failed to create notification:", error)
  }
}
