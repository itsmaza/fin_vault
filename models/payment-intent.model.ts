// lib/models/payment-intent.model.ts
import mongoose, { Schema, Document, Model } from "mongoose"

export type PaymentIntentStatus = "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED"

export interface IPaymentIntent extends Document {
  intentId:    string
  merchantId:  mongoose.Types.ObjectId
  customerId?: mongoose.Types.ObjectId
  amount:      number
  status:      PaymentIntentStatus
  redirectUrl: string
  webhookUrl?: string
  metadata?:   Record<string, unknown>
  expiresAt:   Date
  paidAt?:     Date
  createdAt:   Date
}

const PaymentIntentSchema = new Schema<IPaymentIntent>(
  {
    intentId: {
      type:     String,
      required: true,
      unique:   true,
    },
    merchantId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    customerId: {
      type:    Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },
    amount: {
      type:     Number,
      required: true,
      min:      0.01,
    },
    status: {
      type:    String,
      enum:    ["PENDING", "COMPLETED", "FAILED", "EXPIRED"],
      default: "PENDING",
    },
    redirectUrl: {
      type:     String,
      required: true,
      trim:     true,
    },
    webhookUrl: {
      type:    String,
      default: null,
      trim:    true,
    },
    metadata: {
      type:    Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type:     Date,
      required: true,
    },
    paidAt: {
      type:    Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

PaymentIntentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
PaymentIntentSchema.index({ merchantId: 1, status: 1 })
PaymentIntentSchema.index({ intentId: 1 }, { unique: true })

const PaymentIntent: Model<IPaymentIntent> =
  mongoose.models.PaymentIntent ||
  mongoose.model<IPaymentIntent>("PaymentIntent", PaymentIntentSchema)

export default PaymentIntent