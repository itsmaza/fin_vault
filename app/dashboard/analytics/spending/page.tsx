// app/dashboard/analytics/spending/page.tsx
import { getSpendingAnalytics } from "@/actions/analytics.actions"
import { TrendingDown, AlertCircle } from "lucide-react"
import SpendingChart from "../components/SpendingChart"

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(n)
}

export default async function SpendingPage() {
  const result = await getSpendingAnalytics()
  const data   = result.data

  return (
    <div className="max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#0a3d2e] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
          Spending Analytics
        </h1>
        <p className="text-[13px] text-[#5a7568] mt-0.5">Track where your money goes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "TOTAL SPENT",   value: formatUSD(data?.totalSpent ?? 0),           sub: "All time" },
          { label: "AVG PER MONTH", value: formatUSD(data?.avgPerMonth ?? 0),           sub: "Last 12 months" },
          { label: "HIGHEST MONTH", value: formatUSD(data?.highestMonth?.amount ?? 0),  sub: data?.highestMonth?.month ?? "N/A" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#dde8e3] rounded-[14px] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-[#8a9e96] tracking-widest">{s.label}</p>
              <div className="w-7 h-7 rounded-full bg-[#FAEEDA] flex items-center justify-center">
                <TrendingDown size={13} className="text-[#633806]" />
              </div>
            </div>
            <p className="text-[20px] font-bold text-[#0a3d2e]" style={{ fontFamily: "'Fraunces', serif" }}>{s.value}</p>
            <p className="text-[11px] text-[#8a9e96] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SpendingChart data={data?.monthlyBreakdown ?? []} />
        </div>

        <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5">
          <h2 className="text-[13px] font-bold text-[#0a3d2e] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
            By Category
          </h2>
          {!data?.categories?.length ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <AlertCircle size={20} className="text-[#dde8e3]" />
              <p className="text-[12px] text-[#8a9e96]">No spending data</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.categories.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-[#0a3d2e]">{cat.category}</span>
                    <span className="text-[12px] font-bold text-[#633806]" style={{ fontFamily: "'Fraunces', serif" }}>
                      {formatUSD(cat.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#f0f5f2] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f59e0b] rounded-full transition-all duration-500" style={{ width: `${cat.percentage}%` }} />
                  </div>
                  <p className="text-[10px] text-[#8a9e96] mt-0.5">{cat.percentage}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}