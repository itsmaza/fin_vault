// actions/transaction-list.actions.ts
"use server"

import { connectDB } from "@/lib/db"
import { Transaction, User } from "@/models"
import { requireAuth } from "@/lib/auth"
import { ok, fail } from "@/lib/response"
import type { ActionResult, SafeTransaction, SendMoneyInput } from "@/types"
import mongoose from "mongoose"

const PAGE_SIZE = 10

type TxFilters = {
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?:   string
  status?:    string
  page?:      number
}

// ─── Serialize ────────────────────────────────────────────
function serializeTx(raw: any): SafeTransaction {
  return {
    ...raw,
    _id:        raw._id.toString(),
    senderId:   raw.senderId.toString(),
    receiverId: raw.receiverId.toString(),
    merchantId: raw.merchantId?.toString() ?? undefined,
    createdAt:  raw.createdAt instanceof Date
      ? raw.createdAt.toISOString()
      : raw.createdAt,
  }
}

// ─── Build query ──────────────────────────────────────────
function buildQuery(
  userId:    mongoose.Types.ObjectId,
  filters:   TxFilters,
  direction: "all" | "sent" | "received"
): Record<string, unknown> {
  const query: Record<string, unknown> = {}

  if (direction === "all") {
    query.$or = [{ senderId: userId }, { receiverId: userId }]
  } else if (direction === "sent") {
    query.senderId = userId
    query.type     = { $in: ["TRANSFER", "WITHDRAWAL", "PAYMENT"] }
  } else {
    query.receiverId = userId
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

  return query
}

// ─── Fetch helper ─────────────────────────────────────────
async function fetchTransactions(
  direction:  "all" | "sent" | "received",
  filters:    TxFilters,
  sortOrder:  1 | -1 = -1
): Promise<ActionResult<{ transactions: SafeTransaction[]; hasMore: boolean }>> {
  try {
    await connectDB()
    const user   = await requireAuth()
    const userId = new mongoose.Types.ObjectId(user._id.toString())
    const query  = buildQuery(userId, filters, direction)
    const skip   = ((filters.page ?? 1) - 1) * PAGE_SIZE

    const txs = await Transaction.find(query)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(PAGE_SIZE + 1)
      .lean()

    return ok("Transactions fetched", {
      transactions: txs.slice(0, PAGE_SIZE).map(serializeTx),
      hasMore:      txs.length > PAGE_SIZE,
    })
  } catch (error) {
    console.error("fetchTransactions error:", error)
    return fail("Failed to fetch transactions")
  }
}

export async function getAllTransactions(filters: TxFilters) {
  return fetchTransactions("all", filters, -1)
}

export async function getSentTransactions(filters: TxFilters) {
  return fetchTransactions("sent", filters, -1)
}

export async function getReceivedTransactions(filters: TxFilters) {
  return fetchTransactions("received", filters, -1)
}

export async function getTransactionHistory(filters: TxFilters) {
  return fetchTransactions("all", filters, 1)
}

// ─── Send Money ───────────────────────────────────────────
export async function sendMoney(
  input: SendMoneyInput
): Promise<ActionResult<SafeTransaction>> {
  try {
    await connectDB()
    const sender = await requireAuth()

    if (sender.email === input.receiverEmail.toLowerCase())
      return fail("Cannot send money to yourself")
    if (input.amount <= 0)
      return fail("Amount must be greater than 0")
    if (input.amount > 50000)
      return fail("Maximum transfer amount is $50,000")
    if (sender.balance < input.amount)
      return fail("Insufficient balance")

    const receiver = await User.findOne({
      email: input.receiverEmail.toLowerCase(),
    })

    if (!receiver)                    return fail("No account found with this email")
    if (receiver.status !== "ACTIVE") return fail("Recipient account is not active")

    const session   = await mongoose.startSession()
    let createdTx: SafeTransaction | null = null

    try {
      await session.withTransaction(async () => {
        const updatedSender = await User.findOneAndUpdate(
          {
            _id:     new mongoose.Types.ObjectId(sender._id.toString()),
            balance: { $gte: input.amount },
          },
          { $inc: { balance: -input.amount } },
          { session, new: true }
        )

        if (!updatedSender) throw new Error("Insufficient balance")

        await User.findByIdAndUpdate(
          receiver._id,
          { $inc: { balance: input.amount } },
          { session }
        )

        const [tx] = await Transaction.create(
          [{
            amount:     input.amount,
            type:       "TRANSFER",
            status:     "COMPLETED",
            senderId:   new mongoose.Types.ObjectId(sender._id.toString()),
            receiverId: receiver._id,
            note:       input.note ?? undefined,
            reference:  `TXN-${Date.now()}`,
          }],
          { session }
        )

        createdTx = serializeTx(tx.toObject())
      })
    } finally {
      session.endSession()
    }

    if (!createdTx) return fail("Transaction failed")

    return ok(
      `$${input.amount.toFixed(2)} sent to ${receiver.email} successfully`,
      createdTx
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : ""
    if (msg === "Insufficient balance") return fail("Insufficient balance")
    console.error("sendMoney error:", error)
    return fail("Transaction failed. Please try again.")
  }
}