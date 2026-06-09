"use client"

import { useState } from "react"
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
  prompt?: string | null
  children?: ChildItem[]
  isLogout?: boolean
  badge?: string
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Sparkles,
    label: "AI Transaction",
    href: "/dashboard/ai-transaction",
    badge: "NEW",
  },
  {
    icon: CreditCard,
    label: "Balance",
    href: "/dashboard/balance",
    children: [
      { label: "Overview", href: "/dashboard/balance", icon: Wallet },
      { label: "Deposits", href: "/dashboard/balance/deposits", icon: ArrowDownLeft },
      { label: "Withdrawals", href: "/dashboard/balance/withdrawals", icon: ArrowUpRight },
    ],
  },
  {
    icon: ArrowLeftRight,
    label: "Transactions",
    href: "/dashboard/transactions",
    children: [
      { label: "All Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
      { label: "Sent", href: "/dashboard/transactions/sent", icon: ArrowUpRight },
      { label: "Received", href: "/dashboard/transactions/received", icon: ArrowDownLeft },
    ],
  },
  {
    icon: Send,
    label: "Send Money",
    href: "/dashboard/send",
    children: [
      { label: "Quick Send", href: "/dashboard/send", icon: Send },
      { label: "Scheduled", href: "/dashboard/send/scheduled", icon: Clock },
      { label: "Beneficiaries", href: "/dashboard/send/beneficiaries", icon: User },
    ],
  },
  {
    icon: BarChart2,
    label: "Analytics",
    href: "/dashboard/analytics",
    children: [
      { label: "Overview", href: "/dashboard/analytics", icon: TrendingUp },
      { label: "Spending", href: "/dashboard/analytics/spending", icon: PieChart },
      { label: "Income", href: "/dashboard/analytics/income", icon: LineChart },
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
    children: [
      { label: "Profile", href: "/dashboard/settings/profile", icon: User },
      { label: "Security", href: "/dashboard/settings/security", icon: Lock },
      { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
      { label: "Privacy", href: "/dashboard/settings/privacy", icon: Shield },
    ],
  },
  {
    icon: LogOut,
    label: "Logout",
    isLogout: true,
  },
]

// ─── Logout Confirmation Modal ────────────────────────────────────────────────
function LogoutModal({
  open,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Layered backdrop for depth */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-[360px] rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0d4a36 0%, #082e20 100%)",
          border: "1px solid rgba(29,158,117,0.18)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)" }} />

        <div className="p-7 flex flex-col gap-6">
          {/* Close button */}
          <button
            onClick={onCancel}
            className="cursor-pointer absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-[#6fa890] hover:text-white transition-colors duration-150"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <X size={13} />
          </button>

          {/* Icon with glow */}
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 50% 30%, rgba(239,68,68,0.22) 0%, rgba(127,29,29,0.18) 100%)",
                border: "1px solid rgba(239,68,68,0.22)",
                boxShadow: "0 0 28px rgba(239,68,68,0.15)",
              }}
            >
              <AlertTriangle size={26} className="text-red-400" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center flex flex-col gap-2">
            <h3 className="text-white text-[16px] font-semibold tracking-tight">
              Sign out of FinVault?
            </h3>
            <p className="text-[#6fa890] text-[12.5px] leading-relaxed">
              Your session will end. You'll need to sign in again to access your account.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl text-[#8fbfaa] hover:text-white text-[12.5px] font-medium transition-all duration-150 disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Stay signed in
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl text-white text-[12.5px] font-semibold transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: loading
                  ? "rgba(185,28,28,0.7)"
                  : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: "0 4px 16px rgba(185,28,28,0.35)",
              }}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing out…</span>
                </>
              ) : (
                <>
                  <LogOut size={13} />
                  <span>Sign out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="mx-auto my-2 w-5 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
  return (
    <p
      className="px-3 pt-4 pb-1 text-[9.5px] font-semibold uppercase tracking-[0.12em]"
      style={{ color: "rgba(111,168,144,0.5)" }}
    >
      {label}
    </p>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
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

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const isParentActive = (item: NavItem) => {
    if (item.href && pathname === item.href) return true
    return item.children?.some((c) => pathname.startsWith(c.href)) ?? false
  }

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true)
    try {
      await logout()
    } catch {
      // logout action redirects itself
    } finally {
      setLogoutLoading(false)
      setShowLogoutModal(false)
    }
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
    const isCollapsed = !mobile && collapsed

    // Group items for section labels
    const mainItems = navItems.filter((i) => !i.isLogout)
    const logoutItem = navItems.find((i) => i.isLogout)!

    const renderNavItem = (item: NavItem) => {
      const active = isParentActive(item)
      const hasChildren = !!item.children?.length
      const isOpen = openMenus[item.label] ?? active

      return (
        <div key={item.label}>
          {/* Parent row */}
          {hasChildren && !isCollapsed ? (
            <button
              onClick={() => toggleMenu(item.label)}
              className={`cursor-pointer group flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] w-full text-left transition-all duration-150 ${
                active
                  ? "text-white"
                  : "text-[#6fa890] hover:text-white"
              }`}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(29,158,117,0.22) 0%, rgba(29,158,117,0.10) 100%)",
                      border: "1px solid rgba(29,158,117,0.20)",
                    }
                  : {
                      background: "transparent",
                      border: "1px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"
              }}
            >
              <div
                className={`flex-shrink-0 transition-all duration-150 ${
                  active ? "text-[#1d9e75]" : "group-hover:text-[#1d9e75]"
                }`}
              >
                <item.icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              </div>
              <span className="text-[12px] font-medium whitespace-nowrap flex-1 tracking-wide">
                {item.label}
              </span>
              {item.badge && (
                <span
                  className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full mr-1"
                  style={{
                    background: "rgba(29,158,117,0.25)",
                    color: "#1d9e75",
                    border: "1px solid rgba(29,158,117,0.3)",
                  }}
                >
                  {item.badge}
                </span>
              )}
              <ChevronDown
                size={11}
                className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                style={{ color: "rgba(111,168,144,0.5)" }}
              />
            </button>
          ) : item.isLogout ? (
            <button
              onClick={() => {
                setMobileOpen(false)
                setShowLogoutModal(true)
              }}
              title={isCollapsed ? "Sign out" : undefined}
              className={`cursor-pointer group flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] w-full transition-all duration-200 ${
                isCollapsed ? "justify-center" : ""
              }`}
              style={{
                color: "rgba(111,168,144,0.75)",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = "rgba(239,68,68,0.1)"
                el.style.borderColor = "rgba(239,68,68,0.15)"
                el.style.color = "rgb(252,165,165)"
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = "transparent"
                el.style.borderColor = "transparent"
                el.style.color = "rgba(111,168,144,0.75)"
              }}
            >
              <item.icon size={15} strokeWidth={1.8} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-[12px] font-medium whitespace-nowrap flex-1 tracking-wide">
                  {item.label}
                </span>
              )}
            </button>
          ) : (
            <Link
              href={item.href ?? "#"}
              onClick={() => {
                setMobileOpen(false)
                if (isCollapsed && hasChildren) toggleMenu(item.label)
              }}
              title={isCollapsed ? item.label : undefined}
              className={`cursor-pointer group flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] w-full transition-all duration-150 ${
                active ? "text-white" : "text-[#6fa890] hover:text-white"
              } ${isCollapsed ? "justify-center" : ""}`}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(29,158,117,0.22) 0%, rgba(29,158,117,0.10) 100%)",
                      border: "1px solid rgba(29,158,117,0.20)",
                    }
                  : { border: "1px solid transparent" }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"
              }}
            >
              <div
                className={`flex-shrink-0 transition-all duration-150 ${
                  active ? "text-[#1d9e75]" : "group-hover:text-[#1d9e75]"
                }`}
              >
                <item.icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              </div>
              {!isCollapsed && (
                <>
                  <span className="text-[12px] font-medium whitespace-nowrap flex-1 tracking-wide">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(29,158,117,0.25)",
                        color: "#1d9e75",
                        border: "1px solid rgba(29,158,117,0.3)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )}

          {/* Children */}
          {hasChildren && !isCollapsed && isOpen && (
            <div className="mt-0.5 mb-1 ml-[14px] flex flex-col gap-[1px]">
              {/* Connector line container */}
              <div className="relative pl-4" style={{ borderLeft: "1.5px solid rgba(29,158,117,0.15)" }}>
                {item.children!.map((child) => {
                  const childActive = pathname === child.href
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={`cursor-pointer group flex items-center gap-2 px-2.5 py-[7px] rounded-[8px] transition-all duration-150 ${
                        childActive ? "text-white" : "text-[#5a9a80] hover:text-[#a8d5bf]"
                      }`}
                      style={
                        childActive
                          ? {
                              background: "rgba(29,158,117,0.13)",
                              border: "1px solid rgba(29,158,117,0.15)",
                            }
                          : { border: "1px solid transparent" }
                      }
                      onMouseEnter={(e) => {
                        if (!childActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"
                      }}
                      onMouseLeave={(e) => {
                        if (!childActive) (e.currentTarget as HTMLElement).style.background = "transparent"
                      }}
                    >
                      <div
                        className={`flex-shrink-0 transition-colors duration-150 ${
                          childActive ? "text-[#1d9e75]" : "group-hover:text-[#1d9e75]"
                        }`}
                      >
                        <child.icon size={11} strokeWidth={childActive ? 2.2 : 1.8} />
                      </div>
                      <span className="text-[11.5px] font-medium whitespace-nowrap tracking-wide flex-1">
                        {child.label}
                      </span>
                      {childActive && (
                        <div
                          className="w-1 h-1 rounded-full flex-shrink-0"
                          style={{ background: "#1d9e75", boxShadow: "0 0 6px rgba(29,158,117,0.8)" }}
                        />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        className={`flex flex-col h-full transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[68px]" : "w-[236px]"
        }`}
        style={{
          background: "linear-gradient(180deg, #0c4433 0%, #082d1f 100%)",
          borderRight: "1px solid rgba(29,158,117,0.10)",
        }}
      >
        {/* Logo */}
        <div
          className={`transition-all duration-300 ${isCollapsed ? "px-3 py-4" : "px-4 py-[18px]"}`}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo mark with gradient */}
            <div
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #1d9e75 0%, #0d6b4d 100%)",
                boxShadow: "0 4px 14px rgba(29,158,117,0.35), 0 0 0 1px rgba(29,158,117,0.2) inset",
              }}
            >
              <Layers size={15} className="text-white" strokeWidth={2} />
            </div>
            {!isCollapsed && (
              <div>
                <span
                  className="text-white text-[17px] font-bold whitespace-nowrap leading-none"
                  style={{ fontFamily: "'Fraunces', serif", letterSpacing: "-0.3px" }}
                >
                  FinVault
                </span>
                <p
                  className="text-[10px] whitespace-nowrap mt-0.5"
                  style={{ color: "rgba(111,168,144,0.65)", letterSpacing: "0.04em" }}
                >
                  Personal Finance
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle — desktop only */}
        {!mobile && (
          <div className="flex justify-end px-2.5 pt-3 pb-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-[6px] transition-all duration-150"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(111,168,144,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = "rgba(29,158,117,0.15)"
                el.style.color = "#1d9e75"
                el.style.borderColor = "rgba(29,158,117,0.2)"
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = "rgba(255,255,255,0.05)"
                el.style.color = "rgba(111,168,144,0.6)"
                el.style.borderColor = "rgba(255,255,255,0.06)"
              }}
            >
              <ChevronLeft
                size={12}
                className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-1 flex flex-col overflow-y-auto scrollbar-none">
          {/* Main section label */}
          <SectionLabel label="Main" collapsed={isCollapsed} />

          {/* Dashboard + AI Transaction */}
          <div className="flex flex-col gap-[2px]">
            {mainItems.slice(0, 2).map(renderNavItem)}
          </div>

          {/* Finance section */}
          <SectionLabel label="Finance" collapsed={isCollapsed} />
          <div className="flex flex-col gap-[2px]">
            {mainItems.slice(2, 5).map(renderNavItem)}
          </div>

          {/* Account section */}
          <SectionLabel label="Account" collapsed={isCollapsed} />
          <div className="flex flex-col gap-[2px]">
            {mainItems.slice(5).map(renderNavItem)}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Logout at bottom of nav, above user */}
          <div className="mt-2 mb-1">
            {renderNavItem(logoutItem)}
          </div>
        </nav>

        {/* Divider */}
        <div className="mx-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

        {/* User info */}
        <div
          className={`px-2 py-2.5 flex items-center gap-2.5 overflow-hidden cursor-pointer transition-all duration-150 mx-1 mb-1 rounded-[10px] ${
            isCollapsed ? "justify-center" : ""
          }`}
          style={{ border: "1px solid transparent" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = "rgba(255,255,255,0.05)"
            el.style.borderColor = "rgba(255,255,255,0.06)"
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = "transparent"
            el.style.borderColor = "transparent"
          }}
        >
          {/* Avatar with ring glow */}
          <div
            className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #1d9e75 0%, #0d6b4d 100%)",
              boxShadow: "0 0 0 2px rgba(29,158,117,0.25), 0 0 12px rgba(29,158,117,0.2)",
            }}
          >
            MA
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white whitespace-nowrap truncate">Mazaharul</p>
              <p className="text-[10.5px] whitespace-nowrap" style={{ color: "rgba(111,168,144,0.6)" }}>
                Free plan
              </p>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#1d9e75", boxShadow: "0 0 6px rgba(29,158,117,0.8)" }}
                title="Online"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="cursor-pointer lg:hidden fixed top-3.5 left-4 z-50 w-8 h-8 flex items-center justify-center text-white rounded-[9px] transition-all duration-150 shadow-lg"
        style={{
          background: "linear-gradient(135deg, #0c4433 0%, #082d1f 100%)",
          border: "1px solid rgba(29,158,117,0.2)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        }}
      >
        <Menu size={15} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="cursor-pointer absolute top-4 right-[-38px] w-7 h-7 flex items-center justify-center rounded-full text-white transition-colors duration-150"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <X size={13} />
            </button>
            <SidebarContent mobile />
          </div>
        </div>
      )}

      {/* Logout modal */}
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => !logoutLoading && setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        loading={logoutLoading}
      />
    </>
  )
}