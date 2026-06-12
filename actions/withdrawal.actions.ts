// actions/withdrawal.actions.ts
"use server"

import { connectDB } from "@/lib/db"
import { User, Transaction } from "@/models"
import { requireAuth } from "@/lib/auth"
import { ok, fail } from "@/lib/response"
import mongoose from "mongoose"
import type { ActionResult, SafeTransaction, WithdrawInput } from "@/types"

const PAGE_SIZE = 10

type WithdrawFilters = {
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?:   string
  status?:    string
  page?:      number
}

export async function withdrawFunds(
  input: WithdrawInput
): Promise<ActionResult<SafeTransaction>> {
  try {
    await connectDB()
    const user = await requireAuth()

    if (input.amount <= 0)     return fail("Amount must be greater than 0")
    if (input.amount > 50000)  return fail("Maximum withdrawal is $50,000")
    if (user.balance < input.amount) return fail("Insufficient balance")

    const userId = new mongoose.Types.ObjectId(user._id.toString())

    const updated = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: input.amount } },
      { $inc: { balance: -input.amount } },
      { new: true }
    )

    if (!updated) return fail("Insufficient balance")

    const transaction = await Transaction.create({
      amount:     input.amount,
      type:       "WITHDRAWAL",
      status:     "PENDING",
      senderId:   userId,
      receiverId: userId,
      note:       input.note ?? `Withdrawal to ${input.bankName}`,
      reference:  `WDR-${Date.now()}`,
      bankDetails: {
        bankName:          input.bankName,
        accountHolderName: input.accountHolderName,
        accountNumber:     input.accountNumber,
        routingNumber:     input.routingNumber,
      },
    })

    const result = await Transaction.findById(transaction._id).lean()
    return ok(
      `$${input.amount.toFixed(2)} withdrawal initiated. Arrives in 1–3 business days.`,
      result as unknown as SafeTransaction
    )
  } catch (error) {
    console.error("withdrawFunds error:", error)
    return fail("Withdrawal failed. Please try again.")
  }
}

export async function getWithdrawalsFiltered(
  filters: WithdrawFilters
): Promise<ActionResult<{ transactions: SafeTransaction[]; hasMore: boolean }>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const userId = new mongoose.Types.ObjectId(user._id.toString())

    const query: Record<string, unknown> = {
      senderId: userId,
      type:     "WITHDRAWAL",
    }

    if (filters.status) query.status = filters.status

    if (filters.minAmount || filters.maxAmount) {
      query.amount = {
        ...(filters.minAmount && { $gte: Number(filters.minAmount) }),
        ...(filters.maxAmount && { $lte: Number(filters.maxAmount) }),
      }
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {
        ...(filters.startDate && { $gte: new Date(filters.startDate) }),
        ...(filters.endDate && {
          $lte: new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)),
        }),
      }
    }

    const skip = ((filters.page ?? 1) - 1) * PAGE_SIZE
    const txs  = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE + 1)
      .lean()

    return ok("Withdrawals fetched", {
      transactions: txs.slice(0, PAGE_SIZE) as unknown as SafeTransaction[],
      hasMore:      txs.length > PAGE_SIZE,
    })
  } catch (error) {
    console.error("getWithdrawalsFiltered error:", error)
    return fail("Failed to fetch withdrawals")
  }
}