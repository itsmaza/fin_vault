// actions/balance.actions.ts
"use server"

import { connectDB } from "@/lib/db"
import { Transaction } from "@/models"
import { requireAuth } from "@/lib/auth"
import { ok, fail } from "@/lib/response"
import type { ActionResult, SafeTransaction } from "@/types"

const PAGE_SIZE = 10

type BalanceStats = {
  balance: number
  totalIncome: number
  totalSpent: number
  recentTransactions: SafeTransaction[]
}

type TransactionFilters = {
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  status?: string
  page?: number
}


export async function getBalanceOverview(): Promise<ActionResult<BalanceStats>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const [income, spent, recent] = await Promise.all([

      // INCOME = DEPOSIT (senderId = user) + TRANSFER received (receiverId = user, senderId != user)
      Transaction.aggregate([
        {
          $match: {
            status: "COMPLETED",
            $or: [
              // নিজের deposit — senderId আর receiverId দুটোই user
              {
                type: "DEPOSIT",
                senderId: user._id,
              },
              // অন্য কেউ পাঠিয়েছে — senderId অবশ্যই ভিন্ন হতে হবে
              {
                type: "TRANSFER",
                receiverId: user._id,
                senderId: { $ne: user._id },
              },
            ],
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // SPENT = নিজে TRANSFER পাঠিয়েছে
      Transaction.aggregate([
        {
          $match: {
            status: "COMPLETED",
            type: "TRANSFER",
            senderId: user._id,
            receiverId: { $ne: user._id }, // নিজেকে নিজে পাঠানো বাদ (যদি কখনো হয়)
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // সাম্প্রতিক transactions
      Transaction.find({
        $or: [{ senderId: user._id }, { receiverId: user._id }],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])

    return ok("Balance overview fetched", {
      balance: user.balance,
      totalIncome: income[0]?.total ?? 0,
      totalSpent: spent[0]?.total ?? 0,
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
    console.log("test")
    await connectDB()
    const user = await requireAuth()

    const query: Record<string, unknown> = {
      senderId: user._id,
      type: "DEPOSIT",
    }

    if (filters.status) query.status = filters.status
    if (filters.minAmount || filters.maxAmount) {
      query.amount = {
        ...(filters.minAmount && { $gte: filters.minAmount }),
        ...(filters.maxAmount && { $lte: filters.maxAmount }),
      }
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {
        ...(filters.startDate && { $gte: new Date(filters.startDate) }),
        ...(filters.endDate && { $lte: new Date(filters.endDate) }),
      }
    }

    const page = filters.page ?? 1
    const skip = (page - 1) * PAGE_SIZE

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE + 1)
      .lean()
      console.log("Fetched transactions:", transactions)

    const hasMore = transactions.length > PAGE_SIZE

    return ok("Deposits fetched", {
      transactions: transactions.slice(0, PAGE_SIZE) as unknown as SafeTransaction[],
      hasMore,
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
    const user = await requireAuth()

    const query: Record<string, unknown> = {
      senderId: user._id,
      type: "TRANSFER",
    }

    if (filters.status) query.status = filters.status
    if (filters.minAmount || filters.maxAmount) {
      query.amount = {
        ...(filters.minAmount && { $gte: filters.minAmount }),
        ...(filters.maxAmount && { $lte: filters.maxAmount }),
      }
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {
        ...(filters.startDate && { $gte: new Date(filters.startDate) }),
        ...(filters.endDate && { $lte: new Date(filters.endDate) }),
      }
    }

    const page = filters.page ?? 1
    const skip = (page - 1) * PAGE_SIZE

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE + 1)
      .lean()

    const hasMore = transactions.length > PAGE_SIZE

    return ok("Withdrawals fetched", {
      transactions: transactions.slice(0, PAGE_SIZE) as unknown as SafeTransaction[],
      hasMore,
    })
  } catch {
    return fail("Failed to fetch withdrawals")
  }
}