// app/api/v1/payment/create/route.ts
import { NextRequest } from "next/server"
import { PaymentIntent } from "@/models"
import { randomBytes } from "crypto"
import { apiAuth } from "@/lib/middleware/api-auth"
import { apiError, apiOk } from "@/lib/api/response"
import { connectDB } from "@/lib/db"

function generateIntentId(): string {
  return `pi_${randomBytes(16).toString("hex")}`
}

export async function POST(request: NextRequest) {
  await connectDB()

  const auth = await apiAuth(request)
  if (!auth.success) return apiError(auth.message, auth.status)

  let body: {
    amount?:   number
    metadata?: Record<string, unknown>
  }

  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body")
  }

  const { amount, metadata } = body

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return apiError("amount must be a positive number")
  }
  if (amount > 100000) {
    return apiError("Maximum payment amount is $100,000")
  }

  // ─── API key থেকে redirectUrl + webhookUrl নাও ────────
  const apiKey = auth.user.apiKeys.find(
    (k) => k.isActive && k.key === request.headers.get("authorization")?.replace("Bearer ", "").trim()
  )

  if (!apiKey?.redirectUrl) {
    return apiError("API key has no redirectUrl configured. Update it in the API Keys settings.", 400)
  }

  const intentId  = generateIntentId()
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

  const intent = await PaymentIntent.create({
    intentId,
    merchantId:  auth.user._id,
    amount,
    status:      "PENDING",
    redirectUrl: apiKey.redirectUrl,
    webhookUrl:  apiKey.webhookUrl ?? undefined,
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