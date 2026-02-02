import { NextResponse } from "next/server"

// Role hierarchy levels (higher = more access)
export const ROLE_LEVELS: Record<string, number> = {
  USER: 0,
  INTERN: 10,
  ANALYST: 20,
  SUPPORT: 30,
  LOGISTICS: 40,
  MARKETING: 50,
  FINANCE: 60,
  MODERATOR: 70,
  EDITOR: 80,
  MANAGER: 90,
  ADMIN: 95,
  SUPER_ADMIN: 100,
}

export const STAFF_ROLES = new Set(
  Object.keys(ROLE_LEVELS).filter((r) => ROLE_LEVELS[r] > 0)
)

export const ROLE_LABELS: Record<string, string> = {
  USER: "Usuario",
  INTERN: "Estagiario",
  ANALYST: "Analista",
  SUPPORT: "Suporte",
  LOGISTICS: "Logistica",
  MARKETING: "Marketing",
  FINANCE: "Financeiro",
  MODERATOR: "Moderador",
  EDITOR: "Editor",
  MANAGER: "Gerente",
  ADMIN: "Administrador",
  SUPER_ADMIN: "Super Admin",
}

// Permission resources and actions
export type PermResource =
  | "ebook"
  | "order"
  | "coupon"
  | "review"
  | "hotmart"
  | "user"
  | "log"
  | "analytics"
  | "employee"
  | "settings"
  | "category"
  | "author"
  | "bundle"

export type PermAction = "view" | "create" | "update" | "delete" | "export"

// Permission matrix: role -> resource -> allowed actions
const PERMISSION_MATRIX: Record<string, Partial<Record<PermResource, PermAction[]>>> = {
  SUPER_ADMIN: {
    ebook: ["view", "create", "update", "delete"],
    order: ["view", "update"],
    coupon: ["view", "create", "update", "delete"],
    review: ["view", "update", "delete"],
    hotmart: ["view", "create", "update", "delete"],
    user: ["view", "update"],
    log: ["view", "export"],
    analytics: ["view", "export"],
    employee: ["view", "create", "update", "delete"],
    settings: ["view", "update"],
    category: ["view", "create", "update", "delete"],
    author: ["view", "create", "update", "delete"],
    bundle: ["view", "create", "update", "delete"],
  },
  ADMIN: {
    ebook: ["view", "create", "update", "delete"],
    order: ["view", "update"],
    coupon: ["view", "create", "update", "delete"],
    review: ["view", "update", "delete"],
    hotmart: ["view", "create", "update", "delete"],
    user: ["view", "update"],
    log: ["view", "export"],
    analytics: ["view", "export"],
    employee: ["view", "create", "update", "delete"],
    settings: ["view", "update"],
    category: ["view", "create", "update", "delete"],
    author: ["view", "create", "update", "delete"],
    bundle: ["view", "create", "update", "delete"],
  },
  MANAGER: {
    ebook: ["view", "create", "update", "delete"],
    order: ["view", "update"],
    coupon: ["view", "create", "update", "delete"],
    review: ["view", "update", "delete"],
    hotmart: ["view", "create", "update", "delete"],
    user: ["view", "update"],
    log: ["view", "export"],
    analytics: ["view", "export"],
    employee: ["view", "create", "update"],
    category: ["view", "create", "update", "delete"],
    author: ["view", "create", "update", "delete"],
    bundle: ["view", "create", "update", "delete"],
  },
  EDITOR: {
    ebook: ["view", "create", "update", "delete"],
    order: ["view"],
    review: ["view", "update", "delete"],
    hotmart: ["view", "create", "update", "delete"],
    analytics: ["view"],
    category: ["view", "create", "update", "delete"],
    author: ["view", "create", "update", "delete"],
    bundle: ["view", "create", "update", "delete"],
  },
  MODERATOR: {
    review: ["view", "update", "delete"],
    user: ["view"],
    log: ["view"],
  },
  MARKETING: {
    ebook: ["view"],
    coupon: ["view", "create", "update", "delete"],
    hotmart: ["view", "create", "update", "delete"],
    analytics: ["view", "export"],
  },
  FINANCE: {
    order: ["view", "update"],
    coupon: ["view"],
    analytics: ["view", "export"],
    log: ["view"],
  },
  SUPPORT: {
    order: ["view"],
    user: ["view"],
    review: ["view"],
  },
  LOGISTICS: {
    order: ["view", "update"],
  },
  ANALYST: {
    order: ["view"],
    analytics: ["view"],
    log: ["view"],
  },
  INTERN: {
    ebook: ["view"],
    order: ["view"],
    analytics: ["view"],
  },
}

/**
 * Check if a role is a staff role (any role above USER).
 */
export function isStaff(role?: string | null): boolean {
  if (!role) return false
  return STAFF_ROLES.has(role)
}

/**
 * Get the hierarchy level for a role.
 */
export function getRoleLevel(role: string): number {
  return ROLE_LEVELS[role] ?? 0
}

/**
 * Check if a role has a specific permission on a resource.
 */
export function hasPermission(
  role: string | undefined | null,
  resource: PermResource,
  action: PermAction
): boolean {
  if (!role) return false
  const perms = PERMISSION_MATRIX[role]
  if (!perms) return false
  const actions = perms[resource]
  if (!actions) return false
  return actions.includes(action)
}

/**
 * Check if roleA can manage roleB (higher level manages lower).
 */
export function canManageRole(roleA: string, roleB: string): boolean {
  return getRoleLevel(roleA) > getRoleLevel(roleB)
}

/**
 * Returns a 403 response if the user is not staff, or null if authorized.
 * Use in route handlers: `const denied = requireStaff(session); if (denied) return denied;`
 */
export function requireStaff(
  session: { user?: { role?: string } | null } | null
): NextResponse | null {
  if (!session?.user || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return null
}

/**
 * Returns a 403 response if the user lacks the specific permission, or null if authorized.
 */
export function requirePermission(
  session: { user?: { role?: string } | null } | null,
  resource: PermResource,
  action: PermAction
): NextResponse | null {
  if (!session?.user || !hasPermission(session.user.role, resource, action)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return null
}
