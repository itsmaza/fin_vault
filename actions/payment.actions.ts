// actions/payment.actions.ts
"use server"

import { connectDB } from "@/lib/db"
import { PaymentIntent, User, Transaction } from "@/models"
import { requireAuth } from "@/lib/auth"
import { ok, fail } from "@/lib/response"
import { sendWebhook } from "@/lib/webhook"
import mongoose from "mongoose"
import type { ActionResult, SafePaymentIntent } from "@/types"

export async function getPaymentIntent(
  intentId: string
): Promise<ActionResult<SafePaymentIntent & { merchantName: string }>> {
  try {
    await connectDB()

    const intent = await PaymentIntent.findOne({ intentId }).lean()
    if (!intent) return fail("Payment intent not found")

    // Check expired
    if (new Date() > intent.expiresAt && intent.status === "PENDING") {
      await PaymentIntent.findByIdAndUpdate(intent._id, { status: "EXPIRED" })
      return fail("Payment link has expired")
    }

    if (intent.status !== "PENDING") {
      return fail(`Payment is already ${intent.status.toLowerCase()}`)
    }

    const merchant = await User.findById(intent.merchantId).select("name").lean()

    return ok("Intent fetched", {
      ...intent,
      _id:          intent._id.toString(),
      intentId:     intent.intentId,
      merchantId:   intent.merchantId.toString(),
      merchantName: merchant?.name ?? "Unknown Merchant",
      amount:       Number(intent.amount),
    } as SafePaymentIntent & { merchantName: string })
  } catch {
    return fail("Failed to fetch payment intent")
  }
}

export async function confirmPayment(
  intentId: string
): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    await connectDB()
    const customer = await requireAuth()

    const intent = await PaymentIntent.findOne({
      intentId,
      status: "PENDING",
    })

    if (!intent) return fail("Payment intent not found or already processed")

    // Check expired
    if (new Date() > intent.expiresAt) {
      await intent.updateOne({ status: "EXPIRED" })
      return fail("Payment link has expired")
    }

    // Check self payment
    if (intent.merchantId.toString() === customer._id.toString()) {
      return fail("Cannot pay yourself")
    }

    // Check balance
    if (customer.balance < intent.amount) {
      return fail("Insufficient balance")
    }

    const customerId  = new mongoose.Types.ObjectId(customer._id.toString())
    const merchantId  = intent.merchantId

    // Atomic payment
    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        // Deduct from customer
        const updated = await User.findOneAndUpdate(
          { _id: customerId, balance: { $gte: intent.amount } },
          { $inc: { balance: -intent.amount } },
          { session, new: true }
        )
        if (!updated) throw new Error("Insufficient balance")

        // Add to merchant
        await User.findByIdAndUpdate(
          merchantId,
          { $inc: { balance: intent.amount } },
          { session }
        )

        // Create transaction
        await Transaction.create(
          [{
            amount:     intent.amount,
            type:       "TRANSFER",
            status:     "COMPLETED",
            senderId:   customerId,
            receiverId: merchantId,
            note:       `Payment: ${intent.intentId}`,
            reference:  intent.intentId,
          }],
          { session }
        )

        // Update intent
        await PaymentIntent.findByIdAndUpdate(
          intent._id,
          {
            status:     "COMPLETED",
            customerId,
            paidAt:     new Date(),
          },
          { session }
        )
      })
    } finally {
      session.endSession()
    }

    // Send webhook
    if (intent.webhookUrl) {
      await sendWebhook(intent.webhookUrl, {
        event:    "payment.success",
        intentId: intent.intentId,
        amount:   Number(intent.amount),
        metadata: intent.metadata ?? {},
      })
    }

    // Redirect URL with params
    const redirectUrl = new URL(intent.redirectUrl)
    redirectUrl.searchParams.set("status",   "success")
    redirectUrl.searchParams.set("intentId", intent.intentId)

    return ok("Payment successful", { redirectUrl: redirectUrl.toString() })
  } catch (error) {
    const msg = error instanceof Error ? error.message : ""
    if (msg === "Insufficient balance") return fail("Insufficient balance")
    console.error("confirmPayment error:", error)
    return fail("Payment failed. Please try again.")
  }
}