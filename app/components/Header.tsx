"use client"

import Link from "next/link"
import { useState, useCallback, memo } from "react"
import { Layers, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"

const NAV_LINKS = [
  { label: "Features",     href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Security",     href: "#security" },
  { label: "About",        href: "#about" },
] as const

interface HeaderProps {
  isLoggedIn: boolean
}

// Auth buttons extracted so they don't re-render on mobile toggle
const AuthButtons = memo(function AuthButtons({
  isLoggedIn, onDashboard, className = "",
}: { isLoggedIn: boolean; onDashboard: () => void; className?: string }) {
  if (isLoggedIn) {
    return (
      <button
        onClick={onDashboard}
        className={`px-4 py-2 text-[13px] font-semibold text-white bg-[#0a3d2e] rounded-[8px] hover:bg-[#0f5c44] active:scale-[.98] transition-colors ${className}`}
      >
        Go to Dashboard
      </button>
    )
  }
  return (
    <>
      <Link
        href="/login"
        className={`px-4 py-2 text-[13px] font-semibold text-[#0a3d2e] border border-[#c8ddd4] rounded-[8px] hover:bg-[#f6faf8] active:scale-[.98] transition-colors ${className}`}
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className={`px-4 py-2 text-[13px] font-semibold text-white bg-[#0a3d2e] rounded-[8px] hover:bg-[#0f5c44] active:scale-[.98] transition-colors ${className}`}
      >
        Get started
      </Link>
    </>
  )
})

export default function Header({ isLoggedIn }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  const handleDashboard = useCallback(() => router.push("/dashboard"), [router])
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const toggleMobile = useCallback(() => setMobileOpen(o => !o), [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e8efeb]">
      <nav className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-[#0a3d2e] rounded-[9px] flex items-center justify-center">
            <Layers size={15} className="text-[#5DCAA5]" strokeWidth={2} />
          </div>
          <span
            className="text-[#0a3d2e] text-[17px] font-bold tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            FinVault
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-7" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="text-[13px] font-medium text-[#4a6358] hover:text-[#0a3d2e] transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-3">
          <AuthButtons isLoggedIn={isLoggedIn} onDashboard={handleDashboard} />
        </div>

        {/* Mobile toggle */}
        <button
          onClick={toggleMobile}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="md:hidden p-2 text-[#0a3d2e] rounded-[7px] hover:bg-[#f0f7f4] transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile dropdown — CSS-driven, no layout shift */}
      <div
        className="md:hidden overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out"
        style={{
          maxHeight: mobileOpen ? "320px" : "0px",
          opacity: mobileOpen ? 1 : 0,
        }}
      >
        <div className="bg-white border-t border-[#e8efeb] px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={closeMobile}
              className="text-[14px] font-medium text-[#4a6358] hover:text-[#0a3d2e] transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#e8efeb]">
            <AuthButtons
              isLoggedIn={isLoggedIn}
              onDashboard={handleDashboard}
              className="text-center justify-center w-full py-2.5"
            />
          </div>
        </div>
      </div>
    </header>
  )
}