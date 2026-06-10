// app/dashboard/balance/deposits/page.tsx
"use client"

import { useState, useEffect } from "react"
import { getDepositsFiltered, deposit } from "@/actions/deposit.actions"
import { ArrowDownLeft, Search, SlidersHorizontal, Loader2, Plus, X, CreditCard, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { SafeTransaction } from "@/types"

// ─── Test Cards ───────────────────────────────────────────
const TEST_CARDS = [
  { number: "4242 4242 4242 4242", label: "Visa — Always succeeds", color: "bg-[#E1F5EE] text-[#085041]" },
  { number: "4000 0000 0000 0002", label: "Visa — Also succeeds", color: "bg-[#E1F5EE] text-[#085041]" },
  { number: "4000 0000 0000 9995", label: "Declined — Insufficient funds", color: "bg-[#FAEEDA] text-[#633806]" },
  { number: "4000 0000 0000 0069", label: "Declined — Expired card", color: "bg-red-50 text-red-500" },
]

// ─── Schema ───────────────────────────────────────────────
const depositSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be greater than $0")
    .refine((v) => Number(v) <= 100000, "Maximum deposit is $100,000"),
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .refine((v) => v.replace(/\s/g, "").length === 16, "Must be 16 digits"),
  expiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Format: MM/YY"),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, "3 or 4 digits"),
  cardName: z
    .string()
    .min(2, "Name is required"),
  note: z.string().max(100).optional(),
})

type DepositForm = z.infer<typeof depositSchema>

// ─── Types ────────────────────────────────────────────────
type Filters = {
  minAmount: string
  maxAmount: string
  startDate: string
  endDate: string
  status: string
}

const EMPTY_FILTERS: Filters = {
  minAmount: "",
  maxAmount: "",
  startDate: "",
  endDate: "",
  status: "",
}

const STATUS_OPTIONS = ["", "COMPLETED", "PENDING", "FAILED", "CANCELLED"]

function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim()
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length >= 2) return digits.slice(0, 2) + "/" + digits.slice(2)
  return digits
}

// ─── Field Component ──────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#5a7568] tracking-wide uppercase">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────
export default function DepositsPage() {
  const [transactions, setTransactions] = useState<SafeTransaction[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)

  // Deposit modal
  const [showModal, setShowModal] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCvv, setShowCvv] = useState(false)
  const [showTestCards, setShowTestCards] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepositForm>({ resolver: zodResolver(depositSchema) })

  const watchedAmount = watch("amount")
  const watchedCard = watch("cardNumber")

  // ─── Fetch deposits ───────────────────────────────────
  const fetchData = async (currentFilters: Filters, pageNum: number, append = false) => {
    setError(null)
    append ? setLoadingMore(true) : setLoading(true)

    try {
      const result = await getDepositsFiltered({
        minAmount: currentFilters.minAmount ? Number(currentFilters.minAmount) : undefined,
        maxAmount: currentFilters.maxAmount ? Number(currentFilters.maxAmount) : undefined,
        startDate: currentFilters.startDate || undefined,
        endDate: currentFilters.endDate || undefined,
        status: currentFilters.status || undefined,
        page: pageNum,
      })

      if (result.success && result.data) {
        setTransactions((prev) => append ? [...prev, ...result.data!.transactions] : result.data!.transactions)
        setHasMore(result.data.hasMore)
      } else {
        setError("Failed to load deposits.")
        if (!append) setTransactions([])
      }
    } catch {
      setError("Something went wrong.")
      if (!append) setTransactions([])
    } finally {
      append ? setLoadingMore(false) : setLoading(false)
      setSearched(true)
    }
  }

  useEffect(() => { fetchData(EMPTY_FILTERS, 1, false) }, []) // eslint-disable-line

  const handleSearch = () => { setPage(1); fetchData(filters, 1, false) }
  const handleLoadMore = () => { const n = page + 1; setPage(n); fetchData(filters, n, true) }
  const handleReset = () => { setFilters(EMPTY_FILTERS); setPage(1); setError(null); fetchData(EMPTY_FILTERS, 1, false) }

  // ─── Deposit submit ───────────────────────────────────
  const onSubmit = async (data: DepositForm) => {
    setServerError(null)
    const result = await deposit({
      amount: Number(data.amount),
      note: data.note,
      card: {
        number: data.cardNumber,
        expiry: data.expiry,
        cvv: data.cvv,
        name: data.cardName,
      },
    })

    if (!result.success) {
      setServerError(result.message)
      return
    }

    setSuccess(true)
    reset()
    setShowModal(false)
    setSuccess(false)
    fetchData(EMPTY_FILTERS, 1, false)
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 text-[13px] text-[#0a3d2e] bg-white border rounded-[10px] outline-none transition-all placeholder:text-[#8a9e96] focus:border-[#1d9e75] focus:ring-2 focus:ring-[#1d9e75]/10 ${
      hasError ? "border-red-300 bg-red-50/30" : "border-[#dde8e3]"
    }`

  const filterInputClass = "w-full px-3 py-2 text-[12px] text-[#0a3d2e] bg-white border border-[#dde8e3] rounded-[8px] outline-none focus:border-[#1d9e75] focus:ring-1 focus:ring-[#1d9e75]/20 placeholder:text-[#8a9e96]"

  return (
    <div className="max-w-[900px]">

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-3 bg-[#E1F5EE] border border-[#b2dece] text-[#085041] text-[13px] font-medium px-4 py-3 rounded-[10px] mb-4">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          Deposit successful! Balance updated.
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#0a3d2e] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Deposits
          </h1>
          <p className="text-[13px] text-[#5a7568] mt-0.5">Add funds to your account</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold rounded-[8px] border transition-colors ${
              showFilters ? "bg-[#0a3d2e] text-white border-[#0a3d2e]" : "bg-white text-[#0a3d2e] border-[#dde8e3] hover:bg-[#f6faf8]"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button
            onClick={() => { setShowModal(true); setServerError(null) }}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#0a3d2e] hover:bg-[#0f5c44] text-white text-[12px] font-semibold rounded-[8px] transition-colors"
          >
            <Plus size={13} />
            Add Deposit
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-[#dde8e3] rounded-[14px] p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {[
              { label: "Min Amount", key: "minAmount", type: "number", placeholder: "$0" },
              { label: "Max Amount", key: "maxAmount", type: "number", placeholder: "$100,000" },
              { label: "Start Date", key: "startDate", type: "date", placeholder: "" },
              { label: "End Date",   key: "endDate",   type: "date", placeholder: "" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={filters[key as keyof Filters]}
                  onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className={filterInputClass}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">Status</label>
              <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className={filterInputClass}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
              </select>
            </div>
            <button onClick={handleSearch} disabled={loading} className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-[#0a3d2e] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[#0f5c44] disabled:opacity-60 transition-colors">
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              Search
            </button>
            <button onClick={handleReset} disabled={loading} className="cursor-pointer px-4 py-2 bg-white border border-[#dde8e3] text-[#5a7568] text-[12px] font-semibold rounded-[8px] hover:bg-[#f6faf8] disabled:opacity-60 transition-colors">
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] overflow-hidden">
        {/* Head */}
        <div className="grid grid-cols-4 px-4 py-3 border-b border-[#f0f5f2] bg-[#f6faf8]">
          {["Date", "Reference", "Amount", "Status"].map((h) => (
            <p key={h} className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase">{h}</p>
          ))}
        </div>

        {loading && <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-[#1d9e75]" /></div>}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-[13px] text-red-400">{error}</p>
            <button onClick={handleSearch} className="cursor-pointer text-[12px] text-[#1d9e75] underline">Try again</button>
          </div>
        )}

        {!loading && !error && searched && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f6faf8] border border-[#dde8e3] flex items-center justify-center">
              <ArrowDownLeft size={18} className="text-[#8a9e96]" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-[#0a3d2e]">No deposits yet</p>
              <p className="text-[12px] text-[#8a9e96] mt-0.5">Click "Add Deposit" to fund your account</p>
            </div>
          </div>
        )}

        {!loading && transactions.map((tx) => (
          <div key={tx._id} className="grid grid-cols-4 px-4 py-3.5 border-b border-[#f0f5f2] last:border-0 hover:bg-[#f6faf8] transition-colors items-center">
            <p className="text-[12px] text-[#5a7568]">{formatDate(tx.createdAt)}</p>
            <p className="text-[12px] font-mono text-[#5a7568] truncate pr-2">{tx.reference ?? "—"}</p>
            <p className="text-[13px] font-bold text-[#085041]" style={{ fontFamily: "'Fraunces', serif" }}>
              +{formatUSD(tx.amount)}
            </p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${
              tx.status === "COMPLETED" ? "bg-[#E1F5EE] text-[#085041]"
              : tx.status === "PENDING" ? "bg-[#FFF8E7] text-[#B45309]"
              : "bg-red-50 text-red-500"
            }`}>
              {tx.status}
            </span>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <button onClick={handleLoadMore} disabled={loadingMore}
            className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-white border border-[#dde8e3] text-[#0a3d2e] text-[12px] font-semibold rounded-[10px] hover:bg-[#f6faf8] disabled:opacity-60 transition-colors">
            {loadingMore ? <><Loader2 size={13} className="animate-spin" />Loading...</> : "Load more"}
          </button>
        </div>
      )}

      {/* ─── Deposit Modal ─────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[20px] shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dde8e3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#E1F5EE] rounded-[8px] flex items-center justify-center">
                  <CreditCard size={14} className="text-[#085041]" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-[#0a3d2e]" style={{ fontFamily: "'Fraunces', serif" }}>
                    Add Deposit
                  </h2>
                  <p className="text-[11px] text-[#8a9e96]">Max $100,000 per transaction</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="cursor-pointer w-7 h-7 flex items-center justify-center text-[#8a9e96] hover:text-[#0a3d2e] hover:bg-[#f6faf8] rounded-full transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[75vh]">

              {/* Test cards */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowTestCards(!showTestCards)}
                  className="cursor-pointer flex items-center gap-1.5 text-[11px] font-semibold text-[#1d9e75] hover:underline"
                >
                  <CreditCard size={11} />
                  {showTestCards ? "Hide" : "Show"} test card numbers
                </button>

                {showTestCards && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {TEST_CARDS.map((card) => (
                      <button
                        key={card.number}
                        type="button"
                        onClick={() => {
                          setValue("cardNumber", card.number, { shouldValidate: true })
                          setValue("expiry", "12/26", { shouldValidate: true })
                          setValue("cvv", "123", { shouldValidate: true })
                          setValue("cardName", "Test User", { shouldValidate: true })
                          setShowTestCards(false)
                        }}
                        className="cursor-pointer flex items-center justify-between px-3 py-2 bg-[#f6faf8] border border-[#dde8e3] rounded-[8px] hover:border-[#1d9e75] transition-colors text-left"
                      >
                        <span className="text-[11px] font-mono font-semibold text-[#0a3d2e]">
                          {card.number}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.color}`}>
                          {card.label}
                        </span>
                      </button>
                    ))}
                    <p className="text-[10px] text-[#8a9e96] mt-1">
                      Click any card to auto-fill. Use any future expiry + 3-digit CVV.
                    </p>
                  </div>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-3 rounded-[10px] mb-4">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                {/* Amount */}
                <Field label="Deposit Amount (USD)" error={errors.amount?.message}>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[#8a9e96]">$</span>
                    <input
                      {...register("amount")}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={`${inputClass(!!errors.amount)} pl-7`}
                    />
                  </div>
                  {watchedAmount && Number(watchedAmount) > 0 && (
                    <p className="text-[11px] text-[#1d9e75] font-medium">
                      Depositing {formatUSD(Number(watchedAmount))}
                    </p>
                  )}
                </Field>

                {/* Card number */}
                <Field label="Card Number" error={errors.cardNumber?.message}>
                  <div className="relative">
                    <input
                      {...register("cardNumber")}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className={`${inputClass(!!errors.cardNumber)} font-mono tracking-wider`}
                      onChange={(e) => {
                        setValue("cardNumber", formatCardNumber(e.target.value), { shouldValidate: true })
                      }}
                    />
                    {watchedCard && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CreditCard size={15} className="text-[#8a9e96]" />
                      </div>
                    )}
                  </div>
                </Field>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry (MM/YY)" error={errors.expiry?.message}>
                    <input
                      {...register("expiry")}
                      placeholder="12/26"
                      maxLength={5}
                      className={inputClass(!!errors.expiry)}
                      onChange={(e) => {
                        setValue("expiry", formatExpiry(e.target.value), { shouldValidate: true })
                      }}
                    />
                  </Field>

                  <Field label="CVV" error={errors.cvv?.message}>
                    <div className="relative">
                      <input
                        {...register("cvv")}
                        type={showCvv ? "text" : "password"}
                        placeholder="123"
                        maxLength={4}
                        className={`${inputClass(!!errors.cvv)} pr-9 tracking-widest`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCvv(!showCvv)}
                        className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9e96] hover:text-[#5a7568] transition-colors"
                      >
                        {showCvv ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </Field>
                </div>

                {/* Card name */}
                <Field label="Cardholder Name" error={errors.cardName?.message}>
                  <input
                    {...register("cardName")}
                    placeholder="John Doe"
                    className={inputClass(!!errors.cardName)}
                  />
                </Field>

                {/* Note */}
                <Field label="Note (Optional)" error={errors.note?.message}>
                  <input
                    {...register("note")}
                    placeholder="e.g. Monthly top-up"
                    className={inputClass(!!errors.note)}
                  />
                </Field>

                {/* Actions */}
                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="cursor-pointer flex-1 py-2.5 bg-white border border-[#dde8e3] text-[#5a7568] text-[13px] font-semibold rounded-[10px] hover:bg-[#f6faf8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0a3d2e] hover:bg-[#0f5c44] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-[10px] transition-colors"
                  >
                    {isSubmitting ? (
                      <><Loader2 size={14} className="animate-spin" />Processing...</>
                    ) : (
                      <><CreditCard size={14} />Deposit Funds</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}