"use server"

import { connectDB } from "@/lib/db"

import { requireAuth } from "@/lib/auth"
import { ok, fail } from "@/lib/response"
import type { ActionResult, SafeTransaction, DepositInput } from "@/types"
import { Transaction, User } from "@/models"

// ─── Test Cards ───────────────────────────────────────────
const TEST_CARDS: Record<string, { valid: boolean; reason?: string }> = {
  "4242424242424242": { valid: true },
  "4000000000000002": { valid: true },
  "4000000000009995": { valid: false, reason: "Insufficient funds on card" },
  "4000000000000069": { valid: false, reason: "Card expired" },
  "4000000000000119": { valid: false, reason: "Card processing error" },
}

// ─── Card Validator ───────────────────────────────────────
function validateCard(card: DepositInput["card"]) {
  const rawNumber = card.number.replace(/\s/g, "")

  // Test card check
  const testCard = TEST_CARDS[rawNumber]
  if (!testCard) return { valid: false, reason: "Invalid card number" }
  if (!testCard.valid) return { valid: false, reason: testCard.reason }

  // Expiry check (MM/YY)
  const [mm, yy] = card.expiry.split("/").map((v) => parseInt(v.trim()))
  if (!mm || !yy) return { valid: false, reason: "Invalid expiry date" }

  const now = new Date()
  const expiry = new Date(2000 + yy, mm - 1)
  if (expiry < now) return { valid: false, reason: "Card has expired" }

  // CVV check
  if (!/^\d{3,4}$/.test(card.cvv)) {
    return { valid: false, reason: "Invalid CVV" }
  }

  // Name check
  if (!card.name.trim()) {
    return { valid: false, reason: "Cardholder name is required" }
  }

  return { valid: true }
}

// ─── Deposit ──────────────────────────────────────────────
export async function deposit(
  input: DepositInput
): Promise<ActionResult<SafeTransaction>> {
  try {
    await connectDB()
    const user = await requireAuth()

    if (input.amount <= 0) return fail("Amount must be greater than 0")
    if (input.amount > 50000) return fail("Maximum deposit is $50,000")

    // Validate card
    const cardCheck = validateCard(input.card)
    if (!cardCheck.valid) return fail(cardCheck.reason ?? "Card validation failed")

    // Update balance
    await User.findByIdAndUpdate(user._id, {
      $inc: { balance: input.amount },
    })

    // Create transaction
    const transaction = await Transaction.create({
      amount: input.amount,
      type: "DEPOSIT",
      status: "COMPLETED",
      senderId: user._id,
      receiverId: user._id,
      note: input.note ?? "Card deposit",
      reference: `DEP-${Date.now()}`,
    })

    const result = await Transaction.findById(transaction._id).lean()
    return ok(`$${input.amount.toFixed(2)} deposited successfully`, result as unknown as SafeTransaction)
  } catch {
    return fail("Deposit failed. Please try again.")
  }
}

// ─── Get Deposits ─────────────────────────────────────────
export async function getDeposits(): Promise<ActionResult<SafeTransaction[]>> {
  try {
    await connectDB()
    const user = await requireAuth()

    const deposits = await Transaction.find({
      senderId: user._id,
      type: "DEPOSIT",
    })
      .sort({ createdAt: -1 })
      .lean()

    return ok("Deposits fetched", deposits as unknown as SafeTransaction[])
  } catch {
    return fail("Failed to fetch deposits")
  }
}

export async function getDepositById(id: string): Promise<ActionResult<SafeTransaction>> {
    try {
        await connectDB();
        const user = await requireAuth();
        const deposit = await Transaction.findOne({
            _id: id,
            senderId: user._id,
            type: 'DEPOSIT',
        }).lean();

        if (!deposit) return fail('Deposit not found');

        return ok('Deposit fetched', deposit as unknown as SafeTransaction);
    } catch {
        return fail('Failed to fetch deposit');
    }
}
