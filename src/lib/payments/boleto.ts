import { Payment } from "mercadopago"
import { mercadopago } from "../mercadopago"

interface CreateBoletoPaymentParams {
  amount: number
  description: string
  orderId: string
  payerEmail: string
  payerCpf: string
  payerFirstName?: string
  payerLastName?: string
}

export async function createBoletoPayment({
  amount,
  description,
  orderId,
  payerEmail,
  payerCpf,
  payerFirstName,
  payerLastName,
}: CreateBoletoPaymentParams) {
  const payment = new Payment(mercadopago)

  const result = await payment.create({
    body: {
      transaction_amount: amount,
      description,
      payment_method_id: "bolbradesco",
      payer: {
        email: payerEmail,
        first_name: payerFirstName || "Cliente",
        last_name: payerLastName || "",
        identification: {
          type: "CPF",
          number: payerCpf.replace(/\D/g, ""),
        },
      },
      external_reference: orderId,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    },
  })

  return {
    paymentId: String(result.id),
    boletoUrl: result.transaction_details?.external_resource_url || "",
    barcode: (result as unknown as { barcode?: { content?: string } }).barcode?.content || "",
    expiresAt: result.date_of_expiration || "",
  }
}
