// app/dashboard/balance/withdrawals/page.tsx
"use client"

import { useState, useCallback } from "react"
import { getWithdrawalsFiltered } from "@/actions/balance.actions"
import { ArrowUpRight, Search, SlidersHorizontal, Loader2 } from "lucide-react"
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

export default function WithdrawalsPage() {
  const [transactions, setTransactions] = useState<SafeTransaction[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)

  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const fetchData = useCallback(async (pageNum: number, append = false) => {
    append ? setLoadingMore(true) : setLoading(true)

    const result = await getWithdrawalsFiltered({
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status || undefined,
      page: pageNum,
    })

    if (result.success && result.data) {
      setTransactions((prev) =>
        append ? [...prev, ...result.data!.transactions] : result.data!.transactions
      )
      setHasMore(result.data.hasMore)
    }

    append ? setLoadingMore(false) : setLoading(false)
    setSearched(true)
  }, [minAmount, maxAmount, startDate, endDate, status])

  const handleSearch = async () => {
    setPage(1)
    await fetchData(1, false)
  }

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setPage(nextPage)
    await fetchData(nextPage, true)
  }

  const handleReset = () => {
    setMinAmount("")
    setMaxAmount("")
    setStartDate("")
    setEndDate("")
    setStatus("")
    setTransactions([])
    setHasMore(false)
    setSearched(false)
    setPage(1)
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
            Withdrawals
          </h1>
          <p className="text-[13px] text-[#5a7568] mt-0.5">
            All your outgoing transfers
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
              <input type="number" placeholder="$0" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">Max Amount</label>
              <input type="number" placeholder="$99,999" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-1 block">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s || "All statuses"}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 mt-4">
              <button onClick={handleSearch} className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-[#0a3d2e] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[#0f5c44] transition-colors">
                <Search size={12} />
                Search
              </button>
              <button onClick={handleReset} className="cursor-pointer px-4 py-2 bg-white border border-[#dde8e3] text-[#5a7568] text-[12px] font-semibold rounded-[8px] hover:bg-[#f6faf8] transition-colors">
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

        {!loading && searched && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <ArrowUpRight size={28} className="text-[#dde8e3]" />
            <p className="text-[13px] text-[#8a9e96]">No withdrawals found</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Search size={24} className="text-[#dde8e3]" />
            <p className="text-[13px] text-[#8a9e96]">Use filters above and click Search</p>
          </div>
        )}

        {!loading && transactions.map((tx) => (
          <div
            key={tx._id}
            className="grid grid-cols-4 px-4 py-3.5 border-b border-[#f0f5f2] last:border-0 hover:bg-[#f6faf8] transition-colors"
          >
            <p className="text-[12px] text-[#5a7568]">{formatDate(tx.createdAt)}</p>
            <p className="text-[12px] font-mono text-[#5a7568] truncate pr-2">{tx.reference ?? "—"}</p>
            <p
              className="text-[13px] font-bold text-[#633806]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              -{formatUSD(tx.amount)}
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
        ))}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-white border border-[#dde8e3] text-[#0a3d2e] text-[12px] font-semibold rounded-[10px] hover:bg-[#f6faf8] disabled:opacity-60 transition-colors"
          >
            {loadingMore ? (
              <><Loader2 size={13} className="animate-spin" />Loading...</>
            ) : "Load more"}
          </button>
        </div>
      )}
    </div>
  )
}