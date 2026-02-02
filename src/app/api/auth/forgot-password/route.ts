import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { forgotPasswordSchema } from "@/validations/auth"
import { sendEmail } from "@/lib/resend"
import { PasswordReset } from "@/emails/PasswordReset"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: "Se o email estiver cadastrado, você receberá um link de recuperação.",
    })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return successResponse

    // Generate token
    const rawToken = crypto.randomUUID()
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Store hashed token (expires in 1 hour)
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    })

    // Send email with raw token
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${appUrl}/redefinir-senha?token=${rawToken}&email=${encodeURIComponent(email)}`

    await sendEmail({
      to: email,
      subject: "Redefinir sua senha",
      react: PasswordReset({
        name: user.name || "Usuário",
        resetUrl,
      }),
    })

    return successResponse
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
