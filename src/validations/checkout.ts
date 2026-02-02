import { z } from "zod"

export const checkoutSchema = z.object({
  items: z.array(z.object({
    ebookId: z.string(),
    price: z.number(),
  })).min(1, "Carrinho vazio"),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "CRYPTO", "BOLETO", "FREE_COUPON"]),
  couponCode: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  customerCpf: z.string().optional(),
  // Credit card specific
  cardToken: z.string().optional(),
  installments: z.number().optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
