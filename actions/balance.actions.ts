// actions/balance.actions.ts
"use server"

import { connectDB } from "@/lib/db"
import { Transaction } from "@/models"
import { requireAuth } from "@/lib/auth"
import { ok, fail } from "@/lib/response"
import mongoose from "mongoose"
import type { ActionResult, SafeTransaction } from "@/types"

const PAGE_SIZE = 10

type BalanceStats = {
  balance:            number
  totalIncome:        number
  totalSpent:         number
  recentTransactions: SafeTransaction[]
}

type TransactionFilters = {
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?:   string
  status?:    string
  page?:      number
}

export async function getBalanceOverview(): Promise<ActionResult<BalanceStats>> {
  try {
    await connectDB()
    const user   = await requireAuth()
    const userId = new mongoose.Types.ObjectId(user._id.toString())

    const [income, spent, recent] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            status: "COMPLETED",
            $or: [
              { type: "DEPOSIT",  senderId:   userId },
              { type: { $in: ["TRANSFER", "PAYMENT"] }, receiverId: userId, senderId: { $ne: userId } },
            ],
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      Transaction.aggregate([
        {
          $match: {
            status:     "COMPLETED",
            type:       { $in: ["TRANSFER", "WITHDRAWAL", "PAYMENT"] },
            senderId:   userId,
            receiverId: { $ne: userId },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      Transaction.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])

    return ok("Balance overview fetched", {
      balance:            user.balance,
      totalIncome:        income[0]?.total ?? 0,
      totalSpent:         spent[0]?.total ?? 0,
      recentTransactions: recent as unknown as SafeTransaction[],
    })
  } catch {
    return fail("Failed to fetch balance overview")
  }
}

export async function getDepositsFiltered(
  filters: TransactionFilters
): Promise<ActionResult<{ transactions: SafeTransaction[]; hasMore: boolean }>> {
  try {
    await connectDB()
    const user   = await requireAuth()
    const userId = new mongoose.Types.ObjectId(user._id.toString())

    const query: Record<string, unknown> = {
      senderId: userId,
      type:     "DEPOSIT",
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

    return ok("Deposits fetched", {
      transactions: txs.slice(0, PAGE_SIZE) as unknown as SafeTransaction[],
      hasMore:      txs.length > PAGE_SIZE,
    })
  } catch {
    return fail("Failed to fetch deposits")
  }
}

export async function getWithdrawalsFiltered(
  filters: TransactionFilters
): Promise<ActionResult<{ transactions: SafeTransaction[]; hasMore: boolean }>> {
  try {
    await connectDB()
    const user   = await requireAuth()
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
  } catch {
    return fail("Failed to fetch withdrawals")
  }
}