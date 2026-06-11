// app/api/v1/payment/create/route.ts
import { NextRequest } from "next/server"
import { PaymentIntent } from "@/models"
import { randomBytes } from "crypto"
import { apiAuth } from "@/lib/middleware/api-auth"
import { apiError, apiOk } from "@/lib/api/response"

function generateIntentId(): string {
  return `pi_${randomBytes(16).toString("hex")}`
}

export async function POST(request: NextRequest) {
  const auth = await apiAuth(request)
  if (!auth.success) return apiError(auth.message, auth.status)

  let body: {
    amount?:      number
    redirectUrl?: string
    webhookUrl?:  string
    metadata?:    Record<string, unknown>
  }

  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body")
  }

  const { amount, redirectUrl, webhookUrl, metadata } = body

  console.log(amount, redirectUrl, webhookUrl, metadata)
  
  // Validate
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return apiError("amount must be a positive number")
  }
  if (amount > 100000) {
    return apiError("Maximum payment amount is $100,000")
  }
  if (!redirectUrl || typeof redirectUrl !== "string") {
    return apiError("redirectUrl is required")
  }
  try {
    new URL(redirectUrl)
  } catch {
    return apiError("redirectUrl must be a valid URL")
  }
  if (webhookUrl) {
    try { new URL(webhookUrl) } catch {
      return apiError("webhookUrl must be a valid URL")
    }
  }

  const intentId  = generateIntentId()
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

  const intent = await PaymentIntent.create({
    intentId,
    merchantId:  auth.user._id,
    amount,
    status:      "PENDING",
    redirectUrl,
    webhookUrl:  webhookUrl || undefined, // Changed this line to use undefined instead of null
    metadata:    metadata ?? {},
    expiresAt,
  })

  return apiOk(
    {
      intentId:    intent.intentId,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${intent.intentId}`,
      amount:      intent.amount,
      expiresAt:   intent.expiresAt,
    },
    "Payment intent created",
    201
  )
}