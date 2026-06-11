// app/dashboard/analytics/components/SpendingChart.tsx
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type MonthlyData = { month: string; amount: number }

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

export default function SpendingChart({ data }: { data: MonthlyData[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-[#dde8e3] rounded-[16px] p-8 text-center h-full flex items-center justify-center">
        <p className="text-[13px] text-[#8a9e96]">No spending data yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5 h-full">
      <h2 className="text-[13px] font-bold text-[#0a3d2e] mb-5" style={{ fontFamily: "'Fraunces', serif" }}>
        Monthly Spending (Last 12 months)
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f5f2" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8a9e96" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#8a9e96" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value) => [formatUSD(Array.isArray(value) ? Number(value[0]) : Number(value ?? 0)), "Spent"]}
            contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #dde8e3" }}
          />
          <Bar dataKey="amount" fill="#f59e0b" radius={[5, 5, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}