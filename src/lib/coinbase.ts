const COINBASE_API_URL = "https://api.commerce.coinbase.com"

interface CoinbaseChargeData {
  name: string
  description: string
  pricing_type: "fixed_price"
  local_price: {
    amount: string
    currency: string
  }
  metadata: Record<string, string>
  redirect_url: string
  cancel_url: string
}

export async function createCoinbaseCharge(data: CoinbaseChargeData) {
  const response = await fetch(`${COINBASE_API_URL}/charges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CC-Api-Key": process.env.COINBASE_COMMERCE_API_KEY || "",
      "X-CC-Version": "2018-03-22",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Coinbase Commerce API error: ${response.status}`)
  }

  return response.json()
}

import crypto from "crypto"

export function verifyCoinbaseWebhook(payload: string, signature: string): boolean {
  const secret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || ""
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const computed = hmac.digest("hex")
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))
}
