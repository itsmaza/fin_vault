"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Layers,
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Send,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  X,
  Menu,
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  PieChart,
  LineChart,
  User,
  Lock,
  Bell,
  Shield,
  Sparkles,
  AlertTriangle,
  Key,
} from "lucide-react"
import { logout } from "@/actions/auth.action"

type ChildItem = {
  label: string
  href: string
  icon: React.ElementType
}

type NavItem = {
  icon: React.ElementType
  label: string
  href?: string
  children?: ChildItem[]
  isLogout?: boolean
  badge?: string
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Sparkles, label: "AI Transaction", href: "/dashboard/ai-transaction", badge: "NEW" },
  {
    icon: CreditCard, label: "Balance", href: "/dashboard/balance",
    children: [
      { label: "Overview", href: "/dashboard/balance", icon: Wallet },
      { label: "Deposits", href: "/dashboard/balance/deposits", icon: ArrowDownLeft },
      { label: "Withdrawals", href: "/dashboard/balance/withdrawals", icon: ArrowUpRight },
    ],
  },
  {
    icon: ArrowLeftRight, label: "Transactions", href: "/dashboard/transactions",
    children: [
      { label: "All Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
      { label: "Sent", href: "/dashboard/transactions/sent", icon: ArrowUpRight },
      { label: "Received", href: "/dashboard/transactions/received", icon: ArrowDownLeft },
    ],
  },
  {
    icon: Send, label: "Send Money", href: "/dashboard/send",
    children: [
      { label: "Quick Send", href: "/dashboard/send", icon: Send },
      { label: "Scheduled", href: "/dashboard/send/scheduled", icon: Clock },
      { label: "Beneficiaries", href: "/dashboard/send/beneficiaries", icon: User },
    ],
  },
  {
    icon: BarChart2, label: "Analytics", href: "/dashboard/analytics",
    children: [
      { label: "Overview", href: "/dashboard/analytics", icon: TrendingUp },
      { label: "Spending", href: "/dashboard/analytics/spending", icon: PieChart },
      { label: "Income", href: "/dashboard/analytics/income", icon: LineChart },
    ],
  },
  {
    icon: Key, label: "API Keys", href: "/dashboard/api-keys",
  },
  {
    icon: Settings, label: "Settings", href: "/dashboard/settings",
    children: [
      { label: "Profile", href: "/dashboard/settings/profile", icon: User },
      { label: "Security", href: "/dashboard/settings/security", icon: Lock },
      { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
      { label: "Privacy", href: "/dashboard/settings/privacy", icon: Shield },
    ],
  },
  { icon: LogOut, label: "Logout", isLogout: true },
]

// ── Animated accordion children wrapper ──────────────────────────────────────
function AccordionChildren({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) setHeight(ref.current.scrollHeight)
  }, [children])

  return (
    <div
      style={{
        overflow: "hidden",
        maxHeight: open ? `${height}px` : "0px",
        transition: "max-height 240ms cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: open ? 1 : 0,
        transitionProperty: "max-height, opacity",
        transitionDuration: "240ms, 200ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1), ease",
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  )
}

// ── Logout modal ──────────────────────────────────────────────────────────────
function LogoutModal({
  open, onCancel, onConfirm, loading,
}: { open: boolean; onCancel: () => void; onConfirm: () => void; loading: boolean }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && open && !loading) onCancel() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ animation: "fadeIn 150ms ease" }}
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-[360px] rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0d4a36 0%, #082e20 100%)",
          border: "1px solid rgba(29,158,117,0.18)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          animation: "scaleIn 180ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.55), transparent)" }} />

        <div className="p-7 flex flex-col gap-5">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-150"
            style={{ background: "rgba(255,255,255,0.06)", color: "#6fa890" }}
          >
            <X size={13} />
          </button>

          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(127,29,29,0.20)",
                border: "1px solid rgba(239,68,68,0.22)",
              }}
            >
              <AlertTriangle size={26} className="text-red-400" />
            </div>
          </div>

          <div className="text-center flex flex-col gap-1.5">
            <h3 className="text-white text-[15.5px] font-semibold tracking-tight">Sign out of FinVault?</h3>
            <p className="text-[#6fa890] text-[12.5px] leading-relaxed">
              Your session will end. Sign in again to access your account.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-[12.5px] font-medium transition-all duration-150 disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#8fbfaa",
              }}
            >
              Stay signed in
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-[12.5px] font-semibold transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: loading ? "rgba(185,28,28,0.7)" : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: "0 4px 14px rgba(185,28,28,0.3)",
              }}
            >
              {loading ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing out…</span></>
              ) : (
                <><LogOut size={13} /><span>Sign out</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.94) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="mx-auto my-2 w-5 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
  return (
    <p className="px-3 pt-4 pb-1 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(111,168,144,0.45)" }}>
      {label}
    </p>
  )
}

// ── Tooltip wrapper for collapsed mode ───────────────────────────────────────
function CollapseTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div
        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 rounded-[7px] text-[11.5px] font-medium whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50"
        style={{
          background: "#0a3d2e",
          color: "#c5e8d8",
          border: "1px solid rgba(29,158,117,0.2)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "#0a3d2e" }} />
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
interface SidebarProps {
  onPrompt?: (text: string) => void
}

export default function Sidebar({ onPrompt }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const toggleMenu = (label: string) => setOpenMenus((p) => ({ ...p, [label]: !p[label] }))

  const isParentActive = (item: NavItem) => {
    if (item.href && pathname === item.href) return true
    return item.children?.some((c) => pathname.startsWith(c.href)) ?? false
  }

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true)
    try { await logout() } catch {}
    finally { setLogoutLoading(false); setShowLogoutModal(false) }
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
    const isCollapsed = !mobile && collapsed
    const mainItems = navItems.filter((i) => !i.isLogout)
    const logoutItem = navItems.find((i) => i.isLogout)!

    const itemClass = (active: boolean, extra = "") =>
      `group flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] w-full text-left cursor-pointer transition-all duration-200 select-none ${active ? "text-white" : "text-[#6fa890] hover:text-white"} ${extra}`

    const itemStyle = (active: boolean): React.CSSProperties =>
      active
        ? { background: "rgba(29,158,117,0.18)", borderLeft: "2px solid rgba(29,158,117,0.7)", paddingLeft: "10px" }
        : { background: "transparent", borderLeft: "2px solid transparent", paddingLeft: "10px" }

    const renderNavItem = (item: NavItem) => {
      const active = isParentActive(item)
      const hasChildren = !!item.children?.length
      const isOpen = openMenus[item.label] ?? active

      const iconEl = (
        <div className={`flex-shrink-0 transition-colors duration-200 ${active ? "text-[#1d9e75]" : "text-[#4a8a70] group-hover:text-[#1d9e75]"}`}>
          <item.icon size={15} strokeWidth={active ? 2.2 : 1.8} />
        </div>
      )

      const labelEl = !isCollapsed && (
        <span className="text-[12px] font-medium whitespace-nowrap flex-1 tracking-wide">{item.label}</span>
      )

      const badgeEl = item.badge && !isCollapsed && (
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(29,158,117,0.2)", color: "#1d9e75", border: "1px solid rgba(29,158,117,0.28)" }}>
          {item.badge}
        </span>
      )

      // Logout
      if (item.isLogout) {
        const btn = (
          <button
            key={item.label}
            onClick={() => { setMobileOpen(false); setShowLogoutModal(true) }}
            className={`group flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] w-full cursor-pointer transition-all duration-200 text-[rgba(111,168,144,0.7)] hover:text-red-300 hover:bg-red-500/10 ${isCollapsed ? "justify-center" : ""}`}
            style={{ border: "1px solid transparent" }}
          >
            <item.icon size={15} strokeWidth={1.8} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-[12px] font-medium whitespace-nowrap tracking-wide">Logout</span>}
          </button>
        )
        return isCollapsed ? <CollapseTooltip key={item.label} label="Logout">{btn}</CollapseTooltip> : btn
      }

      // With children (expanded only)
      if (hasChildren && !isCollapsed) {
        return (
          <div key={item.label}>
            <button
              onClick={() => toggleMenu(item.label)}
              className={itemClass(active)}
              style={itemStyle(active)}
            >
              {iconEl}
              {labelEl}
              {badgeEl}
              <ChevronDown
                size={11}
                className={`flex-shrink-0 transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`}
                style={{ color: "rgba(111,168,144,0.45)" }}
              />
            </button>

            <AccordionChildren open={isOpen}>
              <div className="mt-0.5 mb-1 ml-[16px] pl-4" style={{ borderLeft: "1.5px solid rgba(29,158,117,0.13)" }}>
                {item.children!.map((child) => {
                  const childActive = pathname === child.href
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={`group flex items-center gap-2 px-2.5 py-[7px] rounded-[8px] transition-all duration-150 cursor-pointer ${childActive ? "text-white" : "text-[#4e8c6e] hover:text-[#aad5bf]"}`}
                      style={childActive ? { background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.14)" } : { border: "1px solid transparent" }}
                    >
                      <div className={`flex-shrink-0 transition-colors duration-150 ${childActive ? "text-[#1d9e75]" : "group-hover:text-[#1d9e75]"}`}>
                        <child.icon size={11} strokeWidth={childActive ? 2.2 : 1.8} />
                      </div>
                      <span className="text-[11.5px] font-medium whitespace-nowrap flex-1 tracking-wide">{child.label}</span>
                      {childActive && (
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#1d9e75", boxShadow: "0 0 5px rgba(29,158,117,0.7)" }} />
                      )}
                    </Link>
                  )
                })}
              </div>
            </AccordionChildren>
          </div>
        )
      }

      // Simple link
      const linkEl = (
        <Link
          key={item.label}
          href={item.href ?? "#"}
          onClick={() => { setMobileOpen(false); if (isCollapsed && hasChildren) toggleMenu(item.label) }}
          className={`${itemClass(active)} ${isCollapsed ? "justify-center" : ""}`}
          style={itemStyle(active)}
        >
          {iconEl}
          {labelEl}
          {badgeEl}
        </Link>
      )

      return isCollapsed ? <CollapseTooltip key={item.label} label={item.label}>{linkEl}</CollapseTooltip> : linkEl
    }

    return (
      <div
        className="flex flex-col h-full"
        style={{
          width: isCollapsed ? "68px" : "252px",
          transition: "width 280ms cubic-bezier(0.4, 0, 0.2, 1)",
          background: "linear-gradient(180deg, #0c4433 0%, #082d1f 100%)",
          borderRight: "1px solid rgba(29,158,117,0.09)",
        }}
      >
        {/* Logo */}
        <div
          className="flex-shrink-0"
          style={{
            padding: isCollapsed ? "14px 10px" : "16px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.055)",
            transition: "padding 280ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-[10px]"
              style={{
                width: 34, height: 34,
                background: "linear-gradient(135deg, #1d9e75 0%, #0d6b4d 100%)",
                boxShadow: "0 3px 12px rgba(29,158,117,0.3)",
              }}
            >
              <Layers size={15} className="text-white" strokeWidth={2} />
            </div>
            {!isCollapsed && (
              <div style={{ overflow: "hidden" }}>
                <span className="text-white text-[17px] font-bold leading-none block" style={{ fontFamily: "'Fraunces', serif", letterSpacing: "-0.3px" }}>
                  FinVault
                </span>
                <p className="text-[10px] mt-0.5 whitespace-nowrap" style={{ color: "rgba(111,168,144,0.6)", letterSpacing: "0.04em" }}>
                  Personal Finance
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle — desktop only */}
        {!mobile && (
          <div className="flex justify-end px-2 pt-2.5 pb-0.5 flex-shrink-0">
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand" : "Collapse"}
              className="w-6 h-6 flex items-center justify-center rounded-[7px] transition-all duration-150"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(111,168,144,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(29,158,117,0.14)"; el.style.color = "#1d9e75" }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.05)"; el.style.color = "rgba(111,168,144,0.55)" }}
            >
              <ChevronLeft size={12} style={{ transition: "transform 280ms cubic-bezier(0.4,0,0.2,1)", transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <SectionLabel label="Main" collapsed={isCollapsed} />
          <div className="flex flex-col gap-[1px]">
            {mainItems.slice(0, 2).map(renderNavItem)}
          </div>

          <SectionLabel label="Finance" collapsed={isCollapsed} />
          <div className="flex flex-col gap-[1px]">
            {mainItems.slice(2, 5).map(renderNavItem)}
          </div>

          <SectionLabel label="Developer" collapsed={isCollapsed} />
          <div className="flex flex-col gap-[1px]">
            {mainItems.slice(5, 6).map(renderNavItem)}
          </div>

          <SectionLabel label="Account" collapsed={isCollapsed} />
          <div className="flex flex-col gap-[1px]">
            {mainItems.slice(6).map(renderNavItem)}
          </div>

          <div className="flex-1" />

          <div className="mt-2 mb-1">
            {renderNavItem(logoutItem)}
          </div>
        </nav>

        {/* Divider */}
        <div className="mx-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }} />

        {/* User card */}
        <div
          className={`flex items-center gap-2.5 mx-1 mb-1 mt-1 rounded-[10px] overflow-hidden cursor-pointer transition-all duration-150 flex-shrink-0 ${isCollapsed ? "justify-center px-2 py-2.5" : "px-2.5 py-2.5"}`}
          style={{ border: "1px solid transparent" }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.045)"; el.style.borderColor = "rgba(255,255,255,0.055)" }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.borderColor = "transparent" }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ width: 32, height: 32, background: "linear-gradient(135deg, #1d9e75 0%, #0d6b4d 100%)", boxShadow: "0 0 0 2px rgba(29,158,117,0.22), 0 0 10px rgba(29,158,117,0.15)" }}
          >
            MA
          </div>
          {!isCollapsed && (
            <>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white truncate whitespace-nowrap">Mazaharul</p>
                <p className="text-[10.5px] whitespace-nowrap" style={{ color: "rgba(111,168,144,0.58)" }}>Free plan</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#1d9e75", boxShadow: "0 0 5px rgba(29,158,117,0.7)" }} />
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex h-screen sticky top-0 flex-shrink-0" style={{ overflow: "visible" }}>
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 w-8 h-8 flex items-center justify-center text-white rounded-[9px] transition-all duration-150"
        style={{ background: "linear-gradient(135deg, #0c4433 0%, #082d1f 100%)", border: "1px solid rgba(29,158,117,0.2)", boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }}
      >
        <Menu size={15} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} style={{ animation: "fadeIn 150ms ease" }} />
          <div className="relative z-10 h-full shadow-2xl" style={{ animation: "slideIn 220ms cubic-bezier(0.34, 1.1, 0.64, 1)" }}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-[-38px] w-7 h-7 flex items-center justify-center rounded-full text-white"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <X size={13} />
            </button>
            <SidebarContent mobile />
          </div>
        </div>
      )}

      <LogoutModal
        open={showLogoutModal}
        onCancel={() => !logoutLoading && setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        loading={logoutLoading}
      />

     
    </>
  )
}