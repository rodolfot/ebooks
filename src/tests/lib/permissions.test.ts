import { describe, it, expect } from "vitest"
import { isStaff, hasPermission, canManageRole } from "@/lib/permissions"

describe("isStaff", () => {
  it("returns false for USER", () => {
    expect(isStaff("USER")).toBe(false)
  })

  it("returns false for null/undefined", () => {
    expect(isStaff(null)).toBe(false)
    expect(isStaff(undefined)).toBe(false)
  })

  it("returns true for ADMIN", () => {
    expect(isStaff("ADMIN")).toBe(true)
  })

  it("returns true for INTERN", () => {
    expect(isStaff("INTERN")).toBe(true)
  })
})

describe("hasPermission", () => {
  it("ADMIN can view ebooks", () => {
    expect(hasPermission("ADMIN", "ebook", "view")).toBe(true)
  })

  it("ADMIN can delete ebooks", () => {
    expect(hasPermission("ADMIN", "ebook", "delete")).toBe(true)
  })

  it("INTERN cannot create ebooks", () => {
    expect(hasPermission("INTERN", "ebook", "create")).toBe(false)
  })

  it("SUPPORT cannot delete orders", () => {
    expect(hasPermission("SUPPORT", "order", "delete")).toBe(false)
  })

  it("returns false for unknown role", () => {
    expect(hasPermission("NONEXISTENT", "ebook", "view")).toBe(false)
  })

  it("EDITOR can manage categories", () => {
    expect(hasPermission("EDITOR", "category", "create")).toBe(true)
  })
})

describe("canManageRole", () => {
  it("ADMIN can manage EDITOR", () => {
    expect(canManageRole("ADMIN", "EDITOR")).toBe(true)
  })

  it("EDITOR cannot manage ADMIN", () => {
    expect(canManageRole("EDITOR", "ADMIN")).toBe(false)
  })

  it("same role cannot manage itself", () => {
    expect(canManageRole("ADMIN", "ADMIN")).toBe(false)
  })
})
