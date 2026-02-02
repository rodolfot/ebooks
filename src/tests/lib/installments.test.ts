import { describe, it, expect } from "vitest"
import { calculateInstallments, getInstallmentLabel } from "@/lib/installments"

describe("calculateInstallments", () => {
  it("returns single installment for low price", () => {
    const result = calculateInstallments(5)
    expect(result).toHaveLength(1)
    expect(result[0].installments).toBe(1)
    expect(result[0].value).toBe(5)
  })

  it("returns multiple installments for higher price", () => {
    const result = calculateInstallments(120)
    expect(result.length).toBeGreaterThan(1)
    expect(result[0].installments).toBe(1)
    expect(result[0].value).toBe(120)
  })

  it("stops when installment value is below minimum", () => {
    const result = calculateInstallments(30, 12, 10)
    const lastInstallment = result[result.length - 1]
    expect(lastInstallment.value).toBeGreaterThanOrEqual(10)
  })

  it("all installments sum to total", () => {
    const result = calculateInstallments(100)
    for (const r of result) {
      expect(r.total).toBe(100)
    }
  })
})

describe("getInstallmentLabel", () => {
  it("returns null for prices below 20", () => {
    expect(getInstallmentLabel(15)).toBeNull()
  })

  it("returns label for qualifying prices", () => {
    const label = getInstallmentLabel(120)
    expect(label).not.toBeNull()
    expect(label).toContain("x de R$")
  })

  it("includes installment count", () => {
    const label = getInstallmentLabel(120)
    expect(label).toMatch(/ou \d+x de R\$/)
  })
})
