// lib/models/user.model.ts
import mongoose, { Schema, Document, Model } from "mongoose"

export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED"

export interface IApiKey {
  _id:          mongoose.Types.ObjectId
  key:          string
  name:         string
  isActive:     boolean
  redirectUrl:  string
  webhookUrl?:  string
  createdAt:    Date
  lastUsedAt?:  Date
}

export interface IUser extends Document {
  name:            string
  email:           string
  passcode:        string
  avatar?:         string
  address?:        string
  balance:         number
  status:          UserStatus
  isSendEmail:     boolean
  resetPinToken?:  string
  resetPinExpires?: Date
  apiKeys:         mongoose.Types.DocumentArray<IApiKey & Document>
  createdAt:       Date
  updatedAt:       Date
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    key: {
      type:     String,
      required: true,
    },
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    isActive: {
      type:    Boolean,
      default: true,
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
    lastUsedAt: {
      type:    Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const UserSchema = new Schema<IUser>(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    passcode: {
      type:     String,
      required: true,
    },
    avatar: {
      type:    String,
      default: null,
    },
    address: {
      type:    String,
      default: null,
    },
    balance: {
      type:    Number,
      default: 0,
      min:     0,
    },
    status: {
      type:    String,
      enum:    ["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "PENDING",
    },
    isSendEmail: {
      type:    Boolean,
      default: true,
    },
    resetPinToken: {
      type:    String,
      default: null,
    },
    resetPinExpires: {
      type:    Date,
      default: null,
    },
    apiKeys: {
      type:    [ApiKeySchema],
      default: [],
    },
  },
  { timestamps: true }
)

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User