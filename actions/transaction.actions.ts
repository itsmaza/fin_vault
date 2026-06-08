// actions/transaction.actions.ts
"use server"

import { connectDB } from "@/lib/db"

import { requireAuth } from "@/lib/auth"
import { ok, fail } from "@/lib/response"
import mongoose from "mongoose"
import { ActionResult, SafeTransaction, SendMoneyInput } from "@/types"
import { Transaction, User } from "@/models"

export async function sendMoney(
  input: SendMoneyInput
): Promise<ActionResult<SafeTransaction>> {
  try {
    await connectDB()
    const sender = await requireAuth()

    if (sender.email === input.receiverEmail.toLowerCase()) {
      return fail("Cannot send money to yourself")
    }

    if (input.amount <= 0) return fail("Amount must be greater than 0")

    if (sender.balance < input.amount) return fail("Insufficient balance")

    const receiver = await User.findOne({
      email: input.receiverEmail.toLowerCase(),
    })
    if (!receiver) return fail("Receiver not found")

    if (receiver.status !== "ACTIVE") return fail("Receiver account is not active")

    const session = await mongoose.startSession()
    let transaction

    await session.withTransaction(async () => {
      await User.findByIdAndUpdate(
        sender._id,
        { $inc: { balance: -input.amount } },
        { session }
      )

      await User.findByIdAndUpdate(
        receiver._id,
        { $inc: { balance: input.amount } },
        { session }
      )

      const [created] = await Transaction.create(
        [
          {
            amount: input.amount,
            type: "TRANSFER",
            status: "COMPLETED",
            senderId: sender._id,
            receiverId: receiver._id,
            note: input.note,
            reference: `TXN-${Date.now()}`,
          },
        ],
        { session }
      )

      transaction = created
    })

    session.endSession()

    if (!transaction) return fail("Transaction failed. Please try again.")

    return ok("Money sent successfully", transaction as unknown as SafeTransaction)
  } catch {
    return fail("Transaction failed. Please try again.")
  }
}

export async function getTransactions(): Promise<ActionResult<SafeTransaction[]>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const transactions = await Transaction.find({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    })
      .sort({ createdAt: -1 })
      .lean()

    return ok("Transactions fetched", transactions as unknown as SafeTransaction[])
  } catch {
    return fail("Failed to fetch transactions")
  }
}

export async function getSentTransactions(): Promise<ActionResult<SafeTransaction[]>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const transactions = await Transaction.find({ senderId: user._id })
      .sort({ createdAt: -1 })
      .lean()

    return ok("Sent transactions fetched", transactions as unknown as SafeTransaction[])
  } catch {
    return fail("Failed to fetch sent transactions")
  }
}

export async function getReceivedTransactions(): Promise<ActionResult<SafeTransaction[]>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const transactions = await Transaction.find({ receiverId: user._id })
      .sort({ createdAt: -1 })
      .lean()

    return ok("Received transactions fetched", transactions as unknown as SafeTransaction[])
  } catch {
    return fail("Failed to fetch received transactions")
  }
}

export async function getTransactionById(
  id: string
): Promise<ActionResult<SafeTransaction>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const transaction = await Transaction.findOne({
      _id: id,
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    }).lean()

    if (!transaction) return fail("Transaction not found")

    return ok("Transaction fetched", transaction as unknown as SafeTransaction)
  } catch {
    return fail("Failed to fetch transaction")
  }
}