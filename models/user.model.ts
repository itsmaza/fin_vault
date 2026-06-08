// lib/models/user.model.ts
import mongoose, { Schema, Document, Model } from "mongoose"

export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED"

export interface IUser extends Document {
  name: string
  email: string
  passcode: string
  avatar?: string
  address?: string
  balance: number
  status: UserStatus
  resetPinToken?: string
  resetPinExpires?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passcode: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: null,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "PENDING",
    },
    resetPinToken: {
      type: String,
      default: null,
    },
    resetPinExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User