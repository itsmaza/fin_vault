export const dynamic = "force-dynamic";
// app/dashboard/balance/page.tsx  (Overview)
import { getBalanceOverview } from "@/actions/balance.actions"
import { requireAuth } from "@/lib/auth"
import { ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"

function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

export default async function BalanceOverviewPage() {
  const [result, user] = await Promise.all([
    getBalanceOverview(),
    requireAuth(),
  ])
  const data = result.data

  return (
    <div className="p-6 max-w-[900px]">

      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-[22px] font-bold text-[#0a3d2e] tracking-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Balance Overview
        </h1>
        <p className="text-[13px] text-[#5a7568] mt-0.5">
          Your financial summary
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Balance */}
        <div className="bg-[#0a3d2e] rounded-[16px] p-5 col-span-1 sm:col-span-1">
          <p className="text-[11px] font-semibold text-[#6fa890] tracking-widest mb-2">
            TOTAL BALANCE
          </p>
          <p
            className="text-[28px] font-bold text-white"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {formatUSD(data?.balance ?? 0)}
          </p>
          <p className="text-[11px] text-[#6fa890] mt-1">Available funds</p>
        </div>

        {/* Income */}
        <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-[#8a9e96] tracking-widest">
              TOTAL INCOME
            </p>
            <div className="w-7 h-7 bg-[#E1F5EE] rounded-full flex items-center justify-center">
              <TrendingUp size={13} className="text-[#085041]" />
            </div>
          </div>
          <p
            className="text-[22px] font-bold text-[#0a3d2e]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {formatUSD(data?.totalIncome ?? 0)}
          </p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] mt-1 inline-block">
            All time
          </span>
        </div>

        {/* Spent */}
        <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-[#8a9e96] tracking-widest">
              TOTAL SPENT
            </p>
            <div className="w-7 h-7 bg-[#FAEEDA] rounded-full flex items-center justify-center">
              <TrendingDown size={13} className="text-[#633806]" />
            </div>
          </div>
          <p
            className="text-[22px] font-bold text-[#0a3d2e]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {formatUSD(data?.totalSpent ?? 0)}
          </p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806] mt-1 inline-block">
            All time
          </span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5">
        <h2
          className="text-[14px] font-bold text-[#0a3d2e] mb-4"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Recent Transactions
        </h2>

        {!data?.recentTransactions?.length ? (
          <p className="text-[13px] text-[#8a9e96] text-center py-8">
            No transactions yet
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentTransactions.map((tx) => {
              // FIX: type এর পাশাপাশি কে sender সেটাও check করতে হবে
              const isCredit =
                tx.type === "DEPOSIT" ||
                String(tx.receiverId) === String(user._id)

              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between py-2.5 border-b border-[#f0f5f2] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCredit ? "bg-[#E1F5EE]" : "bg-[#FAEEDA]"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft size={14} className="text-[#085041]" />
                      ) : (
                        <ArrowUpRight size={14} className="text-[#633806]" />
                      )}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#0a3d2e]">
                        {tx.type === "DEPOSIT" ? "Deposit" : isCredit ? "Received" : "Sent"}
                      </p>
                      <p className="text-[11px] text-[#8a9e96]">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-[13px] font-bold ${
                        isCredit ? "text-[#085041]" : "text-[#633806]"
                      }`}
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {isCredit ? "+" : "-"}{formatUSD(tx.amount)}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
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
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}