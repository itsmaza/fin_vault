"use client"

import Link from "next/link"
import { useState } from "react"
import { Layers, Menu, X } from "lucide-react"

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e8efeb]">
      <nav className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0a3d2e] rounded-[9px] flex items-center justify-center">
            <Layers size={15} className="text-[#5DCAA5]" />
          </div>
          <span
            className="text-[#0a3d2e] text-[17px] font-bold tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            FinVault
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-7">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Security", href: "#security" },
            { label: "About", href: "#about" },
          ].map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-[13px] font-medium text-[#4a6358] hover:text-[#0a3d2e] transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-[13px] font-semibold text-[#0a3d2e] border border-[#c8ddd4] rounded-[8px] hover:bg-[#f6faf8] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-[13px] font-semibold text-white bg-[#0a3d2e] rounded-[8px] hover:bg-[#0f5c44] transition-colors"
          >
            Get started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[#0a3d2e]"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#e8efeb] px-6 py-4 flex flex-col gap-4">
          {["Features", "How it works", "Security", "About"].map((label) => (
            <Link
              key={label}
              href={`#${label.toLowerCase().replace(" ", "-")}`}
              onClick={() => setMobileOpen(false)}
              className="text-[14px] font-medium text-[#4a6358]"
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#e8efeb]">
            <Link href="/login" className="text-center py-2.5 border border-[#c8ddd4] rounded-[8px] text-[13px] font-semibold text-[#0a3d2e]">
              Sign in
            </Link>
            <Link href="/register" className="text-center py-2.5 bg-[#0a3d2e] rounded-[8px] text-[13px] font-semibold text-white">
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}