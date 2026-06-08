// lib/types/beneficiary.types.ts

export type AddBeneficiaryInput = {
  name: string
  email: string
}

export type SafeBeneficiary = {
  _id: string
  userId: string
  name: string
  email: string
  createdAt: Date
}