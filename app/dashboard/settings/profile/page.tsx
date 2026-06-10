// app/dashboard/settings/profile/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User, Mail, MapPin, Loader2, CheckCircle2, Camera } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { updateProfile } from "@/actions/settings.actions"
import { getProfile } from "@/actions/user.actions"

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long")
    .regex(/^[a-zA-Z\s]+$/, "Letters only"),
  address: z.string().max(200, "Address too long").optional().or(z.literal("")),
})

type ProfileForm = z.infer<typeof profileSchema>

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#5a7568] tracking-wide uppercase">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [initials, setInitials] = useState("FV")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    getProfile().then((result) => {
      if (result.success && result.data) {
        reset({ name: result.data.name, address: result.data.address ?? "" })
        setEmail(result.data.email)
        setInitials(
          result.data.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        )
      }
      setLoading(false)
    })
  }, [reset])

  const onSubmit = async (data: ProfileForm) => {
    setServerError(null)
    const result = await updateProfile({ name: data.name, address: data.address })
    if (!result.success) { setServerError(result.message); return }
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 text-[13px] text-[#0a3d2e] bg-white border rounded-[10px] outline-none transition-all placeholder:text-[#8a9e96] focus:border-[#1d9e75] focus:ring-2 focus:ring-[#1d9e75]/10 ${
      hasError ? "border-red-300 bg-red-50/30" : "border-[#dde8e3]"
    }`

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={20} className="animate-spin text-[#1d9e75]" />
    </div>
  )

  return (
    <div className="max-w-[560px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#0a3d2e] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
          Profile
        </h1>
        <p className="text-[13px] text-[#5a7568] mt-0.5">Manage your personal information</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5 mb-4 flex items-center gap-4">
        <div className="relative">
          <div className="w-[60px] h-[60px] rounded-full bg-[#1d9e75] flex items-center justify-center text-[18px] font-bold text-white ring-4 ring-[#1d9e75]/10">
            {initials}
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#0a3d2e] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#0f5c44] transition-colors">
            <Camera size={10} className="text-white" />
          </div>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#0a3d2e]">Profile Photo</p>
          <p className="text-[12px] text-[#8a9e96] mt-0.5">Avatar auto-generated from your name</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-[#dde8e3] rounded-[16px] p-5">
        {success && (
          <div className="flex items-center gap-2 bg-[#E1F5EE] border border-[#b2dece] text-[#085041] text-[12px] font-medium px-4 py-3 rounded-[10px] mb-4">
            <CheckCircle2 size={14} /> Profile updated successfully
          </div>
        )}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-3 rounded-[10px] mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Full Name" error={errors.name?.message}>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9e96]" />
              <input {...register("name")} placeholder="John Doe" className={`${inputClass(!!errors.name)} pl-9`} />
            </div>
          </Field>

          <Field label="Email Address" error={undefined}>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9e96]" />
              <input
                value={email}
                disabled
                className="w-full pl-9 px-3.5 py-2.5 text-[13px] text-[#8a9e96] bg-[#f6faf8] border border-[#dde8e3] rounded-[10px] cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-[#8a9e96]">Email cannot be changed</p>
          </Field>

          <Field label="Address (Optional)" error={errors.address?.message}>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9e96]" />
              <input {...register("address")} placeholder="123 Main St, New York" className={`${inputClass(!!errors.address)} pl-9`} />
            </div>
          </Field>

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="cursor-pointer flex items-center justify-center gap-2 py-2.5 bg-[#0a3d2e] hover:bg-[#0f5c44] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-[10px] transition-colors"
          >
            {isSubmitting ? <><Loader2 size={13} className="animate-spin" />Saving...</> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}