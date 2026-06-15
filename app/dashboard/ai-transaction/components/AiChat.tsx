// app/dashboard/ai-transaction/components/AiChat.tsx
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Loader2, Sparkles, RotateCcw, AlertCircle, RefreshCw } from "lucide-react"
import MessageBubble from "./MessageBubble"
import { sendMoney } from "@/actions/transaction.actions"

type Message = {
  id:           string
  role:         "user" | "ai"
  content:      string
  intent?:      string
  contextData?: Record<string, unknown>
  needsConfirm?: boolean
  confirmData?:  { receiverEmail: string; amount: number; note?: string }
  status?:       "pending" | "confirmed" | "cancelled"
  isError?:      boolean
}

const SUGGESTIONS = [
  "What's my balance?",
  "Show my last 5 transactions",
  "How much did I spend this month?",
  "Show my saved contacts",
]

const MAX_INPUT_LENGTH = 500

let idCounter = 0
const nextId = () => `msg-${Date.now()}-${idCounter++}`

interface Props {
  userName: string
}

export default function AiChat({ userName }: Props) {
  const greeting = (name: string): Message => ({
    id:      nextId(),
    role:    "ai",
    content: `Hi ${name}! 👋 I'm your FinVault AI assistant. I can help you send money, check your balance, view transactions, and more. What would you like to do?`,
  })

  const [messages, setMessages]   = useState<Message[]>([greeting(userName)])
  const [input, setInput]         = useState("")
  const [loading, setLoading]     = useState(false)
  const [sending, setSending]     = useState(false)
  const [lastFailedText, setLastFailedText] = useState<string | null>(null)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLTextAreaElement>(null)
  const liveRegionRef             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }, [input])

  const getHistory = () =>
    messages
      .filter((m) => !m.needsConfirm && !m.isError)
      .slice(-6)
      .map((m) => ({
        role:    m.role === "user" ? "user" : "assistant",
        content: m.content,
      }))

  const announce = (text: string) => {
    if (liveRegionRef.current) liveRegionRef.current.textContent = text
  }

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: nextId(), role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)
    setLastFailedText(null)

    try {
      const res  = await fetch("/api/ai/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: trimmed, history: getHistory() }),
      })

      const json = await res.json()

      if (!json.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "ai",
            content: "Something went wrong on my end. Please try again.",
            isError: true,
          },
        ])
        setLastFailedText(trimmed)
        announce("Error: assistant could not respond")
        return
      }

      const { intent, reply, needsConfirm, data, contextData } = json.data

      const aiMsg: Message = {
        id:           nextId(),
        role:         "ai",
        content:      reply,
        intent,
        contextData,
        needsConfirm: needsConfirm && intent === "send_money",
        confirmData:  needsConfirm && intent === "send_money" ? data : undefined,
        status:       needsConfirm && intent === "send_money" ? "pending" : undefined,
      }

      setMessages((prev) => [...prev, aiMsg])
      announce("Assistant replied")
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "ai",
          content: "Network error — check your connection and try again.",
          isError: true,
        },
      ])
      setLastFailedText(trimmed)
      announce("Network error")
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [loading, messages])

  const handleRetry = () => {
    if (lastFailedText) {
      // remove the trailing error bubble before retrying
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.isError)
        return idx === -1 ? prev : prev.filter((m) => !m.isError)
      })
      sendMessage(lastFailedText)
    }
  }

  const handleConfirm = async (msgId: string, data: { receiverEmail: string; amount: number; note?: string }) => {
    setSending(true)

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.status === "pending" ? { ...m, status: "confirmed" as const } : m
      )
    )

    try {
      const result = await sendMoney({
        receiverEmail: data.receiverEmail,
        amount:        data.amount,
        note:          data.note,
      })

      setMessages((prev) => [
        ...prev,
        {
          id:      nextId(),
          role:    "ai",
          content: result.success
            ? `✅ Done! $${data.amount.toFixed(2)} sent to **${data.receiverEmail}** successfully.`
            : `❌ ${result.message}`,
          isError: !result.success,
        },
      ])
      announce(result.success ? "Payment sent successfully" : `Payment failed: ${result.message}`)
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "ai",
          content: "❌ Couldn't complete the transfer due to a network error. Please try again.",
          isError: true,
        },
      ])
      announce("Payment failed: network error")
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleCancel = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.status === "pending" ? { ...m, status: "cancelled" as const } : m
      )
    )
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "ai", content: "Payment cancelled. Is there anything else I can help you with?" },
    ])
    announce("Payment cancelled")
  }

  const handleReset = () => {
    setMessages([{
      id:      nextId(),
      role:    "ai",
      content: `Hi ${userName}! 👋 Starting fresh. How can I help you?`,
    }])
    setLastFailedText(null)
    announce("Conversation reset")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const showSuggestions = messages.length === 1 && !loading

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-[680px]">

      {/* Screen-reader live region */}
      <div ref={liveRegionRef} aria-live="polite" className="sr-only" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#1d9e75] rounded-[10px] flex items-center justify-center shadow-lg shadow-[#1d9e75]/20">
            <Sparkles size={16} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <p
              className="text-[15px] font-bold text-[#0a3d2e]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              AI Transaction
            </p>
            <div className="flex items-center gap-1.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#1d9e75] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1d9e75]" />
              </span>
              <p className="text-[11px] text-[#5a7568]">Powered by Groq</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#5a7568] bg-white border border-[#dde8e3] rounded-[8px] hover:bg-[#f6faf8] hover:text-[#0a3d2e] hover:border-[#1d9e75]/40 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9e75]/40 focus-visible:ring-offset-1"
          aria-label="Reset conversation"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4 pr-1 scroll-smooth"
        role="log"
        aria-label="Conversation with AI assistant"
      >
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className="animate-[fadeSlideIn_0.35s_ease-out]"
            style={{ animationDelay: i === messages.length - 1 ? "0ms" : "0ms" }}
          >
            <MessageBubble
              message={msg as any}
              onConfirm={(data) => handleConfirm(msg.id, data)}
              onCancel={() => handleCancel(msg.id)}
            />
          </div>
        ))}

        {/* Retry banner */}
        {lastFailedText && !loading && (
          <div className="flex items-center gap-2 ml-10 -mt-2 animate-[fadeSlideIn_0.3s_ease-out]">
            <button
              onClick={handleRetry}
              className="cursor-pointer flex items-center gap-1.5 text-[11px] font-semibold text-[#0a3d2e] bg-white border border-[#dde8e3] rounded-full px-3 py-1.5 hover:bg-[#f6faf8] hover:border-[#1d9e75]/40 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9e75]/40"
            >
              <RefreshCw size={11} />
              Try again
            </button>
          </div>
        )}

        {/* Loading bubble */}
        {loading && (
          <div className="flex gap-3 animate-[fadeSlideIn_0.3s_ease-out]" aria-hidden="true">
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

      {/* Suggestions (empty-state) */}
      {showSuggestions && (
        <div className="flex flex-wrap gap-2 mb-3 animate-[fadeSlideIn_0.4s_ease-out]">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-[fadeSlideIn_0.4s_ease-out] cursor-pointer text-[11px] font-medium px-3 py-1.5 bg-white border border-[#dde8e3] text-[#5a7568] rounded-full hover:bg-[#f6faf8] hover:border-[#1d9e75] hover:text-[#1d9e75] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9e75]/40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 bg-white border border-[#dde8e3] rounded-[14px] px-4 py-3 focus-within:border-[#1d9e75] focus-within:ring-2 focus-within:ring-[#1d9e75]/10 transition-all">
        <label htmlFor="ai-chat-input" className="sr-only">
          Message the AI assistant
        </label>
        <textarea
          id="ai-chat-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything — send money, check balance..."
          disabled={loading || sending}
          rows={1}
          maxLength={MAX_INPUT_LENGTH}
          className="flex-1 resize-none text-[13px] text-[#0a3d2e] outline-none placeholder:text-[#8a9e96] disabled:opacity-60 bg-transparent leading-relaxed py-1 max-h-[120px]"
        />
        {input.length > MAX_INPUT_LENGTH - 50 && (
          <span className="text-[10px] text-[#8a9e96] self-center tabular-nums">
            {MAX_INPUT_LENGTH - input.length}
          </span>
        )}
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading || sending}
          aria-label="Send message"
          className="cursor-pointer w-8 h-8 flex items-center justify-center bg-[#0a3d2e] hover:bg-[#0f5c44] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-[8px] transition-all active:scale-90 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9e75]/50 focus-visible:ring-offset-1"
        >
          {loading || sending
            ? <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            : <Send size={14} aria-hidden="true" />
          }
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[fadeSlideIn_0\\.35s_ease-out\\],
          .animate-\\[fadeSlideIn_0\\.3s_ease-out\\],
          .animate-\\[fadeSlideIn_0\\.4s_ease-out\\],
          .animate-bounce,
          .animate-ping {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}