// app/dashboard/settings/privacy/page.tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Shield, Lock, Eye, EyeOff, CheckCircle2, Loader2, FileText, Trash2, Download } from "lucide-react"
import { updatePrivacy } from "@/actions/settings.actions"
import { logout } from "@/actions/auth.action"

const verifySchema = z.object({
  passcode: z
    .string()
    .length(4, "Must be 4 digits")
    .regex(/^\d{4}$/, "Digits only"),
})

type VerifyForm = z.infer<typeof verifySchema>

export default function PrivacyPage() {
  const [showPasscode, setShowPasscode] = useState(false)
  const [verified, setVerified]         = useState(false)
  const [serverError, setServerError]   = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyForm>({ resolver: zodResolver(verifySchema) })

  const onVerify = async (data: VerifyForm) => {
    setServerError(null)
    const result = await updatePrivacy({ currentPasscode: data.passcode })
    if (!result.success) { setServerError(result.message); return }
    setVerified(true)
  }

  return (
   <>
    <div className="max-w-[560px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#0a3d2e] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>Privacy</h1>
        <p className="text-[13px] text-[#5a7568] mt-0.5">Control your data and account privacy</p>
      </div>

      {/* Privacy items */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] overflow-hidden mb-4">
        {[
          {
            icon: FileText,
            title: "Transaction Data",
            description: "Your transaction history is encrypted and stored securely",
            badge: "Protected",
            badgeColor: "bg-[#E1F5EE] text-[#085041]",
          },
          {
            icon: Shield,
            title: "Data Encryption",
            description: "All sensitive data is encrypted using industry-standard AES-256",
            badge: "Active",
            badgeColor: "bg-[#E1F5EE] text-[#085041]",
          },
          {
            icon: Lock,
            title: "Session Security",
            description: "Sessions expire after 7 days of inactivity",
            badge: "JWT",
            badgeColor: "bg-[#f6faf8] text-[#5a7568] border border-[#dde8e3]",
          },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-[#f0f5f2] last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f6faf8] rounded-[8px] flex items-center justify-center">
                <item.icon size={14} className="text-[#5a7568]" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#0a3d2e]">{item.title}</p>
                <p className="text-[11px] text-[#8a9e96] mt-0.5">{item.description}</p>
              </div>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-3 ${item.badgeColor}`}>
              {item.badge}
            </span>
          </div>
        ))}
      </div>

      {/* Verify identity section */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5 mb-4">
        <h2 className="text-[14px] font-bold text-[#0a3d2e] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          Verify Identity
        </h2>
        <p className="text-[12px] text-[#8a9e96] mb-4">
          Enter your passcode to access data management options
        </p>

        {verified ? (
          <div className="flex items-center gap-2 bg-[#E1F5EE] border border-[#b2dece] text-[#085041] text-[12px] font-medium px-4 py-3 rounded-[10px]">
            <CheckCircle2 size={14} /> Identity verified
          </div>
        ) : (
          <>
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-3 rounded-[10px] mb-3">
                {serverError}
              </div>
            )}
            <form onSubmit={handleSubmit(onVerify)} className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9e96]" />
                  <input
                    {...register("passcode")}
                    type={showPasscode ? "text" : "password"}
                    placeholder="••••"
                    maxLength={4}
                    className={`w-full pl-9 pr-9 py-2.5 text-[13px] text-[#0a3d2e] bg-white border rounded-[10px] outline-none tracking-[6px] placeholder:tracking-normal placeholder:text-[#8a9e96] focus:border-[#1d9e75] focus:ring-2 focus:ring-[#1d9e75]/10 transition-all ${
                      errors.passcode ? "border-red-300" : "border-[#dde8e3]"
                    }`}
                  />
                  <button type="button" onClick={() => setShowPasscode(!showPasscode)} className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9e96]">
                    {showPasscode ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {errors.passcode && <p className="text-[11px] text-red-500 mt-1">{errors.passcode.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 bg-[#0a3d2e] hover:bg-[#0f5c44] disabled:opacity-50 text-white text-[12px] font-semibold rounded-[10px] transition-colors"
              >
                {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
                Verify
              </button>
            </form>
          </>
        )}
      </div>

      {/* Data actions — only shown after verify */}
      {verified && (
        <div className="bg-white border border-[#dde8e3] rounded-[16px] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0f5f2]">
            <p className="text-[12px] font-semibold text-[#0a3d2e]">Data Management</p>
          </div>
          {[
            {
              icon: Download,
              title: "Export My Data",
              description: "Download all your transaction history as CSV",
              action: "Export",
              color: "text-[#0a3d2e]",
              bg: "bg-[#f6faf8] hover:bg-[#edf5f0]",
            },
            {
              icon: Trash2,
              title: "Delete Account",
              description: "Permanently delete your account and all data",
              action: "Delete",
              color: "text-red-500",
              bg: "bg-red-50 hover:bg-red-100",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-between px-5 py-4 border-b border-[#f0f5f2] last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f6faf8] rounded-[8px] flex items-center justify-center">
                  <item.icon size={14} className={item.color} />
                </div>
                <div>
                  <p className={`text-[12px] font-semibold ${item.color}`}>{item.title}</p>
                  <p className="text-[11px] text-[#8a9e96] mt-0.5">{item.description}</p>
                </div>
              </div>
              <button className={`cursor-pointer px-3 py-1.5 text-[11px] font-semibold rounded-[7px] ${item.bg} ${item.color} transition-colors`}>
                {item.action}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
   </>
  )
}