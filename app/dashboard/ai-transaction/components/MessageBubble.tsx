// app/dashboard/ai-transaction/components/MessageBubble.tsx
"use client"

import { ArrowUpRight, ArrowDownLeft, Bot, User, AlertTriangle, CheckCircle2, XCircle, Inbox } from "lucide-react"

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
  id?:     string
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
  isError?:      boolean
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

// Lightweight markdown -> React nodes (bold, line breaks, bullet lists)
// Avoids pulling in a full markdown renderer for a constrained, trusted-format
// model output while still rendering safely (no dangerouslySetInnerHTML).
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>
  })
}

function renderContent(text: string) {
  const lines = text.split("\n")
  const blocks: React.ReactNode[] = []
  let listBuffer: string[] = []

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return
    blocks.push(
      <ul key={`ul-${key}`} className="list-disc pl-4 my-1 space-y-0.5">
        {listBuffer.map((item, i) => (
          <li key={`li-${key}-${i}`}>{renderInline(item, `li-${key}-${i}`)}</li>
        ))}
      </ul>
    )
    listBuffer = []
  }

  lines.forEach((line, idx) => {
    const bulletMatch = line.match(/^\s*[-*•]\s+(.*)/)
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1])
      return
    }
    flushList(String(idx))
    if (line.trim() === "") {
      blocks.push(<br key={`br-${idx}`} />)
    } else {
      blocks.push(
        <p key={`p-${idx}`} className="leading-relaxed">
          {renderInline(line, `p-${idx}`)}
        </p>
      )
    }
  })
  flushList("end")

  return blocks
}

interface Props {
  message:   Message
  onConfirm: (data: { receiverEmail: string; amount: number; note?: string }) => void
  onCancel:  () => void
}

export default function MessageBubble({ message, onConfirm, onCancel }: Props) {
  const isUser = message.role === "user"
  const isError = !!message.isError

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? "bg-[#0a3d2e]" : isError ? "bg-[#c5563f]" : "bg-[#1d9e75]"
      }`}>
        {isUser
          ? <User size={13} className="text-white" aria-hidden="true" />
          : isError
            ? <AlertTriangle size={13} className="text-white" aria-hidden="true" />
            : <Bot size={13} className="text-white" aria-hidden="true" />
        }
      </div>

      <div className={`flex flex-col gap-2 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>

        {/* Main bubble */}
        <div className={`px-4 py-3 rounded-[14px] text-[13px] ${
          isUser
            ? "bg-[#0a3d2e] text-white rounded-tr-[4px]"
            : isError
              ? "bg-[#FBEDE9] border border-[#f0c9bd] text-[#8a3923] rounded-tl-[4px]"
              : "bg-white border border-[#dde8e3] text-[#0a3d2e] rounded-tl-[4px]"
        }`}>
          {renderContent(message.content)}
        </div>

        {/* Transaction list */}
        {message.intent === "get_transactions" && (
          message.contextData?.transactions?.length ? (
            <div className="bg-white border border-[#dde8e3] rounded-[12px] overflow-hidden w-full">
              {message.contextData.transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between px-3 py-2.5 border-b border-[#f0f5f2] last:border-0 hover:bg-[#f6faf8] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.isCredit ? "bg-[#E1F5EE]" : "bg-[#FAEEDA]"
                    }`}>
                      {tx.isCredit
                        ? <ArrowDownLeft size={11} className="text-[#085041]" aria-hidden="true" />
                        : <ArrowUpRight  size={11} className="text-[#633806]" aria-hidden="true" />
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
          ) : (
            <div className="bg-white border border-[#dde8e3] rounded-[12px] w-full px-4 py-6 flex flex-col items-center gap-2 text-center">
              <Inbox size={20} className="text-[#a8bdb4]" aria-hidden="true" />
              <p className="text-[12px] text-[#5a7568]">No transactions yet. Once you send or receive money, they'll show up here.</p>
            </div>
          )
        )}

        {/* Beneficiary list */}
        {message.intent === "get_beneficiaries" && (
          message.contextData?.beneficiaries?.length ? (
            <div className="bg-white border border-[#dde8e3] rounded-[12px] overflow-hidden w-full">
              {message.contextData.beneficiaries.map((b) => (
                <div key={b._id} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#f0f5f2] last:border-0 hover:bg-[#f6faf8] transition-colors">
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
          ) : (
            <div className="bg-white border border-[#dde8e3] rounded-[12px] w-full px-4 py-6 flex flex-col items-center gap-2 text-center">
              <Inbox size={20} className="text-[#a8bdb4]" aria-hidden="true" />
              <p className="text-[12px] text-[#5a7568]">No saved contacts yet. Add a beneficiary to send money faster next time.</p>
            </div>
          )
        )}

        {/* Confirm buttons */}
        {message.needsConfirm && message.status === "pending" && message.confirmData && (
          <div className="flex flex-col gap-2 w-full bg-[#f6faf8] border border-[#dde8e3] rounded-[12px] p-3">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#5a7568]">To</span>
              <span className="font-semibold text-[#0a3d2e]">{message.confirmData.receiverEmail}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#5a7568]">Amount</span>
              <span className="font-bold text-[#0a3d2e]" style={{ fontFamily: "'Fraunces', serif" }}>
                {formatUSD(message.confirmData.amount)}
              </span>
            </div>
            {message.confirmData.note && (
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#5a7568]">Note</span>
                <span className="text-[#0a3d2e]">{message.confirmData.note}</span>
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => onConfirm(message.confirmData!)}
                className="cursor-pointer flex-1 py-2 bg-[#0a3d2e] hover:bg-[#0f5c44] text-white text-[12px] font-semibold rounded-[8px] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9e75]/50 focus-visible:ring-offset-1"
              >
                Confirm transfer
              </button>
              <button
                onClick={onCancel}
                className="cursor-pointer flex-1 py-2 bg-white border border-[#dde8e3] text-[#5a7568] text-[12px] font-semibold rounded-[8px] hover:bg-[#f0f5f2] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9e75]/30 focus-visible:ring-offset-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Status badges */}
        {message.status === "confirmed" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-[#E1F5EE] text-[#085041]">
            <CheckCircle2 size={11} aria-hidden="true" />
            Payment confirmed
          </span>
        )}
        {message.status === "cancelled" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-[#f0f0f0] text-[#5a7568]">
            <XCircle size={11} aria-hidden="true" />
            Cancelled
          </span>
        )}
      </div>
    </div>
  )
}