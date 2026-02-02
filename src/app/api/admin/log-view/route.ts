import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireStaff } from "@/lib/permissions"
import { createLog } from "@/lib/audit"

export async function POST(request: Request) {
  const session = await auth()
  const denied = requireStaff(session)
  if (denied) return denied

  const { page, endpoint } = await request.json()

  createLog({
    userId: session!.user!.id!,
    action: "VIEW",
    resource: "PAGE",
    description: `Acessou ${page}`,
    endpoint: endpoint || `/admin/${(page as string).toLowerCase().replace(/\s+/g, "-")}`,
  })

  return NextResponse.json({ ok: true })
}
