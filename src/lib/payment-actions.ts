import { prisma } from "./prisma"
import { generateDownloadToken } from "./download-token"
import { sendEmail } from "./resend"
import { createNotification } from "./notifications"

export async function processSuccessfulPayment(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { ebook: true } },
      user: true,
      coupon: true,
    },
  })

  if (!order) return

  const alreadyPaid = order.status === "PAID"

  if (!alreadyPaid) {
    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", paidAt: new Date() },
    })

    // Record coupon usage
    if (order.couponId) {
      await prisma.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } },
      })

      await prisma.couponUsage.create({
        data: {
          couponId: order.couponId,
          userId: order.userId,
          orderId: order.id,
        },
      }).catch(() => {})
    }
  }

  // Increment sales counts
  for (const item of order.items) {
    await prisma.ebook.update({
      where: { id: item.ebookId },
      data: { salesCount: { increment: 1 } },
    })
  }

  // Generate download tokens
  const downloadLinks = order.items.map((item) => ({
    title: item.ebook.title,
    formats: ["pdf", "epub", "mobi"].map((format) => ({
      format,
      token: generateDownloadToken({
        userId: order.userId,
        ebookId: item.ebookId,
        format,
      }),
    })),
  }))

  // Send delivery email
  const recipientEmail = order.customerEmail || order.user.email
  if (recipientEmail) {
    try {
      const { DeliveryEmail } = await import("@/emails/DeliveryEmail")
      await sendEmail({
        to: recipientEmail,
        subject: `Seus e-books estão prontos! Pedido #${order.id.slice(0, 8)}`,
        react: DeliveryEmail({
          customerName: order.customerName || order.user.name || "Leitor",
          orderId: order.id,
          items: downloadLinks,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        }),
      })
    } catch (error) {
      console.error("Failed to send delivery email:", error)
    }
  }

  // Create notification
  createNotification({
    userId: order.userId,
    title: "Pedido confirmado!",
    message: `Seu pedido #${order.id.slice(0, 8)} foi confirmado. Acesse sua biblioteca para baixar seus e-books.`,
    type: "success",
    link: "/biblioteca",
  })

  // Handle referral reward for first purchase
  try {
    const orderCount = await prisma.order.count({
      where: { userId: order.userId, status: "PAID" },
    })
    if (orderCount === 1) {
      const referral = await prisma.referral.findFirst({
        where: { referredId: order.userId, status: "pending" },
      })
      if (referral) {
        // Create reward coupon for referrer
        const couponCode = `REF-${referral.referrerId.slice(0, 6).toUpperCase()}-${Date.now().toString(36)}`
        const coupon = await prisma.coupon.create({
          data: {
            code: couponCode,
            discountType: "PERCENTAGE",
            discountValue: 15,
            maxUses: 1,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })
        await prisma.referral.update({
          where: { id: referral.id },
          data: { status: "completed", couponId: coupon.id },
        })
        createNotification({
          userId: referral.referrerId,
          title: "Indicação recompensada!",
          message: `Alguém que você indicou fez uma compra! Use o cupom ${couponCode} para 15% de desconto.`,
          type: "success",
          link: "/configuracoes",
        })
      }
    }
  } catch (error) {
    console.error("Referral processing error:", error)
  }

  return { order, downloadLinks }
}
