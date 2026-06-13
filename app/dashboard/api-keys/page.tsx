// app/dashboard/api/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Key, Plus, Trash2, X, Loader2, Copy, Check,
  Eye, EyeOff, ShieldCheck, Link2, BookOpen,
} from "lucide-react"
import {
  getApiKeys,
  createApiKey,
  toggleApiKey,
  deleteApiKey,
} from "@/actions/api-key.actions"
import type { SafeApiKey } from "@/types"

// ─── Schema ───────────────────────────────────────────────
const createSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(40, "Name too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Only letters, numbers, spaces, - and _"),
  redirectUrl: z
    .string()
    .min(1, "Redirect URL is required")
    .url("Must be a valid URL"),
  webhookUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
})

type CreateForm = z.infer<typeof createSchema>

// ─── Helpers ──────────────────────────────────────────────
function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

function maskKey(key: string) {
  return key.slice(0, 12) + "•••••••••••••••••••••••" + key.slice(-4)
}

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string
  error?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#5a7568] tracking-wide uppercase">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-[11px] text-[#8a9e96]">{hint}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────
export default function ApiKeysPage() {
  const [keys, setKeys]                         = useState<SafeApiKey[]>([])
  const [loading, setLoading]                   = useState(true)
  const [showModal, setShowModal]               = useState(false)
  const [serverError, setServerError]           = useState<string | null>(null)
  const [newKey, setNewKey]                     = useState<SafeApiKey | null>(null)
  const [visibleKeys, setVisibleKeys]           = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId]                 = useState<string | null>(null)
  const [togglingId, setTogglingId]             = useState<string | null>(null)
  const [deletingId, setDeletingId]             = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId]   = useState<string | null>(null)
  const [expandedId, setExpandedId]             = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) })

  const fetchKeys = async () => {
    setLoading(true)
    const result = await getApiKeys()
    if (result.success && result.data) setKeys(result.data)
    setLoading(false)
  }

  useEffect(() => { fetchKeys() }, [])

  const onSubmit = async (data: CreateForm) => {
    setServerError(null)
    const result = await createApiKey({
      name:        data.name,
      redirectUrl: data.redirectUrl,
      webhookUrl:  data.webhookUrl || undefined,
    })
    if (!result.success) { setServerError(result.message); return }
    setNewKey(result.data!)
    reset()
    await fetchKeys()
  }

  const handleToggle = async (keyId: string) => {
    setTogglingId(keyId)
    const result = await toggleApiKey(keyId)
    if (result.success) {
      setKeys((prev) =>
        prev.map((k) => k._id === keyId ? { ...k, isActive: result.data!.isActive } : k)
      )
    }
    setTogglingId(null)
  }

  const handleDelete = async (keyId: string) => {
    setDeletingId(keyId)
    await deleteApiKey(keyId)
    setKeys((prev) => prev.filter((k) => k._id !== keyId))
    setDeleteConfirmId(null)
    setDeletingId(null)
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 text-[13px] text-[#0a3d2e] bg-white border rounded-[10px] outline-none transition-all placeholder:text-[#8a9e96] focus:border-[#1d9e75] focus:ring-2 focus:ring-[#1d9e75]/10 ${
      hasError ? "border-red-300 bg-red-50/30" : "border-[#dde8e3]"
    }`

  const activeCount   = keys.filter((k) => k.isActive).length
  const inactiveCount = keys.filter((k) => !k.isActive).length

  const openModal = () => {
    setShowModal(true)
    setServerError(null)
    setNewKey(null)
    reset()
  }

  const closeModal = () => {
    setShowModal(false)
    setNewKey(null)
    reset()
  }

  return (
    <div className="max-w-[800px]">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1
            className="text-[22px] font-bold text-[#0a3d2e] tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            API Keys
          </h1>
          <p className="text-[13px] text-[#5a7568] mt-0.5">
            Manage access keys for FinVault Pay integration
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href="/dashboard/api-keys/docs"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#f6faf8] hover:bg-[#edf5f0] border border-[#dde8e3] text-[#5a7568] hover:text-[#0a3d2e] text-[12px] font-semibold rounded-[8px] transition-colors"
          >
            <BookOpen size={13} />
            See Documentation
          </a>
          <button
            onClick={openModal}
            disabled={keys.length >= 5}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#0a3d2e] hover:bg-[#0f5c44] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-[8px] transition-colors"
          >
            <Plus size={13} />
            New API Key
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "TOTAL KEYS", value: keys.length, suffix: "/ 5" },
          { label: "ACTIVE",     value: activeCount,   suffix: "" },
          { label: "INACTIVE",   value: inactiveCount, suffix: "" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#dde8e3] rounded-[14px] px-4 py-3">
            <p className="text-[10px] font-semibold text-[#8a9e96] tracking-widest mb-1">{s.label}</p>
            <p className="text-[20px] font-bold text-[#0a3d2e]" style={{ fontFamily: "'Fraunces', serif" }}>
              {s.value}
              {s.suffix && (
                <span className="text-[13px] text-[#8a9e96] font-normal ml-1">{s.suffix}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2.5 bg-[#FAEEDA]/50 border border-[#f5d9a8] rounded-[10px] px-4 py-3 mb-5">
        <ShieldCheck size={13} className="text-[#633806] mt-0.5 flex-shrink-0" />
        <p className="text-[12px] text-[#633806]">
          Keep your API keys secret. Never expose them in frontend code or public repositories.
          Each key includes its own redirect and webhook URL.{" "}
          <a
            href="/dashboard/api-keys/docs"
            className="underline underline-offset-2 font-semibold hover:text-[#7a4500] transition-colors"
          >
            View integration docs →
          </a>
        </p>
      </div>

      {/* Keys list */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] overflow-hidden">

        {/* Table head */}
        <div className="grid grid-cols-12 px-5 py-3 bg-[#f6faf8] border-b border-[#f0f5f2]">
          {[
            { label: "Name",    col: "col-span-2" },
            { label: "Key",     col: "col-span-4" },
            { label: "Created", col: "col-span-2" },
            { label: "URLs",    col: "col-span-2" },
            { label: "Status",  col: "col-span-1" },
            { label: "",        col: "col-span-1" },
          ].map((h) => (
            <p
              key={h.label}
              className={`text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase ${h.col}`}
            >
              {h.label}
            </p>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-14">
            <Loader2 size={20} className="animate-spin text-[#1d9e75]" />
          </div>
        )}

        {/* Empty */}
        {!loading && keys.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f6faf8] border border-[#dde8e3] flex items-center justify-center">
              <Key size={18} className="text-[#8a9e96]" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-[#0a3d2e]">No API keys yet</p>
              <p className="text-[12px] text-[#8a9e96] mt-0.5">
                Create your first key to accept payments
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/dashboard/api-keys/docs"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#f6faf8] border border-[#dde8e3] text-[#5a7568] text-[12px] font-semibold rounded-[8px] hover:bg-[#edf5f0] transition-colors"
              >
                <BookOpen size={12} />
                Docs
              </a>
              <button
                onClick={openModal}
                className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-[#E1F5EE] text-[#085041] text-[12px] font-semibold rounded-[8px] hover:bg-[#c8f0df] transition-colors"
              >
                <Plus size={12} />
                Create first key
              </button>
            </div>
          </div>
        )}

        {/* Rows */}
        {!loading && keys.map((k) => (
          <div key={k._id}>
            <div
              className={`grid grid-cols-12 px-5 py-4 border-b border-[#f0f5f2] last:border-0 items-center transition-colors ${
                !k.isActive ? "opacity-60 bg-[#fafafa]" : "hover:bg-[#f6faf8]"
              }`}
            >
              {/* Name */}
              <div className="col-span-2 pr-2">
                <p className="text-[12px] font-semibold text-[#0a3d2e] truncate">{k.name}</p>
              </div>

              {/* Key */}
              <div className="col-span-4 flex items-center gap-1 pr-2">
                <p className="text-[11px] font-mono text-[#5a7568] truncate">
                  {visibleKeys[k._id] ? k.key : maskKey(k.key)}
                </p>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => setVisibleKeys((p) => ({ ...p, [k._id]: !p[k._id] }))}
                    className="cursor-pointer w-6 h-6 flex items-center justify-center text-[#8a9e96] hover:text-[#0a3d2e] transition-colors"
                  >
                    {visibleKeys[k._id] ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    onClick={() => handleCopy(k.key, k._id)}
                    className="cursor-pointer w-6 h-6 flex items-center justify-center text-[#8a9e96] hover:text-[#1d9e75] transition-colors"
                  >
                    {copiedId === k._id
                      ? <Check size={12} className="text-[#1d9e75]" />
                      : <Copy size={12} />
                    }
                  </button>
                </div>
              </div>

              {/* Created */}
              <p className="col-span-2 text-[11px] text-[#8a9e96]">
                {formatDate(k.createdAt)}
              </p>

              {/* URLs toggle */}
              <div className="col-span-2">
                <button
                  onClick={() => setExpandedId(expandedId === k._id ? null : k._id)}
                  className="cursor-pointer flex items-center gap-1 text-[11px] text-[#1d9e75] hover:underline font-medium"
                >
                  <Link2 size={11} />
                  {expandedId === k._id ? "Hide" : "View URLs"}
                </button>
              </div>

              {/* Status toggle */}
              <div className="col-span-1 flex items-center">
                <button
                  onClick={() => handleToggle(k._id)}
                  disabled={togglingId === k._id}
                  title={k.isActive ? "Disable" : "Enable"}
                  className={`cursor-pointer relative w-9 h-5 rounded-full transition-colors duration-200 ${
                    k.isActive ? "bg-[#1d9e75]" : "bg-[#dde8e3]"
                  } ${togglingId === k._id ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    k.isActive ? "translate-x-4" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              {/* Delete */}
              <div className="col-span-1 flex justify-end">
                {deleteConfirmId === k._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(k._id)}
                      disabled={deletingId === k._id}
                      className="cursor-pointer w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-[5px] transition-colors"
                    >
                      {deletingId === k._id
                        ? <Loader2 size={10} className="animate-spin" />
                        : <Check size={10} />
                      }
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="cursor-pointer w-6 h-6 flex items-center justify-center bg-[#f6faf8] border border-[#dde8e3] text-[#5a7568] rounded-[5px] transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(k._id)}
                    className="cursor-pointer w-7 h-7 flex items-center justify-center text-[#8a9e96] hover:bg-red-50 hover:text-red-500 rounded-[7px] transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Expanded URLs */}
            {expandedId === k._id && (
              <div className="px-5 py-3 bg-[#f6faf8] border-b border-[#f0f5f2] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-[#8a9e96] uppercase tracking-wide w-[90px] flex-shrink-0">
                    Redirect URL
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <p className="text-[11px] font-mono text-[#0a3d2e] truncate">
                      {k.redirectUrl}
                    </p>
                    <button
                      onClick={() => handleCopy(k.redirectUrl, `redirect-${k._id}`)}
                      className="cursor-pointer flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#8a9e96] hover:text-[#1d9e75] transition-colors"
                    >
                      {copiedId === `redirect-${k._id}`
                        ? <Check size={11} className="text-[#1d9e75]" />
                        : <Copy size={11} />
                      }
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-[#8a9e96] uppercase tracking-wide w-[90px] flex-shrink-0">
                    Webhook URL
                  </span>
                  <p className="text-[11px] font-mono text-[#5a7568] truncate">
                    {k.webhookUrl ?? (
                      <span className="text-[#8a9e96] not-italic">Not set</span>
                    )}
                  </p>
                  {k.webhookUrl && (
                    <button
                      onClick={() => handleCopy(k.webhookUrl!, `webhook-${k._id}`)}
                      className="cursor-pointer flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#8a9e96] hover:text-[#1d9e75] transition-colors"
                    >
                      {copiedId === `webhook-${k._id}`
                        ? <Check size={11} className="text-[#1d9e75]" />
                        : <Copy size={11} />
                      }
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── Create Modal ──────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={closeModal}
          />

          <div className="relative z-10 w-full max-w-[460px] bg-white rounded-[20px] shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dde8e3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#E1F5EE] rounded-[8px] flex items-center justify-center">
                  <Key size={14} className="text-[#085041]" />
                </div>
                <h2
                  className="text-[14px] font-bold text-[#0a3d2e]"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {newKey ? "Key Created!" : "New API Key"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="cursor-pointer w-7 h-7 flex items-center justify-center text-[#8a9e96] hover:text-[#0a3d2e] hover:bg-[#f6faf8] rounded-full transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[75vh]">

              {/* New key reveal */}
              {newKey ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-[#E1F5EE] border border-[#b2dece] rounded-[12px] p-4">
                    <p className="text-[11px] font-semibold text-[#085041] mb-2">
                      ⚠️ Copy this key now — it won't be shown again
                    </p>
                    <div className="flex items-center gap-2 bg-white border border-[#dde8e3] rounded-[8px] px-3 py-2.5">
                      <p className="text-[11px] font-mono text-[#0a3d2e] flex-1 break-all">
                        {newKey.key}
                      </p>
                      <button
                        onClick={() => handleCopy(newKey.key, newKey._id)}
                        className="cursor-pointer flex items-center gap-1 px-2 py-1 bg-[#E1F5EE] text-[#085041] text-[10px] font-semibold rounded-[5px] hover:bg-[#c8f0df] flex-shrink-0 transition-colors"
                      >
                        {copiedId === newKey._id
                          ? <><Check size={10} />Copied!</>
                          : <><Copy size={10} />Copy</>
                        }
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-[#f6faf8] border border-[#dde8e3] rounded-[10px] p-3 flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-[11px] text-[#8a9e96]">Name</span>
                      <span className="text-[11px] font-semibold text-[#0a3d2e]">{newKey.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[11px] text-[#8a9e96]">Redirect URL</span>
                      <span className="text-[11px] font-mono text-[#0a3d2e] truncate max-w-[200px]">{newKey.redirectUrl}</span>
                    </div>
                    {newKey.webhookUrl && (
                      <div className="flex justify-between">
                        <span className="text-[11px] text-[#8a9e96]">Webhook URL</span>
                        <span className="text-[11px] font-mono text-[#0a3d2e] truncate max-w-[200px]">{newKey.webhookUrl}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2.5">
                    <a
                      href="/dashboard/api-keys/docs"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#f6faf8] border border-[#dde8e3] text-[#5a7568] hover:text-[#0a3d2e] hover:bg-[#edf5f0] text-[13px] font-semibold rounded-[10px] transition-colors"
                    >
                      <BookOpen size={13} />
                      View Docs
                    </a>
                    <button
                      onClick={closeModal}
                      className="cursor-pointer flex-1 py-2.5 bg-[#0a3d2e] hover:bg-[#0f5c44] text-white text-[13px] font-semibold rounded-[10px] transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-3 rounded-[10px] mb-4">
                      {serverError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <Field label="Key Name" error={errors.name?.message} hint={`${5 - keys.length} key${5 - keys.length === 1 ? "" : "s"} remaining`}>
                      <input
                        {...register("name")}
                        placeholder="e.g. My Shop, Production"
                        className={inputClass(!!errors.name)}
                        autoFocus
                      />
                    </Field>

                    <Field
                      label="Redirect URL"
                      error={errors.redirectUrl?.message}
                      hint="Customer lands here after payment"
                    >
                      <input
                        {...register("redirectUrl")}
                        placeholder="https://myshop.com/payment/success"
                        className={inputClass(!!errors.redirectUrl)}
                      />
                    </Field>

                    <Field
                      label="Webhook URL (Optional)"
                      error={errors.webhookUrl?.message}
                      hint="We'll POST payment events here"
                    >
                      <input
                        {...register("webhookUrl")}
                        placeholder="https://myshop.com/api/webhook"
                        className={inputClass(!!errors.webhookUrl)}
                      />
                    </Field>

                    <div className="flex gap-3 mt-1">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="cursor-pointer flex-1 py-2.5 bg-white border border-[#dde8e3] text-[#5a7568] text-[13px] font-semibold rounded-[10px] hover:bg-[#f6faf8] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0a3d2e] hover:bg-[#0f5c44] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-[10px] transition-colors"
                      >
                        {isSubmitting
                          ? <><Loader2 size={13} className="animate-spin" />Creating...</>
                          : <><Key size={13} />Generate Key</>
                        }
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}