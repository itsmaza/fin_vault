// lib/types/payment.types.ts
export type PaymentIntentStatus = "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED"

export type CreatePaymentInput = {
  amount:      number
  redirectUrl: string
  webhookUrl?: string
  metadata?:   Record<string, unknown>
}

export type SafePaymentIntent = {
  intentId:    string
  merchantId:  string
  customerId?: string
  amount:      number
  status:      PaymentIntentStatus
  redirectUrl: string
  webhookUrl?: string
  metadata?:   Record<string, unknown>
  expiresAt:   Date
  paidAt?:     Date
  createdAt:   Date
}