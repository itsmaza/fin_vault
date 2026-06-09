// app/dashboard/transactions/received/page.tsx
import { getCurrentUser } from "@/lib/auth"
import { getReceivedTransactions }  from "@/actions/transaction.actions"
import TransactionTable from "../components/TransactionTable"

export default async function ReceivedPage() {
  const user = await getCurrentUser()
  return (
    <TransactionTable
      title="Received"
      description="Money sent to you"
      fetchFn={getReceivedTransactions}
      currentUserId={user?._id?.toString() ?? ""}
      variant="received"
    />
  )
}