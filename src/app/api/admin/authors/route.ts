import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/permissions"
import { createLog, LogAction, LogResource } from "@/lib/audit"
import { slugify } from "@/lib/utils"

export async function GET() {
  try {
    const session = await auth()
    const denied = requirePermission(session, "author", "view")
    if (denied) return denied

    const authors = await prisma.author.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { ebooks: true } } },
    })
    return NextResponse.json(authors)
  } catch (error) {
    console.error("Authors fetch error:", error)
    return NextResponse.json({ error: "Erro ao buscar autores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const denied = requirePermission(session, "author", "create")
    if (denied) return denied

    const body = await request.json()
    const { name, bio, imageUrl } = body

    if (!name) {
      return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })
    }

    const author = await prisma.author.create({
      data: {
        name,
        slug: slugify(name),
        bio: bio || null,
        imageUrl: imageUrl || null,
      },
    })

    await createLog({
      userId: session!.user!.id,
      action: LogAction.CREATE,
      resource: LogResource.AUTHOR,
      resourceId: author.id,
      description: `Autor criado: ${name}`,
      request,
    })

    return NextResponse.json(author, { status: 201 })
  } catch (error) {
    console.error("Author create error:", error)
    return NextResponse.json({ error: "Erro ao criar autor" }, { status: 500 })
  }
}
