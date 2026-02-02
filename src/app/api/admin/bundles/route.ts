import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/permissions"
import { createLog, LogAction, LogResource } from "@/lib/audit"
import { slugify } from "@/lib/utils"

export async function GET() {
  try {
    const session = await auth()
    const denied = requirePermission(session, "bundle", "view")
    if (denied) return denied

    const bundles = await prisma.bundle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { ebook: { select: { id: true, title: true, price: true } } } },
      },
    })
    return NextResponse.json(bundles)
  } catch (error) {
    console.error("Bundles fetch error:", error)
    return NextResponse.json({ error: "Erro ao buscar bundles" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const denied = requirePermission(session, "bundle", "create")
    if (denied) return denied

    const body = await request.json()
    const { title, description, price, originalPrice, coverUrl, active, ebookIds } = body

    if (!title || !price || !ebookIds?.length) {
      return NextResponse.json({ error: "Título, preço e ebooks são obrigatórios" }, { status: 400 })
    }

    const bundle = await prisma.bundle.create({
      data: {
        title,
        slug: slugify(title),
        description: description || null,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        coverUrl: coverUrl || null,
        active: active !== false,
        items: {
          create: ebookIds.map((ebookId: string) => ({ ebookId })),
        },
      },
      include: { items: { include: { ebook: { select: { id: true, title: true } } } } },
    })

    await createLog({
      userId: session!.user!.id,
      action: LogAction.CREATE,
      resource: LogResource.BUNDLE,
      resourceId: bundle.id,
      description: `Bundle criado: ${title} (${ebookIds.length} ebooks)`,
      request,
    })

    return NextResponse.json(bundle, { status: 201 })
  } catch (error) {
    console.error("Bundle create error:", error)
    return NextResponse.json({ error: "Erro ao criar bundle" }, { status: 500 })
  }
}
