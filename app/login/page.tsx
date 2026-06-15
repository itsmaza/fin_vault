// app/login/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Layers, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { login } from "@/actions/auth.action"
import { LoginForm, loginSchema } from "@/validation/auth.validation"

function Field({
  label,
  error,
  children,
}: {
  label:    string
  error?:   string
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

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get("redirect") ?? "/dashboard"

  const [showPasscode, setShowPasscode] = useState(false)
  const [serverError, setServerError]   = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)

    const result = await login({
      email:    data.email,
      passcode: data.passcode,
    })

    if (!result.success) {
      setServerError(result.message)
      return
    }

    router.push(redirectTo)
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
          <span className="text-white text-[17px] font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
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
            Welcome <br />
            back to <em className="text-[#1d9e75] not-italic">FinVault</em>
          </h2>
          <p className="text-[14px] text-[#6fa890] leading-relaxed">
            Your AI-powered banking assistant is ready. Sign in to manage your finances with ease.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {[
              "Send money instantly with a message",
              "Track your spending with AI insights",
              "Secure 4-digit passcode protection",
              "Real-time transaction history",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#1d9e75]/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1d9e75]" />
                </div>
                <span className="text-[13px] text-[#6fa890]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#4a7060]">© 2025 FinVault. All rights reserved.</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-[30px] h-[30px] bg-[#1d9e75] rounded-[8px] flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            <span className="text-[#0a3d2e] text-[15px] font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
              FinVault
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-[26px] font-bold text-[#0a3d2e] tracking-tight mb-1.5"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Sign in to your account
            </h1>
            <p className="text-[13px] text-[#5a7568]">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#1d9e75] font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>

          {/* Redirect notice */}
          {redirectTo !== "/dashboard" && (
            <div className="bg-[#E1F5EE] border border-[#b2dece] text-[#085041] text-[12px] font-medium px-4 py-3 rounded-[10px] mb-5">
              Sign in to complete your payment
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-3 rounded-[10px] mb-5">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Email Address" error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                placeholder="john@example.com"
                className={inputClass(!!errors.email)}
              />
            </Field>

            <Field label="4-Digit Passcode" error={errors.passcode?.message}>
              <div className="relative">
                <input
                  {...register("passcode")}
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

            <div className="flex justify-end -mt-1">
              <Link href="/forgot-passcode" className="text-[11px] text-[#1d9e75] hover:underline font-medium">
                Forgot passcode?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer mt-1 w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0a3d2e] hover:bg-[#0f5c44] active:bg-[#083326] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-[10px] transition-colors duration-150"
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" />Signing in...</>
              ) : (
                <><ArrowRight size={14} />Sign in</>
              )}
            </button>
          </form>

          {/* Test credentials */}
          <div className="mt-6 bg-white border border-[#dde8e3] rounded-[10px] p-4">
            <p className="text-[10px] font-semibold text-[#8a9e96] tracking-wide uppercase mb-2">
              Test Credentials
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-[11px] text-[#5a7568]">Email</span>
                <span className="text-[11px] font-mono font-semibold text-[#0a3d2e]">test@finvault.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-[#5a7568]">Passcode</span>
                <span className="text-[11px] font-mono font-semibold text-[#0a3d2e]">2222</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}