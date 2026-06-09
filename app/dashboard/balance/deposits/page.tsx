// app/dashboard/balance/deposits/page.tsx
"use client"

import { useState, useEffect } from "react"
import { getDepositsFiltered } from "@/actions/balance.actions"
import { ArrowDownLeft, Search, SlidersHorizontal, Loader2 } from "lucide-react"
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

  const fetchData = async (
    currentFilters: Filters,
    pageNum: number,
    append = false
  ) => {
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
        setTransactions((prev) =>
          append ? [...prev, ...result.data!.transactions] : result.data!.transactions
        )
        setHasMore(result.data.hasMore)
      } else {
        setError("Failed to load deposits. Please try again.")
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

  // mount হলে initial load
  useEffect(() => {
    fetchData(EMPTY_FILTERS, 1, false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setPage(1)
    fetchData(filters, 1, false)
  }

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    fetchData(filters, next, true)
  }

  const handleReset = () => {
    setFilters(EMPTY_FILTERS)
    setPage(1)
    setError(null)
    fetchData(EMPTY_FILTERS, 1, false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const inputClass = "w-full px-3 py-2 text-[12px] text-[#0a3d2e] bg-white border border-[#dde8e3] rounded-[8px] outline-none focus:border-[#1d9e75] focus:ring-1 focus:ring-[#1d9e75]/20 placeholder:text-[#8a9e96]"

  return (
    <div className="p-6 max-w-[900px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-[22px] font-bold text-[#0a3d2e] tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Deposits
          </h1>
          <p className="text-[13px] text-[#5a7568] mt-0.5">
            All your deposit transactions
          </p>
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

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-[#dde8e3] rounded-[14px] p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">Min Amount</label>
              <input type="number" placeholder="$0" value={filters.minAmount}
                onChange={(e) => setFilters(f => ({ ...f, minAmount: e.target.value }))}
                onKeyDown={handleKeyDown} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">Max Amount</label>
              <input type="number" placeholder="$99,999" value={filters.maxAmount}
                onChange={(e) => setFilters(f => ({ ...f, maxAmount: e.target.value }))}
                onKeyDown={handleKeyDown} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">Start Date</label>
              <input type="date" value={filters.startDate}
                onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                onKeyDown={handleKeyDown} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">End Date</label>
              <input type="date" value={filters.endDate}
                onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                onKeyDown={handleKeyDown} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">Status</label>
              <select value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                className={inputClass}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s || "All statuses"}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 mt-4">
              <button onClick={handleSearch} disabled={loading}
                className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-[#0a3d2e] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[#0f5c44] disabled:opacity-60 transition-colors">
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                Search
              </button>
              <button onClick={handleReset} disabled={loading}
                className="cursor-pointer px-4 py-2 bg-white border border-[#dde8e3] text-[#5a7568] text-[12px] font-semibold rounded-[8px] hover:bg-[#f6faf8] disabled:opacity-60 transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-3 border-b border-[#f0f5f2] bg-[#f6faf8]">
          {["Date", "Reference", "Amount", "Status"].map((h) => (
            <p key={h} className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase">{h}</p>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-[#1d9e75]" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-[13px] text-red-400">{error}</p>
            <button onClick={handleSearch} className="text-[12px] text-[#1d9e75] underline">Try again</button>
          </div>
        )}

        {!loading && !error && searched && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <ArrowDownLeft size={28} className="text-[#dde8e3]" />
            <p className="text-[13px] text-[#8a9e96]">No deposits found</p>
          </div>
        )}

        {!loading && transactions.map((tx) => (
          <div key={tx._id}
            className="grid grid-cols-4 px-4 py-3.5 border-b border-[#f0f5f2] last:border-0 hover:bg-[#f6faf8] transition-colors">
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

      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <button onClick={handleLoadMore} disabled={loadingMore}
            className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-white border border-[#dde8e3] text-[#0a3d2e] text-[12px] font-semibold rounded-[10px] hover:bg-[#f6faf8] disabled:opacity-60 transition-colors">
            {loadingMore ? <><Loader2 size={13} className="animate-spin" />Loading...</> : "Load more"}
          </button>
        </div>
      )}
    </div>
  )
}