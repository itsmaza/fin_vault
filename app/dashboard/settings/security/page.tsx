// app/dashboard/settings/security/page.tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Shield } from "lucide-react"
import { updatePasscode } from "@/actions/settings.actions"

const passcodeSchema = z.object({
  currentPasscode: z
    .string()
    .length(4, "Must be 4 digits")
    .regex(/^\d{4}$/, "Digits only"),
  newPasscode: z
    .string()
    .length(4, "Must be 4 digits")
    .regex(/^\d{4}$/, "Digits only"),
  confirmPasscode: z
    .string()
    .length(4, "Must be 4 digits"),
}).refine((d) => d.newPasscode === d.confirmPasscode, {
  message: "Passcodes do not match",
  path: ["confirmPasscode"],
}).refine((d) => d.currentPasscode !== d.newPasscode, {
  message: "New passcode must be different",
  path: ["newPasscode"],
})

type PasscodeForm = z.infer<typeof passcodeSchema>

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#5a7568] tracking-wide uppercase">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

function PasscodeInput({ label, error, show, onToggle, registration }: {
  label: string
  error?: string
  show: boolean
  onToggle: () => void
  registration: object
}) {
  return (
    <Field label={label} error={error}>
      <div className="relative">
        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9e96]" />
        <input
          {...registration}
          type={show ? "text" : "password"}
          placeholder="••••"
          maxLength={4}
          className={`w-full pl-9 pr-10 py-2.5 text-[13px] text-[#0a3d2e] bg-white border rounded-[10px] outline-none transition-all tracking-[6px] placeholder:tracking-normal placeholder:text-[#8a9e96] focus:border-[#1d9e75] focus:ring-2 focus:ring-[#1d9e75]/10 ${
            error ? "border-red-300 bg-red-50/30" : "border-[#dde8e3]"
          }`}
        />
        <button type="button" onClick={onToggle} className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9e96] hover:text-[#5a7568] transition-colors">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </Field>
  )
}

export default function SecurityPage() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess]         = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasscodeForm>({ resolver: zodResolver(passcodeSchema) })

  const onSubmit = async (data: PasscodeForm) => {
    setServerError(null)
    const result = await updatePasscode({
      currentPasscode: data.currentPasscode,
      newPasscode: data.newPasscode,
    })
    if (!result.success) { setServerError(result.message); return }
    setSuccess(true)
    reset()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-[560px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#0a3d2e] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>Security</h1>
        <p className="text-[13px] text-[#5a7568] mt-0.5">Manage your account security</p>
      </div>

      {/* Security info */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-[#E1F5EE] rounded-[10px] flex items-center justify-center">
            <Shield size={16} className="text-[#085041]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0a3d2e]">4-Digit Passcode</p>
            <p className="text-[11px] text-[#8a9e96]">Last changed: Recently</p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] font-semibold px-2 py-1 bg-[#E1F5EE] text-[#085041] rounded-full">Active</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Passcode", value: "4-digit PIN" },
            { label: "Encryption", value: "bcrypt-12" },
            { label: "Session", value: "JWT 7d" },
          ].map((item) => (
            <div key={item.label} className="bg-[#f6faf8] rounded-[8px] px-3 py-2.5 text-center">
              <p className="text-[10px] text-[#8a9e96] font-semibold tracking-wide uppercase">{item.label}</p>
              <p className="text-[12px] font-semibold text-[#0a3d2e] mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Change passcode form */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5">
        <h2 className="text-[14px] font-bold text-[#0a3d2e] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
          Change Passcode
        </h2>

        {success && (
          <div className="flex items-center gap-2 bg-[#E1F5EE] border border-[#b2dece] text-[#085041] text-[12px] font-medium px-4 py-3 rounded-[10px] mb-4">
            <CheckCircle2 size={14} /> Passcode updated successfully
          </div>
        )}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-3 rounded-[10px] mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <PasscodeInput label="Current Passcode" error={errors.currentPasscode?.message} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} registration={register("currentPasscode")} />
          <PasscodeInput label="New Passcode" error={errors.newPasscode?.message} show={showNew} onToggle={() => setShowNew(!showNew)} registration={register("newPasscode")} />
          <PasscodeInput label="Confirm New Passcode" error={errors.confirmPasscode?.message} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} registration={register("confirmPasscode")} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer flex items-center justify-center gap-2 py-2.5 bg-[#0a3d2e] hover:bg-[#0f5c44] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-[10px] transition-colors"
          >
            {isSubmitting ? <><Loader2 size={13} className="animate-spin" />Updating...</> : "Update Passcode"}
          </button>
        </form>
      </div>
    </div>
  )
}