import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resetPasswordSchema } from "@/validations/auth"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, token, password } = resetPasswordSchema.parse(body)

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: hashedToken,
        expires: { gt: new Date() },
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token inválido ou expirado. Solicite um novo link." },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Delete all tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    return NextResponse.json({ message: "Senha redefinida com sucesso." })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 })
  }
}
