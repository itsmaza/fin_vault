// app/dashboard/analytics/components/IncomeChart.tsx
"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type MonthlyData = { month: string; amount: number }

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

export default function IncomeChart({ data }: { data: MonthlyData[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-[#dde8e3] rounded-[16px] p-8 text-center h-full flex items-center justify-center">
        <p className="text-[13px] text-[#8a9e96]">No income data yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5 h-full">
      <h2 className="text-[13px] font-bold text-[#0a3d2e] mb-5" style={{ fontFamily: "'Fraunces', serif" }}>
        Monthly Income (Last 12 months)
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1d9e75" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1d9e75" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f5f2" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8a9e96" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#8a9e96" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value: any) => [formatUSD(Number(value ?? 0)), "Income"]}
            contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #dde8e3" }}
          />
          <Area type="monotone" dataKey="amount" stroke="#1d9e75" strokeWidth={2} fill="url(#incomeAreaGrad)" dot={{ r: 3, fill: "#1d9e75" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}