// lib/models/transaction.model.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose"

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
export type TransactionType   = "TRANSFER" | "DEPOSIT" | "WITHDRAWAL" | "PAYMENT"

export interface ITransaction extends Document {
  amount:      number
  type:        TransactionType
  status:      TransactionStatus
  senderId:    Types.ObjectId
  receiverId:  Types.ObjectId
  note?:       string
  reference:   string

  // Payment gateway fields
  intentId?:   string          // PaymentIntent এর intentId
  merchantId?: Types.ObjectId  // কোন merchant এর payment

  // Bank withdrawal fields
  bankDetails?: {
    bankName:            string
    accountHolderName:   string
    accountNumber:       string
    routingNumber:       string
  }

  // Metadata
  ip?:        string           // request IP (fraud detection)
  userAgent?: string           // browser info

  createdAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type:     Number,
      required: true,
      min:      0.01,
    },
    type: {
      type:     String,
      enum:     ["TRANSFER", "DEPOSIT", "WITHDRAWAL", "PAYMENT"],
      required: true,
    },
    status: {
      type:    String,
      enum:    ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    senderId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    receiverId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    note: {
      type:    String,
      default: null,
      trim:    true,
    },
    reference: {
      type:     String,
      required: true,
      unique:   true,
    },

    // ─── Payment gateway ──────────────────────────────
    intentId: {
      type:    String,
      default: null,
    },
    merchantId: {
      type:    Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },

    // ─── Bank withdrawal ──────────────────────────────
    bankDetails: {
      type: new Schema(
        {
          bankName:          { type: String, trim: true },
          accountHolderName: { type: String, trim: true },
          accountNumber:     { type: String, trim: true },
          routingNumber:     { type: String, trim: true },
        },
        { _id: false }
      ),
      default: null,
    },

    // ─── Metadata ─────────────────────────────────────
    ip: {
      type:    String,
      default: null,
    },
    userAgent: {
      type:    String,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

// ─── Indexes ──────────────────────────────────────────────
TransactionSchema.index({ senderId:   1, createdAt: -1 })
TransactionSchema.index({ receiverId: 1, createdAt: -1 })
TransactionSchema.index({ reference:  1 }, { unique: true })
TransactionSchema.index({ intentId:   1 }, { sparse: true })
TransactionSchema.index({ status:     1, type: 1 })

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema)

export default Transaction