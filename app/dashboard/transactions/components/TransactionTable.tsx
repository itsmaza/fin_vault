// app/dashboard/transactions/components/TransactionTable.tsx
"use client"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal, Loader2, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react"
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

type TxFilters = {
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  status?: string
  page?: number
}

type FetchFn = (
  filters: TxFilters
) => Promise<{ success: boolean; data?: { transactions: SafeTransaction[]; hasMore: boolean } }>

interface TransactionTableProps {
  title: string
  description: string
  fetchFn: FetchFn
  currentUserId: string
  variant: "all" | "sent" | "received" | "history"
}

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

export default function TransactionTable({
  title,
  description,
  fetchFn,
  currentUserId,
  variant,
}: TransactionTableProps) {
  const [transactions, setTransactions] = useState<SafeTransaction[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  // useCallback বাদ — filters সরাসরি parameter হিসেবে pass, stale closure নেই
  const fetchData = async (
    currentFilters: Filters,
    pageNum: number,
    append = false
  ) => {
    setError(null)
    append ? setLoadingMore(true) : setLoading(true)

    try {
      const result = await fetchFn({
        minAmount: currentFilters.minAmount ? Number(currentFilters.minAmount) : undefined,
        maxAmount: currentFilters.maxAmount ? Number(currentFilters.maxAmount) : undefined,
        startDate: currentFilters.startDate || undefined,
        endDate: currentFilters.endDate || undefined,
        status: currentFilters.status || undefined,
        page: pageNum,
      })

      if (result.success && result.data) {
        setTransactions((prev) =>
          append ? [...prev, ...result.data!.transactions] : result.data!.transactions
        )
        setHasMore(result.data.hasMore)
      } else {
        setError("Failed to load transactions. Please try again.")
        if (!append) setTransactions([])
        setHasMore(false)
      }
    } catch (err) {
      console.error("fetchData error:", err)
      setError("Something went wrong. Please try again.")
      if (!append) setTransactions([])
      setHasMore(false)
    } finally {
      append ? setLoadingMore(false) : setLoading(false)
      setSearched(true)
    }
  }

  // mount হলে hydration fix + initial data load (empty filters দিয়ে)
  useEffect(() => {
    setMounted(true)
    setShowFilters(true)
    fetchData(EMPTY_FILTERS, 1, false) // ← initial load
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setPage(1)
    fetchData(filters, 1, false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    fetchData(filters, next, true)
  }

  const handleReset = () => {
    setFilters(EMPTY_FILTERS)
    setPage(1)
    setTransactions([])
    setHasMore(false)
    setSearched(false)
    setError(null)
    // reset করলে আবার সব data দেখাও
    fetchData(EMPTY_FILTERS, 1, false)
  }

  const getTxDirection = (tx: SafeTransaction) => {
    if (tx.type === "DEPOSIT") return "deposit"
    if (String(tx.senderId) === String(currentUserId)) return "sent"
    return "received"
  }

  const inputClass =
    "w-full px-3 py-2 text-[12px] text-[#0a3d2e] bg-white border border-[#dde8e3] rounded-[8px] outline-none focus:border-[#1d9e75] focus:ring-1 focus:ring-[#1d9e75]/20 placeholder:text-[#8a9e96]"

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-[22px] font-bold text-[#0a3d2e] tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
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
          Filters
        </button>
      </div>

      {/* Filters — mounted check: hydration mismatch এড়াতে */}
      {mounted && showFilters && (
        <div className="bg-white border border-[#dde8e3] rounded-[14px] p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">
                Min Amount
              </label>
              <input
                type="number"
                placeholder="$0"
                value={filters.minAmount}
                onChange={(e) => setFilters(f => ({ ...f, minAmount: e.target.value }))}
                onKeyDown={handleKeyDown}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">
                Max Amount
              </label>
              <input
                type="number"
                placeholder="$99,999"
                value={filters.maxAmount}
                onChange={(e) => setFilters(f => ({ ...f, maxAmount: e.target.value }))}
                onKeyDown={handleKeyDown}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                onKeyDown={handleKeyDown}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                onKeyDown={handleKeyDown}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s || "All statuses"}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-[#0a3d2e] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[#0f5c44] disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              Search
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="cursor-pointer px-4 py-2 bg-white border border-[#dde8e3] text-[#5a7568] text-[12px] font-semibold rounded-[8px] hover:bg-[#f6faf8] disabled:opacity-60 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] overflow-hidden">
        {/* Table head */}
        <div className="grid grid-cols-5 px-4 py-3 bg-[#f6faf8] border-b border-[#f0f5f2]">
          {["Date", "Type", "Reference", "Amount", "Status"].map((h) => (
            <p key={h} className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase">
              {h}
            </p>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-14">
            <Loader2 size={20} className="animate-spin text-[#1d9e75]" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <p className="text-[13px] text-red-400">{error}</p>
            <button onClick={handleSearch} className="text-[12px] text-[#1d9e75] underline">
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && searched && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <ArrowLeftRight size={24} className="text-[#dde8e3]" />
            <p className="text-[13px] text-[#8a9e96]">No transactions found</p>
          </div>
        )}

        {/* Rows */}
        {!loading && transactions.map((tx) => {
          const dir = getTxDirection(tx)
          const isCredit = dir === "received" || dir === "deposit"

          return (
            <div
              key={tx._id}
              className="grid grid-cols-5 px-4 py-3.5 border-b border-[#f0f5f2] last:border-0 hover:bg-[#f6faf8] transition-colors items-center"
            >
              <p className="text-[12px] text-[#5a7568]">{formatDate(tx.createdAt)}</p>

              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    dir === "sent" ? "bg-[#FAEEDA]" : "bg-[#E1F5EE]"
                  }`}
                >
                  {dir === "sent" ? (
                    <ArrowUpRight size={12} className="text-[#633806]" />
                  ) : (
                    <ArrowDownLeft size={12} className="text-[#085041]" />
                  )}
                </div>
                <span className="text-[11px] font-medium text-[#5a7568] capitalize">{dir}</span>
              </div>

              <p className="text-[11px] font-mono text-[#8a9e96] truncate pr-2">
                {tx.reference ?? "—"}
              </p>

              <p
                className={`text-[13px] font-bold ${isCredit ? "text-[#085041]" : "text-[#633806]"}`}
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {isCredit ? "+" : "-"}{formatUSD(tx.amount)}
              </p>

              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${
                  tx.status === "COMPLETED"
                    ? "bg-[#E1F5EE] text-[#085041]"
                    : tx.status === "PENDING"
                    ? "bg-[#FFF8E7] text-[#B45309]"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {tx.status}
              </span>
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
            {loadingMore ? (
              <><Loader2 size={13} className="animate-spin" />Loading...</>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  )
}