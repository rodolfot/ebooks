import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/validations/auth"
import { sendEmail } from "@/lib/resend"
import { WelcomeEmail } from "@/emails/WelcomeEmail"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12)
    const referralCode = crypto.randomBytes(4).toString("hex")

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        cpf: validated.cpf || null,
        referralCode,
      },
    })

    // Create welcome coupon (10% off, single use, 30 days)
    let couponCode: string | undefined
    try {
      couponCode = `WELCOME-${user.id.slice(0, 6).toUpperCase()}`
      await prisma.coupon.create({
        data: {
          code: couponCode,
          discountType: "PERCENTAGE",
          discountValue: 10,
          maxUses: 1,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    } catch {
      couponCode = undefined
    }

    // Handle referral tracking
    const ref = body.ref as string | undefined
    if (ref) {
      try {
        const referrer = await prisma.user.findUnique({
          where: { referralCode: ref },
        })
        if (referrer) {
          await prisma.referral.create({
            data: {
              referrerId: referrer.id,
              referredId: user.id,
              status: "pending",
            },
          })
        }
      } catch {
        // Referral creation failed, continue
      }
    }

    // Send welcome email
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      await sendEmail({
        to: validated.email,
        subject: "Bem-vindo à 筆言葉 Fude kotoba!",
        react: WelcomeEmail({ name: validated.name, appUrl, couponCode }),
      })
    } catch {
      // Email send failed, continue
    }

    return NextResponse.json(
      { message: "Conta criada com sucesso", userId: user.id },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
