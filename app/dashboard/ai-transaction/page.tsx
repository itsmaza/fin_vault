// app/dashboard/ai-transaction/page.tsx
import { requireAuth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import AiChat from "./components/AiChat"

export default async function AiTransactionPage() {
  await connectDB()
  const user = await requireAuth()

  return <AiChat userName={user.name} />
}