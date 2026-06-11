// lib/types/user.types.ts

export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED"

export type RegisterInput = {
  name: string
  email: string
  passcode: string
  address?: string
}

export type LoginInput = {
  email: string
  passcode: string
}

export type UpdateProfileInput = {
  name?: string
  address?: string
  avatar?: string
}

export type UpdatePasscodeInput = {
  currentPasscode: string
  newPasscode: string
}

export type SafeUser = {
  _id: string
  name: string
  email: string
  avatar?: string
  address?: string
  balance: number
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}


export type SafeApiKey = {
  _id: string
  key: string
  name: string
  isActive: boolean
  webhookUrl?: string    
  redirectUrl: string   
  createdAt: Date
  lastUsedAt?: Date
}
