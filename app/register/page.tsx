// app/register/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Layers, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { register } from "@/actions/auth.action"
import { RegisterForm, registerSchema } from "@/validation/auth.validation"


// ─── Field Component ──────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#5a7568] tracking-wide uppercase">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const [showPasscode, setShowPasscode] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null)

    const result = await register({
      name: data.name,
      email: data.email,
      passcode: data.passcode,
      address: data.address || undefined,
    })

    if (!result.success) {
      setServerError(result.message)
      return
    }

    router.push("/dashboard")
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 text-[13px] text-[#0a3d2e] bg-white border rounded-[10px] outline-none transition-all placeholder:text-[#8a9e96] focus:border-[#1d9e75] focus:ring-2 focus:ring-[#1d9e75]/10 ${
      hasError ? "border-red-300 bg-red-50/30" : "border-[#dde8e3]"
    }`

  return (
    <div className="min-h-screen bg-[#f6faf8] flex">

      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-[#0a3d2e] px-10 py-12">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] bg-[#1d9e75] rounded-[9px] flex items-center justify-center shadow-lg shadow-[#1d9e75]/20">
            <Layers size={16} className="text-white" />
          </div>
          <span
            className="text-white text-[17px] font-bold"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            FinVault
          </span>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 bg-[#1d9e75]/20 text-[#6fe0b0] text-[11px] font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
            <span className="w-1.5 h-1.5 bg-[#1d9e75] rounded-full" />
            AI-Powered Banking
          </div>
          <h2
            className="text-[32px] font-bold text-white leading-[1.15] tracking-tight mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Banking that
            <br />
            works for <em className="text-[#1d9e75] not-italic">you</em>
          </h2>
          <p className="text-[14px] text-[#6fa890] leading-relaxed">
            Send money, track spending, and manage your finances — all with a
            single message.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              { value: "50K+",    label: "Active users" },
              { value: "$2M+",    label: "Transferred daily" },
              { value: "99.9%",   label: "Uptime" },
              { value: "256-bit", label: "Encryption" },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.06] rounded-[10px] px-4 py-3">
                <p
                  className="text-[18px] font-bold text-white"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {s.value}
                </p>
                <p className="text-[11px] text-[#6fa890] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#4a7060]">
          © 2025 FinVault. All rights reserved.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-[30px] h-[30px] bg-[#1d9e75] rounded-[8px] flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            <span
              className="text-[#0a3d2e] text-[15px] font-bold"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              FinVault
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-[26px] font-bold text-[#0a3d2e] tracking-tight mb-1.5"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Create your account
            </h1>
            <p className="text-[13px] text-[#5a7568]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#1d9e75] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-3 rounded-[10px] mb-5">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <Field label="Full Name" error={errors.name?.message}>
              <input
                {...reg("name")}
                placeholder="John Doe"
                className={inputClass(!!errors.name)}
              />
            </Field>

            <Field label="Email Address" error={errors.email?.message}>
              <input
                {...reg("email")}
                type="email"
                placeholder="john@example.com"
                className={inputClass(!!errors.email)}
              />
            </Field>

            <Field label="Address (Optional)" error={errors.address?.message}>
              <input
                {...reg("address")}
                placeholder="123 Main St, New York"
                className={inputClass(!!errors.address)}
              />
            </Field>

            <Field label="4-Digit Passcode" error={errors.passcode?.message}>
              <div className="relative">
                <input
                  {...reg("passcode")}
                  type={showPasscode ? "text" : "password"}
                  placeholder="••••"
                  maxLength={4}
                  className={`${inputClass(!!errors.passcode)} pr-10 tracking-[6px]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9e96] hover:text-[#5a7568] transition-colors"
                >
                  {showPasscode ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <Field label="Confirm Passcode" error={errors.confirmPasscode?.message}>
              <div className="relative">
                <input
                  {...reg("confirmPasscode")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••"
                  maxLength={4}
                  className={`${inputClass(!!errors.confirmPasscode)} pr-10 tracking-[6px]`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9e96] hover:text-[#5a7568] transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer mt-1 w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0a3d2e] hover:bg-[#0f5c44] active:bg-[#083326] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-[10px] transition-colors duration-150"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-[#8a9e96] text-center mt-5 leading-relaxed">
            By creating an account you agree to our{" "}
            <span className="text-[#5a7568] cursor-pointer hover:underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-[#5a7568] cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}