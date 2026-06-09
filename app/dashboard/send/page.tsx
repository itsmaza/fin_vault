// app/dashboard/send/page.tsx  (AI-Powered Quick Send)
"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Send,
  Loader2,
  CheckCircle2,
  User,
  Sparkles,
  X,
  ChevronRight,
  Zap,
} from "lucide-react"
import { sendMoney } from "@/actions/transaction.actions"
import { getBeneficiaries } from "@/actions/beneficiary.actions"
import type { SafeBeneficiary } from "@/types"

const sendSchema = z.object({
  receiverEmail: z.string().email("Invalid email address"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be greater than 0")
    .refine((v) => Number(v) <= 50000, "Maximum transfer is $50,000"),
  note: z.string().max(100, "Note too long").optional(),
})

type SendForm = z.infer<typeof sendSchema>

// ── AI suggestion chip ─────────────────────────────────────────────────────────
interface AISuggestion {
  label: string
  email?: string
  amount?: number
  note?: string
  reason: string
}

function SuggestionChip({
  s,
  onClick,
}: {
  s: AISuggestion
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full text-[11.5px] font-medium transition-all duration-150 whitespace-nowrap group"
      style={{
        background: "linear-gradient(135deg, rgba(29,158,117,0.12) 0%, rgba(29,158,117,0.06) 100%)",
        border: "1px solid rgba(29,158,117,0.22)",
        color: "#1d9e75",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "linear-gradient(135deg, rgba(29,158,117,0.2) 0%, rgba(29,158,117,0.12) 100%)"
        el.style.borderColor = "rgba(29,158,117,0.4)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "linear-gradient(135deg, rgba(29,158,117,0.12) 0%, rgba(29,158,117,0.06) 100%)"
        el.style.borderColor = "rgba(29,158,117,0.22)"
      }}
    >
      <Zap size={10} className="flex-shrink-0" />
      {s.label}
      <ChevronRight size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

// ── AI Panel ──────────────────────────────────────────────────────────────────
function AIAssistPanel({
  visible,
  loading,
  suggestions,
  insight,
  onApply,
  onDismiss,
}: {
  visible: boolean
  loading: boolean
  suggestions: AISuggestion[]
  insight: string
  onApply: (s: AISuggestion) => void
  onDismiss: () => void
}) {
  if (!visible) return null

  return (
    <div
      className="rounded-[14px] p-4 mb-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0d4a36 0%, #082e20 100%)",
        border: "1px solid rgba(29,158,117,0.25)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.03) inset",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(29,158,117,0.15) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-[7px] flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #1d9e75 0%, #0d6b4d 100%)",
              boxShadow: "0 0 12px rgba(29,158,117,0.4)",
            }}
          >
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="text-[12px] font-semibold text-white">AI Suggestions</span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-full transition-colors"
          style={{ color: "rgba(111,168,144,0.6)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(111,168,144,0.6)")}
        >
          <X size={12} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={13} className="animate-spin" style={{ color: "#1d9e75" }} />
          <span className="text-[12px]" style={{ color: "rgba(111,168,144,0.8)" }}>
            Analyzing your patterns…
          </span>
        </div>
      ) : (
        <>
          {insight && (
            <p className="text-[11.5px] leading-relaxed mb-3" style={{ color: "rgba(168,213,191,0.85)" }}>
              {insight}
            </p>
          )}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <SuggestionChip key={i} s={s} onClick={() => onApply(s)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#5a7568" }}>
          {label}
        </label>
        {hint && (
          <span className="text-[10.5px]" style={{ color: "rgba(111,168,144,0.7)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-[11px] font-medium flex items-center gap-1" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuickSendPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [beneficiaries, setBeneficiaries] = useState<SafeBeneficiary[]>([])
  const [showBeneficiaries, setShowBeneficiaries] = useState(false)
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(false)

  // AI state
  const [aiVisible, setAiVisible] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])
  const [aiInsight, setAiInsight] = useState("")
  const [aiUsed, setAiUsed] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SendForm>({ resolver: zodResolver(sendSchema) })

  const watchedEmail = watch("receiverEmail")
  const watchedAmount = watch("amount")

  // Load beneficiaries once
  const loadBeneficiaries = async () => {
    if (beneficiaries.length > 0) { setShowBeneficiaries(true); return }
    setLoadingBeneficiaries(true)
    const result = await getBeneficiaries()
    if (result.success && result.data) setBeneficiaries(result.data)
    setLoadingBeneficiaries(false)
    setShowBeneficiaries(true)
  }

  const selectBeneficiary = (b: SafeBeneficiary) => {
    setValue("receiverEmail", b.email, { shouldValidate: true })
    setShowBeneficiaries(false)
  }



  const applyAISuggestion = (s: AISuggestion) => {
    if (s.email) setValue("receiverEmail", s.email, { shouldValidate: true })
    if (s.amount) setValue("amount", String(s.amount), { shouldValidate: true })
    if (s.note) setValue("note", s.note)
    setAiVisible(false)
  }

  const onSubmit = async (data: SendForm) => {
    setServerError(null)
    const result = await sendMoney({
      receiverEmail: data.receiverEmail,
      amount: Number(data.amount),
      note: data.note,
    })
    if (!result.success) { setServerError(result.message); return }
    setSuccess(true)
    reset()
    setAiUsed(false)
    setTimeout(() => setSuccess(false), 4000)
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 text-[13px] text-[#0a3d2e] bg-white border rounded-[10px] outline-none transition-all placeholder:text-[#b0c4bb] focus:border-[#1d9e75] focus:ring-2 focus:ring-[#1d9e75]/10 ${
      hasError ? "border-red-300 bg-red-50/30" : "border-[#dde8e3]"
    }`

  return (
    <div className="max-w-[520px]">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1
            className="text-[22px] font-bold text-[#0a3d2e] tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Quick Send
          </h1>
          <p className="text-[13px] text-[#5a7568] mt-0.5">
            Send money instantly to anyone
          </p>
        </div>

     
      </div>

      {/* AI Panel */}
      <AIAssistPanel
        visible={aiVisible}
        loading={aiLoading}
        suggestions={aiSuggestions}
        insight={aiInsight}
        onApply={applyAISuggestion}
        onDismiss={() => setAiVisible(false)}
      />

      {/* Success */}
      {success && (
        <div
          className="flex items-center gap-3 text-[13px] font-medium px-4 py-3 rounded-[12px] mb-5"
          style={{
            background: "linear-gradient(135deg, rgba(29,158,117,0.12) 0%, rgba(29,158,117,0.06) 100%)",
            border: "1px solid rgba(29,158,117,0.25)",
            color: "#085041",
          }}
        >
          <CheckCircle2 size={16} className="flex-shrink-0 text-[#1d9e75]" />
          Money sent successfully!
        </div>
      )}

      {/* Server error */}
      {serverError && (
        <div
          className="text-[12px] font-medium px-4 py-3 rounded-[12px] mb-5"
          style={{
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#dc2626",
          }}
        >
          {serverError}
        </div>
      )}

      {/* Form card */}
      <div
        className="rounded-[16px] p-6"
        style={{
          background: "#ffffff",
          border: "1px solid #dde8e3",
          boxShadow: "0 2px 16px rgba(10,61,46,0.06)",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Recipient */}
          <Field label="Recipient Email" error={errors.receiverEmail?.message}>
            <div className="relative">
              <input
                {...register("receiverEmail")}
                type="email"
                placeholder="recipient@example.com"
                className={inputClass(!!errors.receiverEmail)}
              />
              <button
                type="button"
                onClick={loadBeneficiaries}
                className="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-semibold rounded-[6px] transition-colors"
                style={{
                  background: "rgba(29,158,117,0.1)",
                  color: "#1d9e75",
                  border: "1px solid rgba(29,158,117,0.2)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = "rgba(29,158,117,0.18)"
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = "rgba(29,158,117,0.1)"
                }}
              >
                {loadingBeneficiaries ? <Loader2 size={10} className="animate-spin" /> : <User size={10} />}
                Saved
              </button>
            </div>

            {/* Beneficiary dropdown */}
            {showBeneficiaries && (
              <div
                className="mt-1 rounded-[12px] overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid #dde8e3",
                  boxShadow: "0 8px 24px rgba(10,61,46,0.1)",
                }}
              >
                {beneficiaries.length === 0 ? (
                  <p className="text-[12px] text-[#8a9e96] px-3 py-3 text-center">
                    No saved beneficiaries
                  </p>
                ) : (
                  beneficiaries.map((b) => (
                    <button
                      key={b._id}
                      type="button"
                      onClick={() => selectBeneficiary(b)}
                      className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 border-b last:border-0 text-left transition-colors"
                      style={{ borderColor: "#f0f5f2" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f6faf8")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #1d9e75 0%, #0d6b4d 100%)" }}
                      >
                        {b.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#0a3d2e]">{b.name}</p>
                        <p className="text-[11px] text-[#8a9e96]">{b.email}</p>
                      </div>
                    </button>
                  ))
                )}
                <button
                  type="button"
                  onClick={() => setShowBeneficiaries(false)}
                  className="cursor-pointer w-full text-center text-[11px] text-[#8a9e96] py-2 transition-colors"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f6faf8")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  Close
                </button>
              </div>
            )}
          </Field>

          {/* Amount */}
          <Field label="Amount (USD)" error={errors.amount?.message} hint="Max $50,000">
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold"
                style={{ color: "#8a9e96" }}
              >
                $
              </span>
              <input
                {...register("amount")}
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`${inputClass(!!errors.amount)} pl-7`}
              />
            </div>
          </Field>

          {/* Note */}
          <Field label="Note" error={errors.note?.message} hint="Optional">
            <input
              {...register("note")}
              placeholder="Rent, dinner, coffee…"
              className={inputClass(!!errors.note)}
            />
          </Field>

          {/* Live summary preview */}
          {watchedEmail && watchedAmount && Number(watchedAmount) > 0 && (
            <div
              className="rounded-[12px] px-4 py-3.5 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, #f0faf5 0%, #e8f5ef 100%)",
                border: "1px solid #c8e8d8",
              }}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#5a7568" }}>
                  Sending to
                </p>
                <p className="text-[12.5px] font-semibold text-[#0a3d2e] mt-0.5 truncate max-w-[180px]">
                  {watchedEmail}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#5a7568" }}>
                  Amount
                </p>
                <p
                  className="text-[20px] font-bold text-[#0a3d2e] mt-0.5"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  ${Number(watchedAmount).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer mt-1 w-full flex items-center justify-center gap-2 px-6 py-3 text-white text-[13px] font-semibold rounded-[11px] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: isSubmitting
                ? "#0a3d2e"
                : "linear-gradient(135deg, #0f5c44 0%, #0a3d2e 100%)",
              boxShadow: isSubmitting ? "none" : "0 4px 16px rgba(10,61,46,0.3)",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 22px rgba(10,61,46,0.4)"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(10,61,46,0.3)"
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send size={14} />
                Send Money
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}