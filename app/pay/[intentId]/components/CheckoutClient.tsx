// app/pay/[intentId]/components/CheckoutClient.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { confirmPayment } from "@/actions/payment.actions"
import { ShieldCheck, Loader2, Building2, CheckCircle2, ArrowRight } from "lucide-react"
import type { SafePaymentIntent } from "@/types"

interface Props {
  intent: SafePaymentIntent & { merchantName: string }
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: "USD",
  }).format(n)
}

export default function CheckoutClient({ intent }: Props) {
  const router = useRouter()
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    const result = await confirmPayment(intent.intentId)

    if (!result.success) {
      setError(result.message)
      setLoading(false)
      return
    }

    setConfirmed(true)

    // Redirect after 1.5s
    setTimeout(() => {
      router.push(result.data!.redirectUrl)
    }, 1500)
  }

  if (confirmed) {
    return (
      <div className="bg-white border border-[#dde8e3] rounded-[20px] p-8 max-w-[420px] w-full text-center">
        <div className="w-14 h-14 bg-[#E1F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={26} className="text-[#1d9e75]" />
        </div>
        <h2
          className="text-[20px] font-bold text-[#0a3d2e] mb-1"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Payment Successful!
        </h2>
        <p className="text-[13px] text-[#5a7568]">Redirecting you back...</p>
        <div className="mt-4 flex justify-center">
          <Loader2 size={18} className="animate-spin text-[#1d9e75]" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#dde8e3] rounded-[20px] shadow-sm max-w-[420px] w-full overflow-hidden">

      {/* Merchant info */}
      <div className="bg-[#0a3d2e] px-6 py-5 text-center">
        <div className="w-10 h-10 bg-[#1d9e75] rounded-full flex items-center justify-center mx-auto mb-2">
          <Building2 size={16} className="text-white" />
        </div>
        <p className="text-[11px] text-[#6fa890] font-medium tracking-wide">
          PAYMENT TO
        </p>
        <p
          className="text-[18px] font-bold text-white mt-0.5"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {intent.merchantName}
        </p>
      </div>

      {/* Amount */}
      <div className="px-6 py-6 border-b border-[#f0f5f2] text-center">
        <p className="text-[11px] font-semibold text-[#8a9e96] tracking-widest mb-1">
          AMOUNT DUE
        </p>
        <p
          className="text-[40px] font-bold text-[#0a3d2e] leading-none"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {formatUSD(intent.amount)}
        </p>
      </div>

      {/* Metadata */}
      {intent.metadata && Object.keys(intent.metadata).length > 0 && (
        <div className="px-6 py-4 border-b border-[#f0f5f2]">
          <p className="text-[10px] font-semibold text-[#8a9e96] tracking-widest mb-2">
            ORDER DETAILS
          </p>
          <div className="flex flex-col gap-1.5">
            {Object.entries(intent.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-[12px] text-[#8a9e96] capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="text-[12px] font-semibold text-[#0a3d2e]">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-3 rounded-[10px]">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-5 flex flex-col gap-3">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 bg-[#0a3d2e] hover:bg-[#0f5c44] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-semibold rounded-[12px] transition-colors"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" />Processing...</>
          ) : (
            <>Pay {formatUSD(intent.amount)}<ArrowRight size={15} /></>
          )}
        </button>

        <a
          href={intent.redirectUrl}
          className="text-center text-[12px] text-[#8a9e96] hover:text-[#5a7568] transition-colors"
        >
          Cancel and go back
        </a>
      </div>

      {/* Security badge */}
      <div className="px-6 pb-5 flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} className="text-[#1d9e75]" />
        <span className="text-[11px] text-[#8a9e96]">
          Secured by FinVault Pay
        </span>
      </div>
    </div>
  )
}