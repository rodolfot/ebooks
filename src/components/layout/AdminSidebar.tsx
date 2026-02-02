"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, BookOpen, Package, Users, Tag, Star, Settings, Megaphone, ArrowLeft, ImageIcon, ScrollText, UserCog, DollarSign,
} from "lucide-react"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ebooks", label: "E-books", icon: BookOpen },
  { href: "/admin/pedidos", label: "Pedidos", icon: Package },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/cupons", label: "Cupons", icon: Tag },
  { href: "/admin/avaliacoes", label: "Avaliacoes", icon: Star },
  { href: "/admin/hotmart", label: "Hotmart Ads", icon: Megaphone },
  { href: "/admin/equipe", label: "Equipe", icon: UserCog },
  { href: "/admin/midias", label: "Midias", icon: ImageIcon },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
  { href: "/admin/configuracoes", label: "Configuracoes", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar à loja
        </Link>
        <h2 className="font-serif text-xl font-bold">Admin</h2>
      </div>
      <nav className="space-y-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
