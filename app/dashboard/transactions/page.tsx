// app/dashboard/transactions/page.tsx
import { getCurrentUser } from "@/lib/auth"

import TransactionTable from "./components/TransactionTable"
import { getAllTransactions } from "@/actions/transaction.actions"

export default async function AllTransactionsPage() {
  const user = await getCurrentUser()
  return (
    <TransactionTable
      title="All Transactions"
      description="Every transaction in one place"
      fetchFn={getAllTransactions}
      currentUserId={user?._id?.toString() ?? ""}
      variant="all"
    />
  )
}