export function calculateInstallments(
  price: number,
  maxInstallments = 12,
  minInstallmentValue = 10
): { installments: number; value: number; total: number }[] {
  const result: { installments: number; value: number; total: number }[] = []

  for (let i = 1; i <= maxInstallments; i++) {
    const value = price / i
    if (i > 1 && value < minInstallmentValue) break
    result.push({
      installments: i,
      value: Math.round(value * 100) / 100,
      total: price,
    })
  }

  return result
}

export function getInstallmentLabel(price: number): string | null {
  if (price < 20) return null
  const installments = calculateInstallments(price)
  const max = installments[installments.length - 1]
  if (max.installments <= 1) return null
  return `ou ${max.installments}x de R$ ${max.value.toFixed(2).replace(".", ",")}`
}
