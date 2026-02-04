import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: { include: { items: { include: { ebook: { select: { title: true } } } } } },
      reviews: true,
      favorites: { include: { ebook: { select: { title: true } } } },
      downloads: true,
    },
  })

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  const { password: _password, ...userData } = user

  return new NextResponse(JSON.stringify(userData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=meus-dados.json",
    },
  })
}
