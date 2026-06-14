// app/api/v1/payment/verify/[intentId]/route.ts
import { NextRequest } from "next/server"
import { apiAuth } from "@/lib/middleware/api-auth"
import { apiOk, apiError } from "@/lib/api/response"
import { PaymentIntent } from "@/models"
import { connectDB } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ intentId: string }> }
) {
  await connectDB()

  const auth = await apiAuth(request)
  if (!auth.success) return apiError(auth.message, auth.status)

  const { intentId } = await params

  const intent = await PaymentIntent.findOne({
    intentId,
    merchantId: auth.user._id,
  }).lean()

  if (!intent) return apiError("Payment intent not found", 404)

  return apiOk({
    intentId:  intent.intentId,
    amount:    intent.amount,
    status:    intent.status,
    metadata:  intent.metadata ?? {},
    paidAt:    intent.paidAt   ?? null,
    expiresAt: intent.expiresAt,
    createdAt: intent.createdAt,
  })
}