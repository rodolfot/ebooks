import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/permissions"
import { createLog, LogAction, LogResource } from "@/lib/audit"
import { slugify } from "@/lib/utils"

interface Props {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const session = await auth()
    const denied = requirePermission(session, "author", "update")
    if (denied) return denied

    const { id } = await params
    const body = await request.json()

    const author = await prisma.author.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.name ? slugify(body.name) : undefined,
        bio: body.bio,
        imageUrl: body.imageUrl,
      },
    })

    await createLog({
      userId: session!.user!.id,
      action: LogAction.UPDATE,
      resource: LogResource.AUTHOR,
      resourceId: id,
      description: `Autor atualizado: ${author.name}`,
      request,
    })

    return NextResponse.json(author)
  } catch (error) {
    console.error("Author update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await auth()
    const denied = requirePermission(session, "author", "delete")
    if (denied) return denied

    const { id } = await params
    const author = await prisma.author.delete({ where: { id } })

    await createLog({
      userId: session!.user!.id,
      action: LogAction.DELETE,
      resource: LogResource.AUTHOR,
      resourceId: id,
      description: `Autor removido: ${author.name}`,
      request,
    })

    return NextResponse.json({ message: "Removido" })
  } catch (error) {
    console.error("Author delete error:", error)
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 })
  }
}
