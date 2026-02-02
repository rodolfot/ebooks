import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/permissions"
import { createLog, LogAction, LogResource } from "@/lib/audit"
import { slugify } from "@/lib/utils"

export async function GET() {
  try {
    const session = await auth()
    const denied = requirePermission(session, "category", "view")
    if (denied) return denied

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const denied = requirePermission(session, "category", "create")
    if (denied) return denied

    const body = await request.json()
    const { name, description, active, sortOrder } = body

    if (!name) {
      return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        description: description || null,
        active: active !== false,
        sortOrder: sortOrder || 0,
      },
    })

    await createLog({
      userId: session!.user!.id,
      action: LogAction.CREATE,
      resource: LogResource.CATEGORY,
      resourceId: category.id,
      description: `Categoria criada: ${name}`,
      request,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Category create error:", error)
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 })
  }
}
