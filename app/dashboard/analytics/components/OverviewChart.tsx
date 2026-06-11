// app/dashboard/analytics/components/OverviewChart.tsx
"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

type MonthlyData = { month: string; amount: number }

interface Props {
  monthlyIncome: MonthlyData[]
  monthlySpent: MonthlyData[]
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

export default function OverviewChart({ monthlyIncome, monthlySpent }: Props) {
  // Merge months
  const allMonths = Array.from(
    new Set([...monthlyIncome.map((m) => m.month), ...monthlySpent.map((m) => m.month)])
  )

  const data = allMonths.map((month) => ({
    month,
    income: monthlyIncome.find((m) => m.month === month)?.amount ?? 0,
    spent:  monthlySpent.find((m) => m.month === month)?.amount ?? 0,
  }))

  if (data.length === 0) {
    return (
      <div className="bg-white border border-[#dde8e3] rounded-[16px] p-8 text-center">
        <p className="text-[13px] text-[#8a9e96]">No transaction data yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5">
      <h2 className="text-[14px] font-bold text-[#0a3d2e] mb-5" style={{ fontFamily: "'Fraunces', serif" }}>
        Income vs Spending (Last 6 months)
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1d9e75" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1d9e75" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f5f2" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8a9e96" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#8a9e96" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value: any, name: any) => [
              formatUSD(Number(value ?? 0)),
              name === "income" ? "Income" : "Spent",
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #dde8e3", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
          />
          <Legend formatter={(v) => v === "income" ? "Income" : "Spending"} wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="income" stroke="#1d9e75" strokeWidth={2} fill="url(#incomeGrad)" dot={{ r: 3, fill: "#1d9e75" }} />
          <Area type="monotone" dataKey="spent"  stroke="#f59e0b" strokeWidth={2} fill="url(#spentGrad)"  dot={{ r: 3, fill: "#f59e0b" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}