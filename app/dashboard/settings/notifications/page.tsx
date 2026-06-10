// app/dashboard/settings/notifications/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Mail, Loader2, CheckCircle2 } from "lucide-react"
import { getProfile } from "@/actions/user.actions"
import { toggleEmailNotification } from "@/actions/settings.actions"

export default function NotificationsPage() {
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [isSendEmail, setIsSendEmail] = useState(true)
  const [success, setSuccess]         = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    getProfile().then((result:any) => {
      if (result.success && result.data) {
        setIsSendEmail(result.data.isSendEmail ?? true)
      }
      setLoading(false)
    })
  }, [])

  const handleToggle = async (enabled: boolean) => {
    setSaving(true)
    setServerError(null)
    setIsSendEmail(enabled)

    const result = await toggleEmailNotification(enabled)

    if (!result.success) {
      setIsSendEmail(!enabled) // revert
      setServerError(result.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={20} className="animate-spin text-[#1d9e75]" />
    </div>
  )

  return (
    <div className="max-w-[560px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#0a3d2e] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
          Notifications
        </h1>
        <p className="text-[13px] text-[#5a7568] mt-0.5">Manage how you receive alerts</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-[#E1F5EE] border border-[#b2dece] text-[#085041] text-[12px] font-medium px-4 py-3 rounded-[10px] mb-4">
          <CheckCircle2 size={14} />
          {isSendEmail ? "Email notifications enabled" : "Email notifications disabled"}
        </div>
      )}

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-3 rounded-[10px] mb-4">
          {serverError}
        </div>
      )}

      <div className="bg-white border border-[#dde8e3] rounded-[16px] overflow-hidden">
        {/* Single notification option */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors ${
              isSendEmail ? "bg-[#E1F5EE]" : "bg-[#f6faf8]"
            }`}>
              <Mail size={15} className={isSendEmail ? "text-[#085041]" : "text-[#8a9e96]"} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0a3d2e]">
                Transaction Email Alerts
              </p>
              <p className="text-[12px] text-[#8a9e96] mt-0.5">
                Receive an email for every send, receive, deposit, and withdrawal
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            onClick={() => handleToggle(!isSendEmail)}
            disabled={saving}
            className={`cursor-pointer relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-4 ${
              isSendEmail ? "bg-[#1d9e75]" : "bg-[#dde8e3]"
            } ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              isSendEmail ? "translate-x-5" : "translate-x-0.5"
            }`} />
            {saving && (
              <Loader2 size={10} className="absolute inset-0 m-auto animate-spin text-white" />
            )}
          </button>
        </div>

        {/* Status info */}
        <div className="px-5 pb-4 pt-0">
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-[8px] ${
            isSendEmail ? "bg-[#E1F5EE]" : "bg-[#f6faf8] border border-[#dde8e3]"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSendEmail ? "bg-[#1d9e75]" : "bg-[#8a9e96]"}`} />
            <p className={`text-[11px] font-medium ${isSendEmail ? "text-[#085041]" : "text-[#8a9e96]"}`}>
              {isSendEmail
                ? "You will receive an email for every transaction on your account"
                : "Email notifications are currently disabled"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}