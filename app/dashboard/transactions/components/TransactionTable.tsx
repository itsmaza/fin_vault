// app/dashboard/transactions/components/TransactionTable.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Search, SlidersHorizontal, Loader2,
  ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
  CreditCard, Building2, X, ExternalLink,
} from "lucide-react"
import type { SafeTransaction } from "@/types"

const STATUS_OPTIONS = ["", "COMPLETED", "PENDING", "FAILED", "CANCELLED"]

function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("en-US", {
    month:  "short",
    day:    "numeric",
    year:   "numeric",
    hour:   "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

type TxDirection = "deposit" | "sent" | "received" | "withdrawal" | "payment-sent" | "payment-received"

type TxFilters = {
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?:   string
  status?:    string
  page?:      number
}

type FetchFn = (
  filters: TxFilters
) => Promise<{ success: boolean; data?: { transactions: SafeTransaction[]; hasMore: boolean } }>

interface Props {
  title:         string
  description:   string
  fetchFn:       FetchFn
  currentUserId: string
  variant:       "all" | "sent" | "received" | "history"
}

type Filters = {
  minAmount: string
  maxAmount: string
  startDate: string
  endDate:   string
  status:    string
}

const EMPTY_FILTERS: Filters = {
  minAmount: "",
  maxAmount: "",
  startDate: "",
  endDate:   "",
  status:    "",
}

// ─── Direction helper ─────────────────────────────────────
function getTxDirection(tx: SafeTransaction, currentUserId: string): TxDirection {
  if (tx.type === "DEPOSIT")    return "deposit"
  if (tx.type === "WITHDRAWAL") return "withdrawal"
  if (tx.type === "PAYMENT") {
    return String(tx.senderId) === String(currentUserId)
      ? "payment-sent"
      : "payment-received"
  }
  return String(tx.senderId) === String(currentUserId) ? "sent" : "received"
}

// ─── Direction config ─────────────────────────────────────
const DIR_CONFIG: Record<TxDirection, {
  label:      string
  iconBg:     string
  iconColor:  string
  Icon:       React.ElementType
  isCredit:   boolean
}> = {
  deposit:         { label: "Deposit",          iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#085041]", Icon: ArrowDownLeft,  isCredit: true  },
  received:        { label: "Received",          iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#085041]", Icon: ArrowDownLeft,  isCredit: true  },
  sent:            { label: "Sent",              iconBg: "bg-[#FAEEDA]",  iconColor: "text-[#633806]", Icon: ArrowUpRight,   isCredit: false },
  withdrawal:      { label: "Bank Withdrawal",   iconBg: "bg-[#FAEEDA]",  iconColor: "text-[#633806]", Icon: Building2,      isCredit: false },
  "payment-sent":  { label: "FinVault Pay",      iconBg: "bg-[#FAEEDA]",  iconColor: "text-[#633806]", Icon: CreditCard,     isCredit: false },
  "payment-received": { label: "FinVault Pay",   iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#085041]", Icon: CreditCard,     isCredit: true  },
}

// ─── Detail Modal ─────────────────────────────────────────
function TxDetailModal({
  tx,
  currentUserId,
  onClose,
}: {
  tx:            SafeTransaction
  currentUserId: string
  onClose:       () => void
}) {
  const dir    = getTxDirection(tx, currentUserId)
  const config = DIR_CONFIG[dir]
  const { Icon } = config

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-[20px] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dde8e3]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${config.iconBg}`}>
              <Icon size={14} className={config.iconColor} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#0a3d2e]" style={{ fontFamily: "'Fraunces', serif" }}>
                {config.label}
              </p>
              <p className="text-[11px] text-[#8a9e96]">{formatDateTime(tx.createdAt)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer w-7 h-7 flex items-center justify-center text-[#8a9e96] hover:text-[#0a3d2e] hover:bg-[#f6faf8] rounded-full transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Amount */}
        <div className="px-6 py-5 border-b border-[#f0f5f2] text-center">
          <p className="text-[11px] font-semibold text-[#8a9e96] tracking-widest mb-1">AMOUNT</p>
          <p
            className={`text-[36px] font-bold leading-none ${config.isCredit ? "text-[#085041]" : "text-[#633806]"}`}
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {config.isCredit ? "+" : "-"}{formatUSD(tx.amount)}
          </p>
        </div>

        {/* Details */}
        <div className="px-6 py-4 flex flex-col gap-3">
          {[
            { label: "Status",    value: tx.status,    badge: true  },
            { label: "Type",      value: tx.type,      badge: false },
            { label: "Reference", value: tx.reference, badge: false, mono: true },
            ...(tx.note       ? [{ label: "Note",      value: tx.note,      badge: false }] : []),
            ...(tx.intentId   ? [{ label: "Intent ID", value: tx.intentId,  badge: false, mono: true }] : []),
            { label: "Date & Time", value: formatDateTime(tx.createdAt), badge: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4">
              <span className="text-[11px] text-[#8a9e96] font-medium flex-shrink-0">{item.label}</span>
              {item.badge ? (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  tx.status === "COMPLETED" ? "bg-[#E1F5EE] text-[#085041]"
                  : tx.status === "PENDING"  ? "bg-[#FFF8E7] text-[#B45309]"
                  : "bg-red-50 text-red-500"
                }`}>
                  {item.value}
                </span>
              ) : (
                <span className={`text-[12px] font-semibold text-[#0a3d2e] text-right truncate max-w-[220px] ${item.mono ? "font-mono" : ""}`}>
                  {item.value}
                </span>
              )}
            </div>
          ))}

          {/* Bank details */}
          {tx.bankDetails && (
            <div className="mt-1 bg-[#f6faf8] border border-[#dde8e3] rounded-[10px] p-3 flex flex-col gap-2">
              <p className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase">Bank Details</p>
              {[
                { label: "Bank",    value: tx.bankDetails.bankName },
                { label: "Account", value: `••••${tx.bankDetails.accountNumber.slice(-4)}` },
                { label: "Routing", value: tx.bankDetails.routingNumber },
                { label: "Holder",  value: tx.bankDetails.accountHolderName },
              ].map((b) => (
                <div key={b.label} className="flex justify-between">
                  <span className="text-[11px] text-[#8a9e96]">{b.label}</span>
                  <span className="text-[11px] font-semibold text-[#0a3d2e] font-mono">{b.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="cursor-pointer w-full py-2.5 bg-[#0a3d2e] hover:bg-[#0f5c44] text-white text-[13px] font-semibold rounded-[10px] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────
export default function TransactionTable({
  title,
  description,
  fetchFn,
  currentUserId,
  variant,
}: Props) {
  const [transactions, setTransactions] = useState<SafeTransaction[]>([])
  const [hasMore, setHasMore]           = useState(false)
  const [page, setPage]                 = useState(1)
  const [loading, setLoading]           = useState(false)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [searched, setSearched]         = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [mounted, setMounted]           = useState(false)
  const [showFilters, setShowFilters]   = useState(false)
  const [filters, setFilters]           = useState<Filters>(EMPTY_FILTERS)
  const [selectedTx, setSelectedTx]     = useState<SafeTransaction | null>(null)

  const fetchData = async (currentFilters: Filters, pageNum: number, append = false) => {
    setError(null)
    append ? setLoadingMore(true) : setLoading(true)

    try {
      const result = await fetchFn({
        minAmount: currentFilters.minAmount ? Number(currentFilters.minAmount) : undefined,
        maxAmount: currentFilters.maxAmount ? Number(currentFilters.maxAmount) : undefined,
        startDate: currentFilters.startDate || undefined,
        endDate:   currentFilters.endDate   || undefined,
        status:    currentFilters.status    || undefined,
        page:      pageNum,
      })

      if (result.success && result.data) {
        setTransactions((prev) =>
          append ? [...prev, ...result.data!.transactions] : result.data!.transactions
        )
        setHasMore(result.data.hasMore)
      } else {
        setError("Failed to load transactions.")
        if (!append) setTransactions([])
        setHasMore(false)
      }
    } catch {
      setError("Something went wrong.")
      if (!append) setTransactions([])
      setHasMore(false)
    } finally {
      append ? setLoadingMore(false) : setLoading(false)
      setSearched(true)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchData(EMPTY_FILTERS, 1, false)
  }, []) // eslint-disable-line

  const handleSearch  = () => { setPage(1); fetchData(filters, 1, false) }
  const handleLoadMore = () => { const n = page + 1; setPage(n); fetchData(filters, n, true) }
  const handleReset   = () => {
    setFilters(EMPTY_FILTERS)
    setPage(1)
    setError(null)
    fetchData(EMPTY_FILTERS, 1, false)
  }

  const inputClass = "w-full px-3 py-2 text-[12px] text-[#0a3d2e] bg-white border border-[#dde8e3] rounded-[8px] outline-none focus:border-[#1d9e75] focus:ring-1 focus:ring-[#1d9e75]/20 placeholder:text-[#8a9e96]"

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#0a3d2e] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            {title}
          </h1>
          <p className="text-[13px] text-[#5a7568] mt-0.5">{description}</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold rounded-[8px] border transition-colors ${
            showFilters
              ? "bg-[#0a3d2e] text-white border-[#0a3d2e]"
              : "bg-white text-[#0a3d2e] border-[#dde8e3] hover:bg-[#f6faf8]"
          }`}
        >
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filters */}
      {mounted && showFilters && (
        <div className="bg-white border border-[#dde8e3] rounded-[14px] p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {[
              { label: "Min Amount", key: "minAmount", type: "number", placeholder: "$0" },
              { label: "Max Amount", key: "maxAmount", type: "number", placeholder: "$99,999" },
              { label: "Start Date", key: "startDate", type: "date",   placeholder: "" },
              { label: "End Date",   key: "endDate",   type: "date",   placeholder: "" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={filters[key as keyof Filters]}
                  onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className={inputClass}
              >
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
        {/* Head — desktop */}
        <div className="hidden sm:grid grid-cols-5 px-4 py-3 bg-[#f6faf8] border-b border-[#f0f5f2]">
          {["Date & Time", "Type", "Reference", "Amount", "Status"].map((h) => (
            <p key={h} className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase">{h}</p>
          ))}
        </div>

        {/* Head — mobile */}
        <div className="sm:hidden grid grid-cols-3 px-4 py-3 bg-[#f6faf8] border-b border-[#f0f5f2]">
          {["Type", "Amount", "Status"].map((h) => (
            <p key={h} className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase">{h}</p>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-14">
            <Loader2 size={20} className="animate-spin text-[#1d9e75]" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <p className="text-[13px] text-red-400">{error}</p>
            <button onClick={handleSearch} className="cursor-pointer text-[12px] text-[#1d9e75] underline">Try again</button>
          </div>
        )}

        {!loading && !error && searched && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <ArrowLeftRight size={24} className="text-[#dde8e3]" />
            <p className="text-[13px] text-[#8a9e96]">No transactions found</p>
          </div>
        )}

        {!loading && transactions.map((tx) => {
          const dir    = getTxDirection(tx, currentUserId)
          const config = DIR_CONFIG[dir]
          const { Icon } = config

          return (
            <div
              key={tx._id}
              onClick={() => setSelectedTx(tx)}
              className="cursor-pointer hover:bg-[#f6faf8] transition-colors border-b border-[#f0f5f2] last:border-0"
            >
              {/* Desktop row */}
              <div className="hidden sm:grid grid-cols-5 px-4 py-3.5 items-center">
                <div>
                  <p className="text-[12px] text-[#5a7568]">{formatDate(tx.createdAt)}</p>
                  <p className="text-[10px] text-[#8a9e96] mt-0.5">
                    {new Date(tx.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
                    <Icon size={12} className={config.iconColor} />
                  </div>
                  <span className="text-[11px] font-medium text-[#5a7568] truncate">{config.label}</span>
                </div>

                <p className="text-[11px] font-mono text-[#8a9e96] truncate pr-2">
                  {tx.reference ?? "—"}
                </p>

                <p
                  className={`text-[13px] font-bold ${config.isCredit ? "text-[#085041]" : "text-[#633806]"}`}
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {config.isCredit ? "+" : "-"}{formatUSD(tx.amount)}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${
                    tx.status === "COMPLETED" ? "bg-[#E1F5EE] text-[#085041]"
                    : tx.status === "PENDING"  ? "bg-[#FFF8E7] text-[#B45309]"
                    : "bg-red-50 text-red-500"
                  }`}>
                    {tx.status}
                  </span>
                  <ExternalLink size={11} className="text-[#8a9e96]" />
                </div>
              </div>

              {/* Mobile row */}
              <div className="sm:hidden grid grid-cols-3 px-4 py-3.5 items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
                    <Icon size={11} className={config.iconColor} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#0a3d2e] truncate">{config.label}</p>
                    <p className="text-[10px] text-[#8a9e96]">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>

                <p
                  className={`text-[12px] font-bold ${config.isCredit ? "text-[#085041]" : "text-[#633806]"}`}
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {config.isCredit ? "+" : "-"}{formatUSD(tx.amount)}
                </p>

                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full w-fit ${
                  tx.status === "COMPLETED" ? "bg-[#E1F5EE] text-[#085041]"
                  : tx.status === "PENDING"  ? "bg-[#FFF8E7] text-[#B45309]"
                  : "bg-red-50 text-red-500"
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-white border border-[#dde8e3] text-[#0a3d2e] text-[12px] font-semibold rounded-[10px] hover:bg-[#f6faf8] disabled:opacity-60 transition-colors"
          >
            {loadingMore ? <><Loader2 size={13} className="animate-spin" />Loading...</> : "Load more"}
          </button>
        </div>
      )}

      {/* Detail modal */}
      {selectedTx && (
        <TxDetailModal
          tx={selectedTx}
          currentUserId={currentUserId}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  )
}