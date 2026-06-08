// lib/models/transaction.model.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose"

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
export type TransactionType = "TRANSFER" | "DEPOSIT"

export interface ITransaction extends Document {
  amount: number
  type: TransactionType
  status: TransactionStatus
  senderId: Types.ObjectId
  receiverId: Types.ObjectId
  note?: string
  reference?: string
  createdAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    type: {
      type: String,
      enum: ["TRANSFER", "DEPOSIT"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      default: null,
    },
    reference: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema)

export default Transaction