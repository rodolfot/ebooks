import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/permissions"
import { OrderStatus } from "@/generated/prisma"

export async function GET(request: Request) {
  const session = await auth()
  const denied = requirePermission(session, "order", "view")
  if (denied) return denied

  const url = new URL(request.url)
  const status = url.searchParams.get("status")
  const validStatuses = Object.values(OrderStatus)

  const orders = await prisma.order.findMany({
    where: status && validStatuses.includes(status as OrderStatus) ? { status: status as OrderStatus } : undefined,
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { ebook: { select: { title: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}
