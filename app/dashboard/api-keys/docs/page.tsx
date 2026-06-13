"use client"

import { useState } from "react"
import {
  Key, Copy, Check, ChevronDown, ChevronUp,
  ShieldCheck, Zap, Link2, Webhook, AlertTriangle,
  Code2, Terminal, Globe, Lock
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────
type Section = "overview" | "creating" | "authentication" | "endpoints" | "webhooks" | "errors"

// ─── Code Block ───────────────────────────────────────────
function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-[10px] overflow-hidden border border-[#1e3a30] bg-[#0a1f18]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e3a30]">
        <div className="flex items-center gap-2">
          <Terminal size={11} className="text-[#1d9e75]" />
          <span className="text-[10px] font-semibold text-[#3d7a62] uppercase tracking-widest">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-[5px] text-[10px] font-semibold text-[#3d7a62] hover:text-[#1d9e75] hover:bg-[#1e3a30] transition-all"
        >
          {copied ? <><Check size={10} className="text-[#1d9e75]" />Copied!</> : <><Copy size={10} />Copy</>}
        </button>
      </div>
      <pre className="px-4 py-4 overflow-x-auto text-[12px] leading-relaxed text-[#a8d5b5] font-mono whitespace-pre">
        {code}
      </pre>
    </div>
  )
}

// ─── Accordion ────────────────────────────────────────────
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#dde8e3] rounded-[10px] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer w-full flex items-center justify-between px-4 py-3 bg-[#f6faf8] hover:bg-[#edf5f0] transition-colors text-left"
      >
        <span className="text-[12px] font-semibold text-[#0a3d2e]">{title}</span>
        {open
          ? <ChevronUp size={14} className="text-[#5a7568] flex-shrink-0" />
          : <ChevronDown size={14} className="text-[#5a7568] flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-[#dde8e3] bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: "green" | "blue" | "orange" | "red" }) {
  const styles = {
    green:  "bg-[#E1F5EE] text-[#085041] border-[#b2dece]",
    blue:   "bg-[#e8f0ff] text-[#1a3a8f] border-[#b2c4f0]",
    orange: "bg-[#FFF3E0] text-[#7a3e00] border-[#f5c88a]",
    red:    "bg-red-50 text-red-700 border-red-200",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wide border ${styles[color]}`}>
      {label}
    </span>
  )
}

// ─── Nav Item ─────────────────────────────────────────────
function NavItem({
  id, label, active, onClick
}: {
  id: Section; label: string; active: boolean; onClick: (id: Section) => void
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`cursor-pointer w-full text-left px-3 py-2 rounded-[8px] text-[12px] font-medium transition-colors ${
        active
          ? "bg-[#E1F5EE] text-[#085041] font-semibold"
          : "text-[#5a7568] hover:bg-[#f6faf8] hover:text-[#0a3d2e]"
      }`}
    >
      {label}
    </button>
  )
}

// ─── Endpoint Row ─────────────────────────────────────────
function EndpointRow({
  method, path, description
}: {
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
  description: string
}) {
  const colors = {
    GET:    "bg-[#e8f0ff] text-[#1a3a8f]",
    POST:   "bg-[#E1F5EE] text-[#085041]",
    PUT:    "bg-[#FFF3E0] text-[#7a3e00]",
    DELETE: "bg-red-50 text-red-700",
  }
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#f0f5f2] last:border-0">
      <span className={`flex-shrink-0 px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wide ${colors[method]}`}>
        {method}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-mono font-semibold text-[#0a3d2e]">{path}</p>
        <p className="text-[11px] text-[#5a7568] mt-0.5">{description}</p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState<Section>("overview")

  const nav: { id: Section; label: string }[] = [
    { id: "overview",       label: "Overview" },
    { id: "creating",       label: "Creating API Keys" },
    { id: "authentication", label: "Authentication" },
    { id: "endpoints",      label: "API Endpoints" },
    { id: "webhooks",       label: "Webhooks" },
    { id: "errors",         label: "Error Handling" },
  ]

  const BASE = "https://api.finvaultpay.com/api/v1"

  return (
    <div className="max-w-[900px]">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-[#E1F5EE] rounded-[8px] flex items-center justify-center">
            <Code2 size={14} className="text-[#085041]" />
          </div>
          <span className="text-[11px] font-semibold text-[#1d9e75] tracking-widest uppercase">
            Developer Docs
          </span>
        </div>
        <h1
          className="text-[24px] font-bold text-[#0a3d2e] tracking-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          FinVault Pay — API Reference
        </h1>
        <p className="text-[13px] text-[#5a7568] mt-1">
          Everything you need to integrate FinVault Pay into your application.
        </p>
      </div>

      <div className="flex gap-6">

        {/* Sidebar Nav */}
        <div className="w-[180px] flex-shrink-0">
          <div className="sticky top-4 flex flex-col gap-0.5">
            <p className="text-[10px] font-bold text-[#8a9e96] tracking-widest uppercase px-3 mb-1">
              Contents
            </p>
            {nav.map((n) => (
              <NavItem
                key={n.id}
                id={n.id}
                label={n.label}
                active={activeSection === n.id}
                onClick={setActiveSection}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* ── Overview ── */}
          {activeSection === "overview" && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#0a3d2e] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Overview
                </h2>
                <p className="text-[13px] text-[#5a7568] leading-relaxed">
                  FinVault Pay lets you accept payments via a simple API key system.
                  Each key carries its own redirect URL (where customers land after payment)
                  and an optional webhook URL for real-time event delivery.
                </p>
              </div>

              {/* Quick cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Key size={14} />,        title: "API Keys",     desc: "Up to 5 keys per account. Each key is scoped to one redirect URL." },
                  { icon: <Lock size={14} />,        title: "Auth",         desc: "Pass your key in the Authorization header as a Bearer token." },
                  { icon: <Globe size={14} />,       title: "Base URL",     desc: "https://fin-vault-6grp.vercel.app/api/v1 — both endpoints use this prefix." },
                  { icon: <Zap size={14} />,         title: "Webhooks",     desc: "Optional. We POST JSON events to your webhook URL on key actions." },
                ].map((c) => (
                  <div key={c.title} className="bg-white border border-[#dde8e3] rounded-[12px] px-4 py-3.5 flex gap-3">
                    <div className="w-7 h-7 bg-[#f6faf8] rounded-[7px] flex items-center justify-center text-[#1d9e75] flex-shrink-0 mt-0.5">
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#0a3d2e]">{c.title}</p>
                      <p className="text-[11px] text-[#5a7568] mt-0.5 leading-relaxed">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security notice */}
              <div className="flex items-start gap-2.5 bg-[#FAEEDA]/50 border border-[#f5d9a8] rounded-[10px] px-4 py-3">
                <ShieldCheck size={13} className="text-[#633806] mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-[#633806] leading-relaxed">
                  <strong>Keep keys secret.</strong> Never expose them in frontend code or public repositories.
                  Rotate a key immediately if you suspect it has been leaked.
                </p>
              </div>
            </div>
          )}

          {/* ── Creating API Keys ── */}
          {activeSection === "creating" && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#0a3d2e] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Creating API Keys
                </h2>
                <p className="text-[13px] text-[#5a7568] leading-relaxed">
                  Go to <strong className="text-[#0a3d2e]">Dashboard → API Keys</strong> and click <strong className="text-[#0a3d2e]">New API Key</strong>.
                  Fill in the three fields below, then click <strong className="text-[#0a3d2e]">Generate Key</strong>.
                </p>
              </div>

              {/* Fields */}
              <div className="bg-white border border-[#dde8e3] rounded-[14px] overflow-hidden">
                {[
                  {
                    field: "Key Name",
                    required: true,
                    rule: "2–40 chars. Letters, numbers, spaces, - and _ only.",
                    eg: "My Shop, Production, Staging",
                  },
                  {
                    field: "Redirect URL",
                    required: true,
                    rule: "A valid HTTPS URL. Customer lands here after a completed payment.",
                    eg: "https://myshop.com/payment/success",
                  },
                  {
                    field: "Webhook URL",
                    required: false,
                    rule: "A valid HTTPS URL. FinVault POSTs payment events here.",
                    eg: "https://myshop.com/api/webhooks/finvault",
                  },
                ].map((row) => (
                  <div key={row.field} className="px-5 py-4 border-b border-[#f0f5f2] last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[12px] font-semibold text-[#0a3d2e]">{row.field}</p>
                      <Badge label={row.required ? "Required" : "Optional"} color={row.required ? "green" : "orange"} />
                    </div>
                    <p className="text-[11px] text-[#5a7568] mb-1">{row.rule}</p>
                    <p className="text-[11px] text-[#8a9e96]">
                      <span className="font-medium text-[#5a7568]">e.g.</span> {row.eg}
                    </p>
                  </div>
                ))}
              </div>

              {/* One-time reveal */}
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-[10px] px-4 py-3">
                <AlertTriangle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-red-700 leading-relaxed">
                  <strong>Copy your key immediately</strong> after creation — it is shown only once.
                  If you lose it, delete the key and create a new one.
                </p>
              </div>

              {/* Limits */}
              <div className="bg-white border border-[#dde8e3] rounded-[12px] px-4 py-3.5">
                <p className="text-[11px] font-semibold text-[#0a3d2e] mb-2">Limits</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    ["Max keys per account", "5"],
                    ["Key name uniqueness",  "Case-insensitive — 'My Shop' and 'my shop' conflict"],
                    ["Key format",           "fv_live_<48 hex chars>"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-start gap-2">
                      <p className="text-[11px] text-[#8a9e96] w-[160px] flex-shrink-0">{label}</p>
                      <p className="text-[11px] text-[#0a3d2e] font-medium">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Authentication ── */}
          {activeSection === "authentication" && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#0a3d2e] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Authentication
                </h2>
                <p className="text-[13px] text-[#5a7568] leading-relaxed">
                  Pass your API key as a Bearer token in every request's <code className="px-1 py-0.5 bg-[#f6faf8] rounded text-[11px] text-[#0a3d2e] font-mono">Authorization</code> header.
                </p>
              </div>

              <CodeBlock
                language="http"
                code={`Authorization: Bearer fv_live_a1b2c3d4e5f6...`}
              />

              <CodeBlock
                language="javascript"
                code={`// Node.js / fetch example
const response = await fetch("https://api.finvaultpay.com/api/v1/payment/create", {
  method: "POST",
  headers: {
    "Authorization": "Bearer fv_live_a1b2c3d4e5f6...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ amount: 5000, currency: "USD" }),
});

const data = await response.json();`}
              />

              <CodeBlock
                language="python"
                code={`# Python / requests example
import requests

headers = {
    "Authorization": "Bearer fv_live_a1b2c3d4e5f6...",
    "Content-Type": "application/json",
}

response = requests.post(
    "https://api.finvaultpay.com/api/v1/payment/create",
    headers=headers,
    json={"amount": 5000, "currency": "USD"},
)
data = response.json()`}
              />

              <div className="bg-white border border-[#dde8e3] rounded-[12px] px-4 py-3.5">
                <p className="text-[11px] font-semibold text-[#0a3d2e] mb-2">Auth errors</p>
                {[
                  ["401 Unauthorized",  "Key is missing or malformed"],
                  ["403 Forbidden",     "Key exists but is disabled — enable it in the dashboard"],
                  ["429 Too Many Requests", "Rate limit hit — back off and retry"],
                ].map(([code, msg]) => (
                  <div key={code} className="flex items-start gap-2 py-1.5 border-b border-[#f0f5f2] last:border-0">
                    <code className="text-[10px] font-mono font-semibold text-red-600 w-[160px] flex-shrink-0">{code}</code>
                    <p className="text-[11px] text-[#5a7568]">{msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Endpoints ── */}
          {activeSection === "endpoints" && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#0a3d2e] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  API Endpoints
                </h2>
                <p className="text-[13px] text-[#5a7568] leading-relaxed">
                  Base URL:{" "}
                  <code className="px-1.5 py-0.5 bg-[#f6faf8] border border-[#dde8e3] rounded text-[11px] font-mono text-[#0a3d2e]">
                    {BASE}
                  </code>
                </p>
              </div>

              {/* Note: dashboard-only key creation */}
              <div className="flex items-start gap-2.5 bg-[#E1F5EE] border border-[#b2dece] rounded-[10px] px-4 py-3">
                <ShieldCheck size={13} className="text-[#085041] mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-[#085041] leading-relaxed">
                  <strong>API keys can only be created from the Dashboard.</strong>{" "}
                  There is no API endpoint to create or manage keys programmatically.
                  Go to <strong>Dashboard → API Keys</strong> to generate a key.
                </p>
              </div>

              {/* Endpoint overview */}
              <div className="bg-white border border-[#dde8e3] rounded-[14px] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f5f2] bg-[#f6faf8]">
                  <p className="text-[10px] font-bold text-[#8a9e96] uppercase tracking-widest">Payments</p>
                </div>
                <div className="px-5">
                  <EndpointRow
                    method="POST"
                    path="/payment/create"
                    description="Initiate a new payment session. Returns a payment URL to redirect your customer to."
                  />
                  <EndpointRow
                    method="GET"
                    path="/payment/verify/:initedid"
                    description="Verify the status of a payment using the initedid returned from /payment/create."
                  />
                </div>
              </div>

              {/* ── POST /payment/create ── */}
              <div className="bg-white border border-[#dde8e3] rounded-[14px] overflow-hidden">
                <div className="px-5 py-3 bg-[#f6faf8] border-b border-[#f0f5f2] flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-[#E1F5EE] text-[#085041]">POST</span>
                  <code className="text-[12px] font-mono text-[#0a3d2e] font-semibold">/payment/create</code>
                </div>
                <div className="px-5 py-4 flex flex-col gap-4">
                  <p className="text-[12px] text-[#5a7568] leading-relaxed">
                    Creates a new payment session. The customer should be redirected to the returned
                    <code className="mx-1 px-1 py-0.5 bg-[#f6faf8] rounded text-[11px] font-mono text-[#0a3d2e]">paymentUrl</code>
                    to complete their payment. After completion, FinVault redirects to your key's <strong>Redirect URL</strong>.
                  </p>

                  <div>
                    <p className="text-[11px] font-semibold text-[#0a3d2e] mb-1.5">Request body</p>
                    <CodeBlock language="json" code={`{
  "amount":      5000,           // Required — integer, smallest currency unit (e.g. cents)
  "currency":    "USD",          // Required — ISO 4217 code
  "description": "Order #1042",  // Optional — shown on the payment page
  "metadata": {                  // Optional — returned as-is on verify
    "orderId": "1042",
    "userId":  "usr_abc123"
  }
}`} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-[#0a3d2e] mb-1.5">Success response <Badge label="200" color="green" /></p>
                    <CodeBlock language="json" code={`{
  "success":    true,
  "initedid":   "pi_9f3abc...",   // Use this to verify the payment later
  "paymentUrl": "https://pay.finvaultpay.com/session/pi_9f3abc..."
}`} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-[#0a3d2e] mb-1.5">Example (fetch)</p>
                    <CodeBlock language="javascript" code={`const res = await fetch("${BASE}/payment/create", {
  method: "POST",
  headers: {
    "Authorization": "Bearer fv_live_a1b2c3...",
    "Content-Type":  "application/json",
  },
  body: JSON.stringify({
    amount:      5000,
    currency:    "USD",
    description: "Order #1042",
    metadata:    { orderId: "1042" },
  }),
});

const { initedid, paymentUrl } = await res.json();

// Redirect the customer
window.location.href = paymentUrl;`} />
                  </div>
                </div>
              </div>

              {/* ── GET /payment/verify/:initedid ── */}
              <div className="bg-white border border-[#dde8e3] rounded-[14px] overflow-hidden">
                <div className="px-5 py-3 bg-[#f6faf8] border-b border-[#f0f5f2] flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-[#e8f0ff] text-[#1a3a8f]">GET</span>
                  <code className="text-[12px] font-mono text-[#0a3d2e] font-semibold">/payment/verify/:initedid</code>
                </div>
                <div className="px-5 py-4 flex flex-col gap-4">
                  <p className="text-[12px] text-[#5a7568] leading-relaxed">
                    Checks the current status of a payment. Use the
                    <code className="mx-1 px-1 py-0.5 bg-[#f6faf8] rounded text-[11px] font-mono text-[#0a3d2e]">initedid</code>
                    returned by <code className="px-1 py-0.5 bg-[#f6faf8] rounded text-[11px] font-mono text-[#0a3d2e]">/payment/create</code>.
                    Call this from your server when the customer lands on your redirect page.
                  </p>

                  <div>
                    <p className="text-[11px] font-semibold text-[#0a3d2e] mb-1.5">URL parameter</p>
                    <div className="bg-white border border-[#dde8e3] rounded-[10px] overflow-hidden">
                      <div className="flex items-start gap-3 px-4 py-3">
                        <code className="text-[11px] font-mono font-semibold text-[#1d9e75] w-[90px] flex-shrink-0">:initedid</code>
                        <p className="text-[11px] text-[#5a7568]">The payment session ID returned from <code className="px-1 py-0.5 bg-[#f6faf8] rounded font-mono text-[#0a3d2e]">/payment/create</code></p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-[#0a3d2e] mb-1.5">Success response <Badge label="200" color="green" /></p>
                    <CodeBlock language="json" code={`{
  "success":  true,
  "initedid": "pi_9f3abc...",
  "status":   "completed",      // pending | completed | failed | refunded
  "amount":   5000,
  "currency": "USD",
  "metadata": { "orderId": "1042" },
  "paidAt":   "2025-06-13T10:05:00Z"
}`} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-[#0a3d2e] mb-1.5">Example (server-side verify on redirect)</p>
                    <CodeBlock language="javascript" code={`// app/payment/success/page.tsx  (Next.js server component)
export default async function SuccessPage({ searchParams }) {
  const initedid = searchParams.initedid

  const res = await fetch(
    \`${BASE}/payment/verify/\${initedid}\`,
    { headers: { Authorization: "Bearer fv_live_a1b2c3..." } }
  )
  const data = await res.json()

  if (!data.success || data.status !== "completed") {
    return <p>Payment not completed.</p>
  }

  return <p>Payment confirmed! Order #{data.metadata.orderId}</p>
}`} />
                  </div>

                  {/* Status values */}
                  <div>
                    <p className="text-[11px] font-semibold text-[#0a3d2e] mb-1.5">Status values</p>
                    <div className="bg-white border border-[#dde8e3] rounded-[10px] overflow-hidden">
                      {[
                        { status: "pending",   desc: "Customer has not completed the payment yet" },
                        { status: "completed", desc: "Payment was successful — safe to fulfill the order" },
                        { status: "failed",    desc: "Payment attempt failed" },
                        { status: "refunded",  desc: "Payment was refunded" },
                      ].map((s) => (
                        <div key={s.status} className="flex items-start gap-3 px-4 py-3 border-b border-[#f0f5f2] last:border-0">
                          <code className="text-[11px] font-mono font-semibold text-[#1d9e75] w-[90px] flex-shrink-0">{s.status}</code>
                          <p className="text-[11px] text-[#5a7568]">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Webhooks ── */}
          {activeSection === "webhooks" && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#0a3d2e] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Webhooks
                </h2>
                <p className="text-[13px] text-[#5a7568] leading-relaxed">
                  If you set a Webhook URL on your API key, FinVault POSTs a JSON payload
                  to that URL whenever a payment event occurs. Your endpoint must respond
                  with <code className="px-1 py-0.5 bg-[#f6faf8] rounded text-[11px] font-mono text-[#0a3d2e]">200 OK</code> within 10 seconds.
                </p>
              </div>

              {/* Events */}
              <div className="bg-white border border-[#dde8e3] rounded-[14px] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f5f2] bg-[#f6faf8]">
                  <p className="text-[10px] font-bold text-[#8a9e96] uppercase tracking-widest">Event Types</p>
                </div>
                {[
                  { event: "payment.completed", desc: "Payment was successfully processed" },
                  { event: "payment.failed",    desc: "Payment attempt failed" },
                  { event: "payment.refunded",  desc: "Payment was refunded" },
                  { event: "key.disabled",      desc: "API key was disabled from the dashboard" },
                ].map((e) => (
                  <div key={e.event} className="flex items-start gap-3 px-5 py-3 border-b border-[#f0f5f2] last:border-0">
                    <code className="text-[11px] font-mono font-semibold text-[#1d9e75] w-[170px] flex-shrink-0">{e.event}</code>
                    <p className="text-[11px] text-[#5a7568]">{e.desc}</p>
                  </div>
                ))}
              </div>

              {/* Payload example */}
              <div>
                <p className="text-[11px] font-semibold text-[#0a3d2e] mb-2 flex items-center gap-1.5">
                  <Webhook size={11} className="text-[#1d9e75]" />
                  Sample payload
                </p>
                <CodeBlock
                  language="json"
                  code={`{
  "event":   "payment.completed",
  "apiKey":  "fv_live_a1b2...",
  "payload": {
    "id":        "pay_9f3a...",
    "amount":    5000,
    "currency":  "USD",
    "status":    "completed",
    "metadata":  { "orderId": "1042" },
    "createdAt": "2025-06-13T10:00:00Z"
  },
  "timestamp": "2025-06-13T10:00:05Z"
}`}
                />
              </div>

              {/* Retry policy */}
              <div className="bg-white border border-[#dde8e3] rounded-[12px] px-4 py-3.5">
                <p className="text-[11px] font-semibold text-[#0a3d2e] mb-2">Retry policy</p>
                <p className="text-[11px] text-[#5a7568] leading-relaxed">
                  If your endpoint doesn't respond with <code className="px-1 py-0.5 bg-[#f6faf8] rounded font-mono text-[#0a3d2e]">200 OK</code> within 10 seconds,
                  FinVault retries up to <strong className="text-[#0a3d2e]">3 times</strong> with exponential backoff
                  (30 s → 5 min → 30 min). After all retries fail, the event is dropped and logged in your dashboard.
                </p>
              </div>

              {/* Handler example */}
              <div>
                <p className="text-[11px] font-semibold text-[#0a3d2e] mb-2">Minimal webhook handler (Node.js)</p>
                <CodeBlock
                  language="javascript"
                  code={`// pages/api/webhooks/finvault.ts  (Next.js)
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  const { event, payload } = req.body

  switch (event) {
    case "payment.completed":
      await markOrderPaid(payload.metadata.orderId)
      break
    case "payment.failed":
      await notifyCustomer(payload)
      break
    // handle other events…
  }

  res.status(200).json({ received: true })
}`}
                />
              </div>
            </div>
          )}

          {/* ── Errors ── */}
          {activeSection === "errors" && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#0a3d2e] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Error Handling
                </h2>
                <p className="text-[13px] text-[#5a7568] leading-relaxed">
                  All errors return a JSON body with a <code className="px-1 py-0.5 bg-[#f6faf8] rounded text-[11px] font-mono text-[#0a3d2e]">message</code> field.
                  Use the HTTP status code to drive your retry / fallback logic.
                </p>
              </div>

              <CodeBlock
                language="json"
                code={`// Error response shape
{
  "success": false,
  "message": "A key with this name already exists"
}`}
              />

              {/* Status code table */}
              <div className="bg-white border border-[#dde8e3] rounded-[14px] overflow-hidden">
                <div className="grid grid-cols-12 px-5 py-2.5 bg-[#f6faf8] border-b border-[#f0f5f2]">
                  <p className="col-span-2 text-[10px] font-bold text-[#8a9e96] uppercase tracking-wide">Status</p>
                  <p className="col-span-4 text-[10px] font-bold text-[#8a9e96] uppercase tracking-wide">Meaning</p>
                  <p className="col-span-6 text-[10px] font-bold text-[#8a9e96] uppercase tracking-wide">What to do</p>
                </div>
                {[
                  ["400", "Bad Request",          "Fix the request body and retry"],
                  ["401", "Unauthorized",          "Check your API key is correct"],
                  ["403", "Forbidden",             "Enable the key in the dashboard"],
                  ["404", "Not Found",             "Check the resource ID"],
                  ["409", "Conflict",              "Duplicate name — use a different key name"],
                  ["422", "Unprocessable Entity",  "Validation failed — check field constraints"],
                  ["429", "Too Many Requests",     "Back off and retry after the Retry-After header"],
                  ["500", "Internal Server Error", "Retry with backoff; contact support if it persists"],
                ].map(([status, meaning, action]) => (
                  <div key={status} className="grid grid-cols-12 px-5 py-3 border-b border-[#f0f5f2] last:border-0 items-start">
                    <code className="col-span-2 text-[11px] font-mono font-bold text-[#0a3d2e]">{status}</code>
                    <p className="col-span-4 text-[11px] text-[#5a7568]">{meaning}</p>
                    <p className="col-span-6 text-[11px] text-[#5a7568]">{action}</p>
                  </div>
                ))}
              </div>

              {/* Retry snippet */}
              <div>
                <p className="text-[11px] font-semibold text-[#0a3d2e] mb-2">Simple retry with backoff</p>
                <CodeBlock
                  language="javascript"
                  code={`async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options)
    if (res.status !== 429 && res.status !== 500) return res

    const wait = Math.pow(2, i) * 1000   // 1 s, 2 s, 4 s
    await new Promise((r) => setTimeout(r, wait))
  }
  throw new Error("Max retries exceeded")
}`}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}