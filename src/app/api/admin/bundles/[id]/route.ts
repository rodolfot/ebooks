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
    const denied = requirePermission(session, "bundle", "update")
    if (denied) return denied

    const { id } = await params
    const body = await request.json()

    // Update bundle and replace items if provided
    const bundle = await prisma.bundle.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.title ? slugify(body.title) : undefined,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        originalPrice: body.originalPrice !== undefined ? (body.originalPrice ? parseFloat(body.originalPrice) : null) : undefined,
        coverUrl: body.coverUrl,
        active: body.active,
      },
    })

    if (body.ebookIds) {
      await prisma.bundleItem.deleteMany({ where: { bundleId: id } })
      await prisma.bundleItem.createMany({
        data: body.ebookIds.map((ebookId: string) => ({ bundleId: id, ebookId })),
      })
    }

    await createLog({
      userId: session!.user!.id,
      action: LogAction.UPDATE,
      resource: LogResource.BUNDLE,
      resourceId: id,
      description: `Bundle atualizado: ${bundle.title}`,
      request,
    })

    return NextResponse.json(bundle)
  } catch (error) {
    console.error("Bundle update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await auth()
    const denied = requirePermission(session, "bundle", "delete")
    if (denied) return denied

    const { id } = await params
    const bundle = await prisma.bundle.delete({ where: { id } })

    await createLog({
      userId: session!.user!.id,
      action: LogAction.DELETE,
      resource: LogResource.BUNDLE,
      resourceId: id,
      description: `Bundle removido: ${bundle.title}`,
      request,
    })

    return NextResponse.json({ message: "Removido" })
  } catch (error) {
    console.error("Bundle delete error:", error)
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 })
  }
}
