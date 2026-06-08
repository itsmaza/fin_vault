// lib/models/beneficiary.model.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IBeneficiary extends Document {
  userId: Types.ObjectId
  name: string
  email: string
  createdAt: Date
}

const BeneficiarySchema = new Schema<IBeneficiary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

BeneficiarySchema.index({ userId: 1, email: 1 }, { unique: true })

const Beneficiary: Model<IBeneficiary> =
  mongoose.models.Beneficiary ||
  mongoose.model<IBeneficiary>("Beneficiary", BeneficiarySchema)

export default Beneficiary