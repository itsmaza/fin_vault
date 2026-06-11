// app/pay/[intentId]/page.tsx

import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import CheckoutClient from "./components/CheckoutClient"
import { Layers, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { getPaymentIntent } from "@/actions/payment.actions"

export default async function PayPage({
  params,
}: {
  params: { intentId: string }
}) {
  const session = await getSession()
  if (!session) {
    redirect(`/login?redirect=/pay/${params.intentId}`)
  }

  const result = await getPaymentIntent(params.intentId)

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-[#f6faf8] flex items-center justify-center px-4">
        <div className="bg-white border border-[#dde8e3] rounded-[20px] p-8 max-w-[400px] w-full text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-red-500" />
          </div>
          <h1
            className="text-[18px] font-bold text-[#0a3d2e] mb-2"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Payment Unavailable
          </h1>
          <p className="text-[13px] text-[#5a7568] mb-5">{result.message}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0a3d2e] text-white text-[13px] font-semibold rounded-[10px] hover:bg-[#0f5c44] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6faf8] flex flex-col">

      {/* Header */}
      <header className="border-b border-[#dde8e3] bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] bg-[#1d9e75] rounded-[8px] flex items-center justify-center">
            <Layers size={14} className="text-white" />
          </div>
          <span
            className="text-[#0a3d2e] text-[15px] font-bold"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            FinVault Pay
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#8a9e96]">
          <Clock size={12} />
          Expires in 30 min
        </div>
      </header>

      {/* Checkout */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <CheckoutClient intent={result.data} />
      </div>
    </div>
  )
}