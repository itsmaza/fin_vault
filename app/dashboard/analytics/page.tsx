// app/dashboard/analytics/page.tsx
import { getAnalyticsOverview } from "@/actions/analytics.actions"
import { TrendingUp, TrendingDown, ArrowDownLeft, BarChart2 } from "lucide-react"
import OverviewChart from "./components/OverviewChart"

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(n)
}

export default async function AnalyticsOverviewPage() {
  const result = await getAnalyticsOverview()
  const data   = result.data

  const stats = [
    {
      label:      "TOTAL INCOME",
      value:      formatUSD(data?.totalIncome   ?? 0),
      icon:       TrendingUp,
      iconBg:     "bg-[#E1F5EE]",
      iconColor:  "text-[#085041]",
      badge:      "Received",
      badgeColor: "bg-[#E1F5EE] text-[#085041]",
    },
    {
      label:      "TOTAL SPENT",
      value:      formatUSD(data?.totalSpent    ?? 0),
      icon:       TrendingDown,
      iconBg:     "bg-[#FAEEDA]",
      iconColor:  "text-[#633806]",
      badge:      "Sent out",
      badgeColor: "bg-[#FAEEDA] text-[#633806]",
    },
    {
      label:      "TOTAL DEPOSITS",
      value:      formatUSD(data?.totalDeposits ?? 0),
      icon:       ArrowDownLeft,
      iconBg:     "bg-[#E1F5EE]",
      iconColor:  "text-[#085041]",
      badge:      "Added",
      badgeColor: "bg-[#E1F5EE] text-[#085041]",
    },
    {
      label:      "NET FLOW",
      value:      formatUSD(data?.netBalance    ?? 0),
      icon:       BarChart2,
      iconBg:     "bg-[#f6faf8]",
      iconColor:  "text-[#0a3d2e]",
      badge:      "All time",
      badgeColor: "bg-[#f6faf8] text-[#5a7568] border border-[#dde8e3]",
    },
  ]

  return (
    <div className="max-w-[900px]">
      <div className="mb-6">
        <h1
          className="text-[22px] font-bold text-[#0a3d2e] tracking-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Analytics Overview
        </h1>
        <p className="text-[13px] text-[#5a7568] mt-0.5">Your financial summary at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-[#dde8e3] rounded-[14px] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-[#8a9e96] tracking-widest">{s.label}</p>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${s.iconBg}`}>
                <s.icon size={13} className={s.iconColor} />
              </div>
            </div>
            <p
              className="text-[20px] font-bold text-[#0a3d2e] mb-1.5"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {s.value}
            </p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badgeColor}`}>
              {s.badge}
            </span>
          </div>
        ))}
      </div>

      <OverviewChart
        monthlyIncome={data?.monthlyIncome ?? []}
        monthlySpent={data?.monthlySpent  ?? []}
      />
    </div>
  )
}