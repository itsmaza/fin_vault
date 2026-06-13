// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Transaction } from "@/models"
import {
  ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown,
  Send, Plus, Sparkles, CreditCard, Building2,
} from "lucide-react"
import Link from "next/link"
import mongoose from "mongoose"

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style:            "currency",
    currency:         "USD",
    minimumFractionDigits: 2,
  }).format(n)
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

type TxType = "TRANSFER" | "DEPOSIT" | "WITHDRAWAL" | "PAYMENT"

function getTxMeta(tx: any, userId: string): {
  label:    string
  isCredit: boolean
  Icon:     React.ElementType
  iconBg:   string
  iconColor: string
} {
  const type       = tx.type as TxType
  const isSender   = tx.senderId?.toString() === userId
  const isReceiver = tx.receiverId?.toString() === userId

  if (type === "DEPOSIT") {
    return { label: "Card Deposit",        isCredit: true,  Icon: ArrowDownLeft, iconBg: "bg-[#E1F5EE]", iconColor: "text-[#085041]" }
  }
  if (type === "WITHDRAWAL") {
    return { label: "Bank Withdrawal",     isCredit: false, Icon: Building2,     iconBg: "bg-[#FAEEDA]", iconColor: "text-[#633806]" }
  }
  if (type === "PAYMENT") {
    return isSender
      ? { label: "FinVault Pay (sent)",     isCredit: false, Icon: CreditCard,   iconBg: "bg-[#FAEEDA]", iconColor: "text-[#633806]" }
      : { label: "FinVault Pay (received)", isCredit: true,  Icon: CreditCard,   iconBg: "bg-[#E1F5EE]", iconColor: "text-[#085041]" }
  }
  // TRANSFER
  return isSender
    ? { label: "Money Sent",     isCredit: false, Icon: ArrowUpRight,   iconBg: "bg-[#FAEEDA]", iconColor: "text-[#633806]" }
    : { label: "Money Received", isCredit: true,  Icon: ArrowDownLeft,  iconBg: "bg-[#E1F5EE]", iconColor: "text-[#085041]" }
}

async function getDashboardData(userId: string) {
  const objectId = new mongoose.Types.ObjectId(userId)

  const [recent, incomeAgg, spentAgg] = await Promise.all([
    Transaction.find({
      $or: [{ senderId: objectId }, { receiverId: objectId }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // Income = deposits + received transfers + received payments
    Transaction.aggregate([
      {
        $match: {
          status: "COMPLETED",
          $or: [
            { type: "DEPOSIT",  senderId: objectId },
            { type: { $in: ["TRANSFER", "PAYMENT"] }, receiverId: objectId, senderId: { $ne: objectId } },
          ],
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // Spent = sent transfers + withdrawals + sent payments
    Transaction.aggregate([
      {
        $match: {
          status:     "COMPLETED",
          type:       { $in: ["TRANSFER", "WITHDRAWAL", "PAYMENT"] },
          senderId:   objectId,
          receiverId: { $ne: objectId },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ])

  return {
    recent,
    totalIncome: incomeAgg[0]?.total ?? 0,
    totalSpent:  spentAgg[0]?.total ?? 0,
  }
}

export default async function DashboardPage() {
  await connectDB()
  const user = await getCurrentUser()
  if (!user) return null

  const userId = user._id.toString()
  const { recent, totalIncome, totalSpent } = await getDashboardData(userId)

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const quickActions = [
    { label: "Send Money",     icon: Send,     href: "/dashboard/send",                color: "bg-[#0a3d2e] text-white hover:bg-[#0f5c44]" },
    { label: "Add Deposit",    icon: Plus,     href: "/dashboard/balance/deposits",    color: "bg-[#E1F5EE] text-[#085041] hover:bg-[#c8f0df]" },
    { label: "AI Transaction", icon: Sparkles, href: "/dashboard/ai-transaction",      color: "bg-[#f6faf8] text-[#0a3d2e] border border-[#dde8e3] hover:bg-[#edf5f0]" },
  ]

  return (
    <div className="max-w-[900px]">

      {/* Welcome banner */}
      <div className="bg-[#0a3d2e] rounded-[20px] p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-[50px] h-[50px] rounded-full bg-[#1d9e75] flex items-center justify-center text-[16px] font-bold text-white ring-4 ring-[#1d9e75]/20 flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-[12px] text-[#6fa890] font-medium">Good morning</p>
            <h1 className="text-[20px] font-bold text-white tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              {user.name}
            </h1>
            <p className="text-[11px] text-[#6fa890] mt-0.5">
              {user.status === "ACTIVE" ? "✦ Account Active" : user.status}
            </p>
          </div>
        </div>

        <div className="bg-white/[0.08] rounded-[14px] px-5 py-3.5 text-right">
          <p className="text-[10px] font-semibold text-[#6fa890] tracking-widest mb-1">TOTAL BALANCE</p>
          <p className="text-[28px] font-bold text-white leading-none" style={{ fontFamily: "'Fraunces', serif" }}>
            {formatUSD(user.balance)}
          </p>
          <p className="text-[11px] text-[#6fa890] mt-1">Available funds</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-[#dde8e3] rounded-[16px] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-[#8a9e96] tracking-widest">TOTAL INCOME</p>
            <div className="w-7 h-7 bg-[#E1F5EE] rounded-full flex items-center justify-center">
              <TrendingUp size={13} className="text-[#085041]" />
            </div>
          </div>
          <p className="text-[20px] font-bold text-[#0a3d2e]" style={{ fontFamily: "'Fraunces', serif" }}>
            {formatUSD(totalIncome)}
          </p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] mt-1.5 inline-block">
            All time received
          </span>
        </div>

        <div className="bg-white border border-[#dde8e3] rounded-[16px] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-[#8a9e96] tracking-widest">TOTAL SPENT</p>
            <div className="w-7 h-7 bg-[#FAEEDA] rounded-full flex items-center justify-center">
              <TrendingDown size={13} className="text-[#633806]" />
            </div>
          </div>
          <p className="text-[20px] font-bold text-[#0a3d2e]" style={{ fontFamily: "'Fraunces', serif" }}>
            {formatUSD(totalSpent)}
          </p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806] mt-1.5 inline-block">
            All time sent
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-[#8a9e96] tracking-widest uppercase mb-3">
          Quick Actions
        </p>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`cursor-pointer flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-[14px] font-semibold text-[12px] transition-colors ${action.color}`}
            >
              <action.icon size={18} />
              <span className="text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f5f2]">
          <h2 className="text-[14px] font-bold text-[#0a3d2e]" style={{ fontFamily: "'Fraunces', serif" }}>
            Recent Transactions
          </h2>
          <Link href="/dashboard/transactions" className="text-[11px] font-semibold text-[#1d9e75] hover:underline">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f6faf8] border border-[#dde8e3] flex items-center justify-center">
              <ArrowDownLeft size={18} className="text-[#8a9e96]" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-[#0a3d2e]">No transactions yet</p>
              <p className="text-[12px] text-[#8a9e96] mt-0.5">Send money or make a deposit to get started</p>
            </div>
            <Link
              href="/dashboard/send"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0a3d2e] text-white text-[12px] font-semibold rounded-[8px] hover:bg-[#0f5c44] transition-colors"
            >
              <Send size={12} />
              Send Money
            </Link>
          </div>
        ) : (
          <div>
            {recent.map((tx: any) => {
              const { label, isCredit, Icon, iconBg, iconColor } = getTxMeta(tx, userId)
              return (
                <div
                  key={tx._id.toString()}
                  className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f5f2] last:border-0 hover:bg-[#f6faf8] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                      <Icon size={14} className={iconColor} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#0a3d2e]">{label}</p>
                      <p className="text-[11px] text-[#8a9e96]">
                        {formatDateTime(tx.createdAt)}
                        {tx.note ? ` · ${tx.note}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-[13px] font-bold ${isCredit ? "text-[#085041]" : "text-[#633806]"}`}
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {isCredit ? "+" : "-"}{formatUSD(tx.amount)}
                    </p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
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
        )}
      </div>
    </div>
  )
}