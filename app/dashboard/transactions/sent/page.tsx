// app/dashboard/transactions/sent/page.tsx

import { getCurrentUser } from "@/lib/auth"
import TransactionTable from "../components/TransactionTable"
import { getSentTransactions } from "@/actions/transaction.actions"

export default async function SentPage() {
  const user = await getCurrentUser()
  return (
    <TransactionTable
      title="Sent"
      description="Money you have sent out"
      fetchFn={getSentTransactions}
      currentUserId={user?._id?.toString() ?? ""}
      variant="sent"
    />
  )
}