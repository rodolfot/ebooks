import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(_request: Request, { params }: Props) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 })
    }

    const { id } = await params

    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark read error:", error)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
