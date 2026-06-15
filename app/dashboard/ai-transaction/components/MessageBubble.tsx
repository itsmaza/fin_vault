// app/dashboard/ai-transaction/components/MessageBubble.tsx
"use client"

import { ArrowUpRight, ArrowDownLeft, Bot, User } from "lucide-react"

type Transaction = {
  _id:       string
  amount:    number
  type:      string
  status:    string
  note?:     string
  createdAt: string
  isCredit:  boolean
}

type Beneficiary = {
  _id:   string
  name:  string
  email: string
}

type Message = {
  role:    "user" | "ai"
  content: string
  intent?: string
  contextData?: {
    balance?:       number
    transactions?:  Transaction[]
    beneficiaries?: Beneficiary[]
    monthlySpent?:  number
  }
  needsConfirm?: boolean
  confirmData?:  { receiverEmail: string; amount: number; note?: string }
  status?:       "pending" | "confirmed" | "cancelled"
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  })
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>")
}

interface Props {
  message:   Message
  onConfirm: (data: { receiverEmail: string; amount: number; note?: string }) => void
  onCancel:  () => void
}

export default function MessageBubble({ message, onConfirm, onCancel }: Props) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? "bg-[#0a3d2e]" : "bg-[#1d9e75]"
      }`}>
        {isUser
          ? <User size={13} className="text-white" />
          : <Bot  size={13} className="text-white" />
        }
      </div>

      <div className={`flex flex-col gap-2 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>

        {/* Main bubble */}
        <div className={`px-4 py-3 rounded-[14px] text-[13px] leading-relaxed ${
          isUser
            ? "bg-[#0a3d2e] text-white rounded-tr-[4px]"
            : "bg-white border border-[#dde8e3] text-[#0a3d2e] rounded-tl-[4px]"
        }`}>
          <p
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        </div>

        {/* Transaction list */}
        {message.contextData?.transactions?.length ? (
          <div className="bg-white border border-[#dde8e3] rounded-[12px] overflow-hidden w-full">
            {message.contextData.transactions.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between px-3 py-2.5 border-b border-[#f0f5f2] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.isCredit ? "bg-[#E1F5EE]" : "bg-[#FAEEDA]"
                  }`}>
                    {tx.isCredit
                      ? <ArrowDownLeft size={11} className="text-[#085041]" />
                      : <ArrowUpRight  size={11} className="text-[#633806]" />
                    }
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#0a3d2e]">
                      {tx.type === "DEPOSIT" ? "Deposit" : tx.isCredit ? "Received" : "Sent"}
                    </p>
                    <p className="text-[10px] text-[#8a9e96]">{formatDateTime(tx.createdAt)}</p>
                  </div>
                </div>
                <p
                  className={`text-[12px] font-bold ${tx.isCredit ? "text-[#085041]" : "text-[#633806]"}`}
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {tx.isCredit ? "+" : "-"}{formatUSD(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Beneficiary list */}
        {message.contextData?.beneficiaries?.length ? (
          <div className="bg-white border border-[#dde8e3] rounded-[12px] overflow-hidden w-full">
            {message.contextData.beneficiaries.map((b) => (
              <div key={b._id} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#f0f5f2] last:border-0">
                <div className="w-7 h-7 rounded-full bg-[#1d9e75] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {b.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#0a3d2e]">{b.name}</p>
                  <p className="text-[11px] text-[#8a9e96]">{b.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Confirm buttons */}
        {message.needsConfirm && message.status === "pending" && message.confirmData && (
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onConfirm(message.confirmData!)}
              className="cursor-pointer flex-1 py-2 bg-[#0a3d2e] hover:bg-[#0f5c44] text-white text-[12px] font-semibold rounded-[8px] transition-colors"
            >
              ✓ Confirm
            </button>
            <button
              onClick={onCancel}
              className="cursor-pointer flex-1 py-2 bg-white border border-[#dde8e3] text-[#5a7568] text-[12px] font-semibold rounded-[8px] hover:bg-[#f6faf8] transition-colors"
            >
              ✕ Cancel
            </button>
          </div>
        )}

        {/* Status badges */}
        {message.status === "confirmed" && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041]">
            ✓ Payment confirmed
          </span>
        )}
        {message.status === "cancelled" && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806]">
            ✕ Cancelled
          </span>
        )}
      </div>
    </div>
  )
}