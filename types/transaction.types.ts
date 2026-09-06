// lib/types/transaction.types.ts

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
export type TransactionType   = "TRANSFER" | "DEPOSIT" | "WITHDRAWAL" | "PAYMENT"

export type BankDetails = {
  bankName:          string
  accountHolderName: string
  accountNumber:     string
  routingNumber:     string
}

export type SendMoneyInput = {
  receiverEmail: string
  amount:        number
  note?:         string
}

export type DepositInput = {
  amount: number
  note?:  string
  card: {
    number: string
    expiry: string
    cvv:    string
    name:   string
  }
}

export type WithdrawInput = {
  amount:            number
  bankName:          string
  accountHolderName: string
  accountNumber:     string
  routingNumber:     string
  note?:             string
}

export type SafeTransaction = {
  _id:          string
  amount:       number
  type:         TransactionType
  status:       TransactionStatus
  senderId:     string
  receiverId:   string
  note?:        string
  reference:    string
  intentId?:    string
  merchantId?:  string
  bankDetails?: BankDetails
  createdAt:    Date
  
}

export type CardValidationResult = {
  valid:   boolean
  reason?: string
}