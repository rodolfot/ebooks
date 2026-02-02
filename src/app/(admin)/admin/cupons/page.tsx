import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CouponActions } from "@/components/admin/CouponActions"
import { logPageView } from "@/lib/log-page-view"

export const dynamic = "force-dynamic"

export const metadata = { title: "Admin - Cupons" }

export default async function AdminCouponsPage() {
  logPageView("Cupons", "/admin/cupons")
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Cupons</h1>
        <Link href="/admin/cupons/novo"><Button><Plus className="h-4 w-4 mr-2" /> Novo Cupom</Button></Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Codigo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Desconto</TableHead>
            <TableHead>Uso</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
              <TableCell>{coupon.discountType === "PERCENTAGE" ? "Porcentagem" : "Fixo"}</TableCell>
              <TableCell>
                {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}
              </TableCell>
              <TableCell>{coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ""}</TableCell>
              <TableCell><Badge variant={coupon.active ? "default" : "secondary"}>{coupon.active ? "Ativo" : "Inativo"}</Badge></TableCell>
              <TableCell>
                <CouponActions couponId={coupon.id} active={coupon.active} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
