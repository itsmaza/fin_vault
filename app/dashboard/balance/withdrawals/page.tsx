// app/dashboard/balance/withdrawals/page.tsx
"use client"

import { useState, useEffect } from "react"
import { getWithdrawalsFiltered, withdrawFunds } from "@/actions/withdrawal.actions"
import { ArrowUpRight, Search, SlidersHorizontal, Loader2, Plus, X, Building2, CheckCircle2, Clock } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { SafeTransaction } from "@/types"

// ─── Schema ───────────────────────────────────────────────
const withdrawSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be greater than $0")
    .refine((v) => Number(v) <= 50000, "Maximum withdrawal is $50,000"),
  bankName: z.string().min(2, "Bank name is required").max(100),
  accountHolderName: z.string().min(2, "Account holder name is required").max(100),
  accountNumber: z
    .string()
    .min(8, "Account number must be at least 8 digits")
    .max(17, "Account number too long")
    .regex(/^\d+$/, "Digits only"),
  routingNumber: z
    .string()
    .length(9, "Routing number must be exactly 9 digits")
    .regex(/^\d+$/, "Digits only"),
  note: z.string().max(100).optional(),
})

type WithdrawForm = z.infer<typeof withdrawSchema>

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

const FAKE_BANKS = [
  "Chase Bank",
  "Bank of America",
  "Wells Fargo",
  "Citibank",
  "US Bank",
]

function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#5a7568] tracking-wide uppercase">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

export default function WithdrawalsPage() {
  const [transactions, setTransactions] = useState<SafeTransaction[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)

  // Withdraw modal
  const [showModal, setShowModal] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successAmount, setSuccessAmount] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawForm>({ resolver: zodResolver(withdrawSchema) })

  const watchedAmount = watch("amount")

  // ─── Fetch ────────────────────────────────────────────
  const fetchData = async (currentFilters: Filters, pageNum: number, append = false) => {
    setError(null)
    append ? setLoadingMore(true) : setLoading(true)

    try {
      const result = await getWithdrawalsFiltered({
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
        setError("Failed to load withdrawals.")
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

  // ─── Withdraw submit ──────────────────────────────────
  const onSubmit = async (data: WithdrawForm) => {
    setServerError(null)

    const result = await withdrawFunds({
      amount: Number(data.amount),
      bankName: data.bankName,
      accountHolderName: data.accountHolderName,
      accountNumber: data.accountNumber,
      routingNumber: data.routingNumber,
      note: data.note,
    })

    if (!result.success) {
      setServerError(result.message)
      return
    }

    setSuccessAmount(Number(data.amount))
    reset()
    setShowModal(false)
    setShowSuccess(true)
    fetchData(EMPTY_FILTERS, 1, false)
    setTimeout(() => setShowSuccess(false), 6000)
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 text-[13px] text-[#0a3d2e] bg-white border rounded-[10px] outline-none transition-all placeholder:text-[#8a9e96] focus:border-[#1d9e75] focus:ring-2 focus:ring-[#1d9e75]/10 ${
      hasError ? "border-red-300 bg-red-50/30" : "border-[#dde8e3]"
    }`

  const filterInputClass = "w-full px-3 py-2 text-[12px] text-[#0a3d2e] bg-white border border-[#dde8e3] rounded-[8px] outline-none focus:border-[#1d9e75] focus:ring-1 focus:ring-[#1d9e75]/20 placeholder:text-[#8a9e96]"

  return (
    <div className="max-w-[900px]">

      {/* Success banner */}
      {showSuccess && (
        <div className="bg-white border border-[#dde8e3] rounded-[14px] p-4 mb-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 size={16} className="text-[#085041]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0a3d2e]">
              Withdrawal of {formatUSD(successAmount)} initiated!
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock size={11} className="text-[#8a9e96]" />
              <p className="text-[12px] text-[#5a7568]">
                Funds will arrive in your bank account within <span className="font-semibold">1–3 business days</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#0a3d2e] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            Withdrawals
          </h1>
          <p className="text-[13px] text-[#5a7568] mt-0.5">Withdraw funds to your bank account</p>
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
            Withdraw Now
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-[#dde8e3] rounded-[14px] p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {[
              { label: "Min Amount", key: "minAmount", type: "number", placeholder: "$0" },
              { label: "Max Amount", key: "maxAmount", type: "number", placeholder: "$50,000" },
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
     <div className="grid grid-cols-5 px-4 py-3 border-b border-[#f0f5f2] bg-[#f6faf8]">
  {["Date & Time", "Bank", "Reference", "Amount", "Status"].map((h) => (
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
              <ArrowUpRight size={18} className="text-[#8a9e96]" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-[#0a3d2e]">No withdrawals yet</p>
              <p className="text-[12px] text-[#8a9e96] mt-0.5">Click "Withdraw Now" to transfer funds</p>
            </div>
          </div>
        )}

        
{!loading && transactions.map((tx) => (
  <div key={tx._id} className="grid grid-cols-5 px-4 py-3.5 border-b border-[#f0f5f2] last:border-0 hover:bg-[#f6faf8] transition-colors items-center">
    <div>
      <p className="text-[12px] text-[#5a7568]">{formatDate(tx.createdAt)}</p>
      <p className="text-[10px] text-[#8a9e96]">
        {new Date(tx.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
      </p>
    </div>
    <p className="text-[12px] text-[#5a7568] truncate pr-2">
      {tx.bankDetails?.bankName ?? "—"}
    </p>
    <p className="text-[11px] font-mono text-[#8a9e96] truncate pr-2">{tx.reference ?? "—"}</p>
    <p className="text-[13px] font-bold text-[#633806]" style={{ fontFamily: "'Fraunces', serif" }}>
      -{formatUSD(tx.amount)}
    </p>
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${
      tx.status === "COMPLETED" ? "bg-[#E1F5EE] text-[#085041]"
      : tx.status === "PENDING"  ? "bg-[#FFF8E7] text-[#B45309]"
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

      {/* ─── Withdraw Modal ───────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />

          <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[20px] shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dde8e3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#FAEEDA] rounded-[8px] flex items-center justify-center">
                  <Building2 size={14} className="text-[#633806]" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-[#0a3d2e]" style={{ fontFamily: "'Fraunces', serif" }}>
                    Withdraw Funds
                  </h2>
                  <p className="text-[11px] text-[#8a9e96]">1–3 business days to arrive</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="cursor-pointer w-7 h-7 flex items-center justify-center text-[#8a9e96] hover:text-[#0a3d2e] hover:bg-[#f6faf8] rounded-full transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[75vh]">

              {/* Info banner */}
              <div className="flex items-start gap-2.5 bg-[#FAEEDA]/50 border border-[#f5d9a8] rounded-[10px] px-3.5 py-3 mb-4">
                <Clock size={13} className="text-[#633806] mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-[#633806]">
                  Funds will be deducted immediately. Bank transfer takes <span className="font-semibold">1–3 business days</span>.
                </p>
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-3 rounded-[10px] mb-4">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                {/* Amount */}
                <Field label="Withdrawal Amount (USD)" error={errors.amount?.message}>
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
                    <p className="text-[11px] text-[#633806] font-medium">
                      {formatUSD(Number(watchedAmount))} will be deducted from your balance
                    </p>
                  )}
                </Field>

                {/* Bank name */}
                <Field label="Bank Name" error={errors.bankName?.message}>
                  <input
                    {...register("bankName")}
                    placeholder="Chase Bank"
                    list="bank-suggestions"
                    className={inputClass(!!errors.bankName)}
                  />
                  <datalist id="bank-suggestions">
                    {FAKE_BANKS.map((b) => <option key={b} value={b} />)}
                  </datalist>
                </Field>

                {/* Account holder */}
                <Field label="Account Holder Name" error={errors.accountHolderName?.message}>
                  <input
                    {...register("accountHolderName")}
                    placeholder="John Doe"
                    className={inputClass(!!errors.accountHolderName)}
                  />
                </Field>

                {/* Account number + routing */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Account Number" error={errors.accountNumber?.message}>
                    <input
                      {...register("accountNumber")}
                      placeholder="12345678"
                      maxLength={17}
                      className={inputClass(!!errors.accountNumber)}
                    />
                  </Field>
                  <Field label="Routing Number" error={errors.routingNumber?.message}>
                    <input
                      {...register("routingNumber")}
                      placeholder="021000021"
                      maxLength={9}
                      className={inputClass(!!errors.routingNumber)}
                    />
                  </Field>
                </div>

                {/* Note */}
                <Field label="Note (Optional)" error={errors.note?.message}>
                  <input
                    {...register("note")}
                    placeholder="e.g. Rent payment"
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
                      <><ArrowUpRight size={14} />Withdraw Funds</>
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