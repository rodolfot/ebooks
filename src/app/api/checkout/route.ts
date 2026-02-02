import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkoutSchema } from "@/validations/checkout"
import { createPixPayment } from "@/lib/payments/pix"
import { createCardPayment } from "@/lib/payments/credit-card"
import { createCryptoPayment } from "@/lib/payments/crypto"
import { processSuccessfulPayment } from "@/lib/payment-actions"

export async function POST(request: Request) {
  let order: { id: string } | null = null
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 })
    }

    const body = await request.json()
    const data = checkoutSchema.parse(body)

    // Validate ebook prices
    const ebookIds = data.items.map((i) => i.ebookId)
    const ebooks = await prisma.ebook.findMany({
      where: { id: { in: ebookIds }, status: "PUBLISHED" },
    })

    if (ebooks.length !== data.items.length) {
      return NextResponse.json({ error: "E-book não encontrado ou indisponível" }, { status: 400 })
    }

    let subtotal = 0
    const orderItems = ebooks.map((ebook) => {
      subtotal += ebook.price
      return { ebookId: ebook.id, price: ebook.price }
    })

    // Apply coupon
    let discount = 0
    let couponId: string | null = null
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode } })
      if (coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          if (!coupon.minPurchase || subtotal >= coupon.minPurchase) {
            couponId = coupon.id
            discount = coupon.discountType === "PERCENTAGE"
              ? subtotal * (coupon.discountValue / 100)
              : Math.min(coupon.discountValue, subtotal)
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discount)

    // Free order path: coupon covers entire amount
    if (total === 0 || data.paymentMethod === "FREE_COUPON") {
      if (total > 0 && data.paymentMethod === "FREE_COUPON") {
        return NextResponse.json({ error: "Pagamento gratuito nao permitido para este valor" }, { status: 400 })
      }

      const freeOrder = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          paymentMethod: "FREE_COUPON",
          total: 0,
          discount,
          couponId,
          customerEmail: data.customerEmail || session.user.email,
          customerName: data.customerName || session.user.name,
          customerCpf: data.customerCpf,
          items: { create: orderItems },
        },
      })

      await processSuccessfulPayment(freeOrder.id)

      return NextResponse.json({
        orderId: freeOrder.id,
        paymentMethod: "FREE_COUPON",
        status: "approved",
      })
    }

    // Create order
    order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        paymentMethod: data.paymentMethod,
        total,
        discount,
        couponId,
        customerEmail: data.customerEmail || session.user.email,
        customerName: data.customerName || session.user.name,
        customerCpf: data.customerCpf,
        items: { create: orderItems },
      },
    })

    // Process payment
    const description = `筆言葉 Fude kotoba - Pedido #${order.id.slice(0, 8)}`

    switch (data.paymentMethod) {
      case "PIX": {
        const pix = await createPixPayment({
          amount: total,
          description,
          orderId: order.id,
          payerEmail: data.customerEmail || session.user.email!,
          payerCpf: data.customerCpf,
        })

        await prisma.order.update({
          where: { id: order.id },
          data: { paymentId: pix.paymentId, status: "PROCESSING" },
        })

        return NextResponse.json({
          orderId: order.id,
          paymentMethod: "PIX",
          qrCode: pix.qrCode,
          qrCodeBase64: pix.qrCodeBase64,
          expiresAt: pix.expiresAt,
        })
      }

      case "CREDIT_CARD": {
        if (!data.cardToken) {
          return NextResponse.json({ error: "Token do cartão necessário" }, { status: 400 })
        }

        const card = await createCardPayment({
          amount: total,
          description,
          orderId: order.id,
          token: data.cardToken,
          installments: data.installments || 1,
          payerEmail: data.customerEmail || session.user.email!,
          payerCpf: data.customerCpf,
        })

        await prisma.order.update({
          where: { id: order.id },
          data: { paymentId: card.paymentId, status: card.status === "approved" ? "PAID" : "PROCESSING" },
        })

        if (card.status === "approved") {
          await processSuccessfulPayment(order.id)
        }

        return NextResponse.json({
          orderId: order.id,
          paymentMethod: "CREDIT_CARD",
          status: card.status,
        })
      }

      case "CRYPTO": {
        const crypto = await createCryptoPayment({
          amount: total,
          description,
          orderId: order.id,
        })

        await prisma.order.update({
          where: { id: order.id },
          data: { paymentId: crypto.chargeId, status: "PROCESSING" },
        })

        return NextResponse.json({
          orderId: order.id,
          paymentMethod: "CRYPTO",
          chargeUrl: crypto.chargeUrl,
        })
      }
    }
  } catch (error: unknown) {
    console.error("Checkout error:", error)
    if (order?.id) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      }).catch(() => {})
    }
    return NextResponse.json({ error: "Erro no checkout" }, { status: 500 })
  }
}
