import { describe, it, expect } from "vitest"
import { formatPrice, slugify } from "@/lib/utils"

describe("formatPrice", () => {
  it("formats price in BRL", () => {
    const result = formatPrice(49.9)
    expect(result).toContain("49")
  })

  it("formats zero", () => {
    const result = formatPrice(0)
    expect(result).toContain("0")
  })

  it("formats large numbers", () => {
    const result = formatPrice(1999.99)
    expect(result).toContain("999")
  })
})

describe("slugify", () => {
  it("converts to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world")
  })

  it("removes accents", () => {
    expect(slugify("Programação Avançada")).toBe("programacao-avancada")
  })

  it("removes special characters", () => {
    expect(slugify("E-book: Guia #1!")).toBe("e-book-guia-1")
  })

  it("collapses multiple spaces into dashes", () => {
    expect(slugify("Multiple   Spaces")).toBe("multiple-spaces")
  })
})
