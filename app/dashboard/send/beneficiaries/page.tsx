// app/dashboard/send/beneficiaries/page.tsx  (AI-Powered)
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  User,
  Plus,
  Trash2,
  Loader2,
  Send,
  UserPlus,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react"
import {
  getBeneficiaries,
  addBeneficiary,
  deleteBeneficiary,
} from "@/actions/beneficiary.actions"
import { useRouter } from "next/navigation"
import type { SafeBeneficiary } from "@/types"

const addSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  email: z.string().email("Invalid email address"),
})

type AddForm = z.infer<typeof addSchema>

// ── AI insight per contact ─────────────────────────────────────────────────────
interface ContactInsight {
  tag: string       // e.g. "Frequent", "Overdue", "Upcoming"
  tagColor: string  // hex or rgba
  tagBg: string
  suggestion: string // short action line
  suggestedAmount?: number
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[11px] font-semibold tracking-wide uppercase"
        style={{ color: "#5a7568" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] font-medium" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  )
}

// ── AI Insight Badge ──────────────────────────────────────────────────────────
function InsightBadge({ tag, tagColor, tagBg }: { tag: string; tagColor: string; tagBg: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    Frequent: <TrendingUp size={9} />,
    Overdue: <Clock size={9} />,
    Upcoming: <Clock size={9} />,
    Favorite: <Star size={9} />,
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold"
      style={{ background: tagBg, color: tagColor, border: `1px solid ${tagColor}30` }}
    >
      {iconMap[tag] ?? <Sparkles size={9} />}
      {tag}
    </span>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BeneficiariesPage() {
  const router = useRouter()
  const [beneficiaries, setBeneficiaries] = useState<SafeBeneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // AI state
  const [aiInsights, setAiInsights] = useState<Record<string, ContactInsight>>({})
  const [aiLoading, setAiLoading] = useState(false)
  const [aiLoaded, setAiLoaded] = useState(false)
  const [aiSummary, setAiSummary] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddForm>({ resolver: zodResolver(addSchema) })

  const fetchBeneficiaries = async () => {
    setLoading(true)
    const result = await getBeneficiaries()
    if (result.success && result.data) setBeneficiaries(result.data)
    setLoading(false)
  }

  useEffect(() => { fetchBeneficiaries() }, [])

  // ── AI: analyze contacts ────────────────────────────────────────────────────
  const handleAIAnalyze = async () => {
    if (beneficiaries.length === 0) return
    setAiLoading(true)
    setAiLoaded(false)

    const contactList = beneficiaries
      .map((b) => `{ "id": "${b._id}", "name": "${b.name}", "email": "${b.email}" }`)
      .join(",\n")

    const prompt = `You are a personal finance AI for FinVault. 
Analyze these saved contacts and generate smart insights to help the user decide who to send money to.

Contacts:
[${contactList}]

For each contact, invent plausible financial patterns (rent, splitting meals, recurring transfers, etc.) and generate a short insight.

Return ONLY valid JSON, no markdown, no preamble:
{
  "summary": "one sentence overview of the contacts list, max 15 words",
  "insights": {
    "<contact_id>": {
      "tag": "one of: Frequent | Overdue | Upcoming | Favorite | New",
      "tagColor": "#hex",
      "tagBg": "rgba or hex",
      "suggestion": "short action line, max 8 words",
      "suggestedAmount": number or null
    }
  }
}`

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      })
      const data = await response.json()
      const raw = data.content?.map((c: { type: string; text?: string }) => c.text || "").join("")
      const clean = raw.replace(/```json|```/g, "").trim()
      const parsed = JSON.parse(clean)
      setAiSummary(parsed.summary || "")
      setAiInsights(parsed.insights || {})
      setAiLoaded(true)
    } catch {
      setAiSummary("Could not load AI insights right now.")
    }

    setAiLoading(false)
  }

  const onSubmit = async (data: AddForm) => {
    setServerError(null)
    const result = await addBeneficiary({ name: data.name, email: data.email })
    if (!result.success) { setServerError(result.message); return }
    reset()
    setShowForm(false)
    setAiLoaded(false) // reset insights after new contact
    await fetchBeneficiaries()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteBeneficiary(id)
    setBeneficiaries((prev) => prev.filter((b) => b._id !== id))
    setDeletingId(null)
    // remove from insights
    setAiInsights((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 text-[13px] text-[#0a3d2e] bg-white border rounded-[10px] outline-none transition-all placeholder:text-[#b0c4bb] focus:border-[#1d9e75] focus:ring-2 focus:ring-[#1d9e75]/10 ${
      hasError ? "border-red-300 bg-red-50/30" : "border-[#dde8e3]"
    }`

  const avatarColors = [
    "linear-gradient(135deg, #1d9e75 0%, #0d6b4d 100%)",
    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
    "linear-gradient(135deg, #db2777 0%, #9d174d 100%)",
    "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
  ]

  return (
    <div className="max-w-[640px]">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-[22px] font-bold text-[#0a3d2e] tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Beneficiaries
          </h1>
          <p className="text-[13px] text-[#5a7568] mt-0.5">
            Saved contacts for quick transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
        

          {/* Add New button */}
          <button
            onClick={() => { setShowForm(!showForm); setServerError(null) }}
            className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold rounded-[10px] border transition-all duration-150 ${
              showForm
                ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                : "text-white border-transparent"
            }`}
            style={
              showForm
                ? {}
                : {
                    background: "linear-gradient(135deg, #0f5c44 0%, #0a3d2e 100%)",
                    boxShadow: "0 4px 14px rgba(10,61,46,0.3)",
                  }
            }
          >
            {showForm ? <X size={13} /> : <UserPlus size={13} />}
            {showForm ? "Cancel" : "Add New"}
          </button>
        </div>
      </div>

      {/* AI Summary banner */}
      {aiLoaded && aiSummary && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[12px] mb-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0d4a36 0%, #082e20 100%)",
            border: "1px solid rgba(29,158,117,0.25)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(29,158,117,0.2) 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
            }}
          />
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #1d9e75 0%, #0d6b4d 100%)",
              boxShadow: "0 0 10px rgba(29,158,117,0.4)",
            }}
          >
            <Sparkles size={11} className="text-white" />
          </div>
          <p className="text-[12.5px] relative" style={{ color: "rgba(168,213,191,0.9)" }}>
            {aiSummary}
          </p>
          <button
            onClick={() => { setAiLoaded(false); setAiInsights({}); setAiSummary("") }}
            className="cursor-pointer flex-shrink-0 ml-auto w-5 h-5 flex items-center justify-center rounded-full transition-colors relative"
            style={{ color: "rgba(111,168,144,0.5)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(111,168,144,0.5)")}
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div
          className="rounded-[16px] p-5 mb-5"
          style={{
            background: "#ffffff",
            border: "1px solid #dde8e3",
            boxShadow: "0 2px 16px rgba(10,61,46,0.06)",
          }}
        >
          <h2
            className="text-[14px] font-bold text-[#0a3d2e] mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            New Beneficiary
          </h2>

          {serverError && (
            <div
              className="text-[12px] font-medium px-4 py-3 rounded-[10px] mb-4"
              style={{
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#dc2626",
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Full Name" error={errors.name?.message}>
              <input {...register("name")} placeholder="John Doe" className={inputClass(!!errors.name)} />
            </Field>

            <Field label="Email Address" error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                placeholder="john@example.com"
                className={inputClass(!!errors.email)}
              />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer flex items-center justify-center gap-2 px-6 py-2.5 text-white text-[13px] font-semibold rounded-[10px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #0f5c44 0%, #0a3d2e 100%)",
                boxShadow: "0 4px 14px rgba(10,61,46,0.25)",
              }}
            >
              {isSubmitting ? (
                <><Loader2 size={13} className="animate-spin" /> Adding…</>
              ) : (
                <><Plus size={13} /> Save Beneficiary</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* List card */}
      <div
        className="rounded-[16px] overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid #dde8e3",
          boxShadow: "0 2px 16px rgba(10,61,46,0.06)",
        }}
      >
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin" style={{ color: "#1d9e75" }} />
          </div>
        )}

        {/* Empty */}
        {!loading && beneficiaries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f0faf5 0%, #e8f5ef 100%)",
                border: "1px solid #c8e8d8",
              }}
            >
              <User size={22} style={{ color: "#8a9e96" }} />
            </div>
            <div className="text-center">
              <p className="text-[13.5px] font-semibold text-[#0a3d2e]">No saved contacts yet</p>
              <p className="text-[12px] text-[#8a9e96] mt-1">Add people you send money to regularly</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="cursor-pointer flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-[8px] transition-colors"
              style={{
                background: "rgba(29,158,117,0.1)",
                color: "#085041",
                border: "1px solid rgba(29,158,117,0.2)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(29,158,117,0.18)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(29,158,117,0.1)")}
            >
              <Plus size={12} />
              Add first contact
            </button>
          </div>
        )}

        {/* Rows */}
        {!loading && beneficiaries.map((b, i) => {
          const insight = aiInsights[b._id]
          const avatarBg = avatarColors[i % avatarColors.length]

          return (
            <div
              key={b._id}
              className="flex items-center justify-between px-4 py-3.5 border-b last:border-0 transition-colors"
              style={{ borderColor: "#f0f5f2" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fafcfb")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                  style={{ background: avatarBg, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                >
                  {b.name[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-[#0a3d2e]">{b.name}</p>
                    {insight && (
                      <InsightBadge
                        tag={insight.tag}
                        tagColor={insight.tagColor}
                        tagBg={insight.tagBg}
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-[#8a9e96] truncate">{b.email}</p>
                  {insight?.suggestion && (
                    <p className="text-[10.5px] mt-0.5" style={{ color: "rgba(29,158,117,0.8)" }}>
                      {insight.suggestion}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {/* Send button — with AI suggested amount if available */}
                <button
                  onClick={() => {
                    const params = new URLSearchParams({ email: b.email })
                    if (insight?.suggestedAmount) params.set("amount", String(insight.suggestedAmount))
                    router.push(`/dashboard/send?${params.toString()}`)
                  }}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-[8px] transition-all"
                  style={{
                    background: "rgba(29,158,117,0.1)",
                    color: "#085041",
                    border: "1px solid rgba(29,158,117,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "rgba(29,158,117,0.18)"
                    el.style.boxShadow = "0 2px 8px rgba(29,158,117,0.2)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "rgba(29,158,117,0.1)"
                    el.style.boxShadow = "none"
                  }}
                >
                  <Send size={11} />
                  {insight?.suggestedAmount ? `Send $${insight.suggestedAmount}` : "Send"}
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(b._id)}
                  disabled={deletingId === b._id}
                  className="cursor-pointer flex items-center justify-center w-7 h-7 rounded-[7px] transition-all disabled:opacity-40"
                  style={{ color: "#8a9e96" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "rgba(239,68,68,0.08)"
                    el.style.color = "#ef4444"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "transparent"
                    el.style.color = "#8a9e96"
                  }}
                >
                  {deletingId === b._id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer count */}
      {!loading && beneficiaries.length > 0 && (
        <p className="text-[11px] text-center mt-3" style={{ color: "rgba(90,117,104,0.6)" }}>
          {beneficiaries.length} contact{beneficiaries.length !== 1 ? "s" : ""} saved
        </p>
      )}
    </div>
  )
}