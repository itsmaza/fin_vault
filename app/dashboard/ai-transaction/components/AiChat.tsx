// app/dashboard/ai-transaction/components/AiChat.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Sparkles, RotateCcw } from "lucide-react"
import MessageBubble from "./MessageBubble"
import { sendMoney } from "@/actions/transaction.actions"

type Message = {
  role:         "user" | "ai"
  content:      string
  intent?:      string
  contextData?: Record<string, unknown>
  needsConfirm?: boolean
  confirmData?:  { receiverEmail: string; amount: number; note?: string }
  status?:       "pending" | "confirmed" | "cancelled"
}

const SUGGESTIONS = [
  "What's my balance?",
  "Show my last 5 transactions",
  "How much did I spend this month?",
  "Show my saved contacts",
]

interface Props {
  userName: string
}

export default function AiChat({ userName }: Props) {
  const [messages, setMessages]   = useState<Message[]>([
    {
      role:    "ai",
      content: `Hi ${userName}! 👋 I'm your FinVault AI assistant. I can help you send money, check your balance, view transactions, and more. What would you like to do?`,
    },
  ])
  const [input, setInput]         = useState("")
  const [loading, setLoading]     = useState(false)
  const [sending, setSending]     = useState(false)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getHistory = () =>
    messages
      .filter((m) => !m.needsConfirm)
      .slice(-6)
      .map((m) => ({
        role:  m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }))

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res  = await fetch("/api/ai/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: text, history: getHistory() }),
      })

      const json = await res.json()

      if (!json.success) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Sorry, I'm having trouble right now. Please try again." },
        ])
        return
      }

      const { intent, reply, needsConfirm, data, contextData } = json.data

      const aiMsg: Message = {
        role:         "ai",
        content:      reply,
        intent,
        contextData,
        needsConfirm: needsConfirm && intent === "send_money",
        confirmData:  needsConfirm && intent === "send_money" ? data : undefined,
        status:       needsConfirm && intent === "send_money" ? "pending" : undefined,
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Network error. Please try again." },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleConfirm = async (data: { receiverEmail: string; amount: number; note?: string }) => {
    setSending(true)

    // Update message status
    setMessages((prev) =>
      prev.map((m) =>
        m.status === "pending" ? { ...m, status: "confirmed" as const } : m
      )
    )

    const result = await sendMoney({
      receiverEmail: data.receiverEmail,
      amount:        data.amount,
      note:          data.note,
    })

    setMessages((prev) => [
      ...prev,
      {
        role:    "ai",
        content: result.success
          ? `✅ Done! $${data.amount.toFixed(2)} sent to **${data.receiverEmail}** successfully.`
          : `❌ ${result.message}`,
      },
    ])

    setSending(false)
  }

  const handleCancel = () => {
    setMessages((prev) =>
      prev.map((m) =>
        m.status === "pending" ? { ...m, status: "cancelled" as const } : m
      )
    )
    setMessages((prev) => [
      ...prev,
      { role: "ai", content: "Payment cancelled. Is there anything else I can help you with?" },
    ])
  }

  const handleReset = () => {
    setMessages([{
      role:    "ai",
      content: `Hi ${userName}! 👋 Starting fresh. How can I help you?`,
    }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-[680px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#1d9e75] rounded-[10px] flex items-center justify-center shadow-lg shadow-[#1d9e75]/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p
              className="text-[15px] font-bold text-[#0a3d2e]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              AI Transaction
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1d9e75]" />
              <p className="text-[11px] text-[#5a7568]">Powered by Gemini</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#5a7568] bg-white border border-[#dde8e3] rounded-[8px] hover:bg-[#f6faf8] transition-colors"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4 pr-1">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg as any}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#1d9e75] flex items-center justify-center flex-shrink-0">
              <Sparkles size={13} className="text-white" />
            </div>
            <div className="bg-white border border-[#dde8e3] rounded-[14px] rounded-tl-[4px] px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1d9e75] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1d9e75] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1d9e75] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="cursor-pointer text-[11px] font-medium px-3 py-1.5 bg-white border border-[#dde8e3] text-[#5a7568] rounded-full hover:bg-[#f6faf8] hover:border-[#1d9e75] hover:text-[#1d9e75] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 bg-white border border-[#dde8e3] rounded-[14px] px-4 py-3 focus-within:border-[#1d9e75] focus-within:ring-2 focus-within:ring-[#1d9e75]/10 transition-all">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Ask me anything — send money, check balance..."
          disabled={loading || sending}
          className="flex-1 text-[13px] text-[#0a3d2e] outline-none placeholder:text-[#8a9e96] disabled:opacity-60 bg-transparent"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading || sending}
          className="cursor-pointer w-8 h-8 flex items-center justify-center bg-[#0a3d2e] hover:bg-[#0f5c44] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-[8px] transition-colors flex-shrink-0"
        >
          {loading || sending
            ? <Loader2 size={14} className="animate-spin" />
            : <Send size={14} />
          }
        </button>
      </div>
    </div>
  )
}