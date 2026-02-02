import { prisma } from "@/lib/prisma"
import { DashboardStats } from "@/components/admin/DashboardStats"
import { RecentOrders } from "@/components/admin/RecentOrders"
import { logPageView } from "@/lib/log-page-view"

export const dynamic = "force-dynamic"

export const metadata = { title: "Admin Dashboard" }

export default async function AdminDashboardPage() {
  logPageView("Dashboard", "/admin")
  const [totalRevenue, totalOrders, totalCustomers, totalEbooks, recentOrders] = await Promise.all([
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.ebook.count({ where: { status: "PUBLISHED" } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, items: true },
    }),
  ])

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
      <DashboardStats
        revenue={totalRevenue._sum.total || 0}
        orders={totalOrders}
        customers={totalCustomers}
        ebooks={totalEbooks}
      />
      <RecentOrders orders={recentOrders} />
    </div>
  )
}
