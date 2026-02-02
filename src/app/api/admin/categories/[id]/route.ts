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
    const denied = requirePermission(session, "category", "update")
    if (denied) return denied

    const { id } = await params
    const body = await request.json()

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.name ? slugify(body.name) : undefined,
        description: body.description,
        active: body.active,
        sortOrder: body.sortOrder,
      },
    })

    await createLog({
      userId: session!.user!.id,
      action: LogAction.UPDATE,
      resource: LogResource.CATEGORY,
      resourceId: id,
      description: `Categoria atualizada: ${category.name}`,
      request,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Category update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await auth()
    const denied = requirePermission(session, "category", "delete")
    if (denied) return denied

    const { id } = await params
    const category = await prisma.category.delete({ where: { id } })

    await createLog({
      userId: session!.user!.id,
      action: LogAction.DELETE,
      resource: LogResource.CATEGORY,
      resourceId: id,
      description: `Categoria removida: ${category.name}`,
      request,
    })

    return NextResponse.json({ message: "Removida" })
  } catch (error) {
    console.error("Category delete error:", error)
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 })
  }
}
