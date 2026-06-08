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
      { label: "All", href: "/dashboard/transactions", icon: ArrowLeftRight },
      { label: "Sent", href: "/dashboard/transactions/sent", icon: ArrowUpRight },
      { label: "Received", href: "/dashboard/transactions/received", icon: ArrowDownLeft },
      { label: "History", href: "/dashboard/transactions/history", icon: Clock },
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
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-[340px] bg-[#0a3d2e] border border-white/[0.10] rounded-2xl shadow-2xl shadow-black/60 p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="cursor-pointer absolute top-3.5 right-3.5 w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-[#6fa890] hover:text-white transition-all duration-150"
        >
          <X size={13} />
        </button>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-red-900/30 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-900/20">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center flex flex-col gap-1.5">
          <h3 className="text-white text-[15px] font-semibold tracking-tight">
            Are you sure you want to logout?
          </h3>
          <p className="text-[#6fa890] text-[12px] leading-relaxed">
            You will need to login again to access your account and data.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="cursor-pointer flex-1 px-4 py-2.5 rounded-[10px] bg-white/[0.07] hover:bg-white/[0.13] text-[#6fa890] hover:text-white text-[12px] font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="cursor-pointer flex-1 px-4 py-2.5 rounded-[10px] bg-red-600/80 hover:bg-red-600 active:bg-red-700 text-white text-[12px] font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Logging out…</span>
              </>
            ) : (
              <>
                <LogOut size={13} />
                <span>Yes, Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
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

  // Logout modal state
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
      // logout action নিজেই redirect করবে, এরর সাধারণত আসবে না
    } finally {
      setLogoutLoading(false)
      setShowLogoutModal(false)
    }
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
    const isCollapsed = !mobile && collapsed

    return (
      <div
        className={`flex flex-col h-full bg-[#0a3d2e] transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[64px]" : "w-[230px]"
        }`}
      >
        {/* Logo */}
        <div className={`border-b border-white/[0.07] transition-all duration-300 ${isCollapsed ? "px-3 py-4" : "px-4 py-4"}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-[32px] h-[32px] bg-[#1d9e75] rounded-[9px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#1d9e75]/20">
              <Layers size={15} className="text-white" />
            </div>
            {!isCollapsed && (
              <span
                className="text-white text-[16px] font-bold whitespace-nowrap tracking-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                FinVault
              </span>
            )}
          </div>
        </div>

        {/* Collapse toggle — desktop only */}
        {!mobile && (
          <div className="flex justify-end px-2 pt-2 pb-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="cursor-pointer w-7 h-7 flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.14] active:bg-white/[0.2] rounded-[7px] text-[#6fa890] hover:text-white transition-all duration-150 group"
            >
              <ChevronLeft
                size={13}
                className={`transition-transform duration-300 group-hover:scale-110 ${collapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-1 flex flex-col gap-[2px] overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const active = isParentActive(item)
            const hasChildren = !!item.children?.length
            const isOpen = openMenus[item.label] ?? active

            return (
              <div key={item.label}>
                {/* Parent row */}
                {hasChildren && !isCollapsed ? (
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`cursor-pointer group flex items-center gap-2.5 px-2.5 py-[9px] rounded-[9px] w-full text-left transition-all duration-150 ${
                      active
                        ? "bg-white/[0.13] text-white"
                        : "text-[#6fa890] hover:bg-white/[0.08] hover:text-white active:bg-white/[0.16]"
                    }`}
                  >
                    <div className={`flex-shrink-0 transition-all duration-150 ${active ? "text-[#1d9e75]" : "group-hover:text-[#1d9e75]"}`}>
                      <item.icon size={15} />
                    </div>
                    <span className="text-[12px] font-medium whitespace-nowrap flex-1 tracking-wide">
                      {item.label}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`flex-shrink-0 transition-transform duration-200 opacity-60 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                ) : item.isLogout ? (
                  // ── Logout button (modal trigger) ──
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      setShowLogoutModal(true)
                    }}
                    title={isCollapsed ? "Logout" : undefined}
                    className={`cursor-pointer group flex items-center gap-2.5 px-2.5 py-[9px] rounded-[9px] w-full transition-all duration-150 text-[#6fa890] hover:bg-red-900/25 hover:text-red-300 active:bg-red-900/40 ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 transition-all duration-150 group-hover:text-red-300">
                      <item.icon size={15} />
                    </div>
                    {!isCollapsed && (
                      <span className="text-[12px] font-medium whitespace-nowrap flex-1 tracking-wide">
                        {item.label}
                      </span>
                    )}
                  </button>
                ) : (
                  // ── Regular link ──
                  <Link
                    href={item.href ?? "#"}
                    onClick={() => {
                      setMobileOpen(false)
                      if (isCollapsed && hasChildren) toggleMenu(item.label)
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`cursor-pointer group flex items-center gap-2.5 px-2.5 py-[9px] rounded-[9px] w-full transition-all duration-150 ${
                      active
                        ? "bg-white/[0.13] text-white"
                        : "text-[#6fa890] hover:bg-white/[0.08] hover:text-white active:bg-white/[0.16]"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <div
                      className={`flex-shrink-0 transition-all duration-150 ${
                        active ? "text-[#1d9e75]" : "group-hover:text-[#1d9e75]"
                      }`}
                    >
                      <item.icon size={15} />
                    </div>
                    {!isCollapsed && (
                      <span className="text-[12px] font-medium whitespace-nowrap flex-1 tracking-wide">
                        {item.label}
                      </span>
                    )}
                  </Link>
                )}

                {/* Children */}
                {hasChildren && !isCollapsed && isOpen && (
                  <div className="ml-[30px] mt-[2px] mb-[2px] flex flex-col gap-[2px] border-l-2 border-[#1d9e75]/20 pl-3">
                    {item.children!.map((child) => {
                      const childActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={`cursor-pointer group flex items-center gap-2 px-2 py-[7px] rounded-[7px] transition-all duration-150 ${
                            childActive
                              ? "bg-[#1d9e75]/15 text-white"
                              : "text-[#6fa890] hover:bg-white/[0.07] hover:text-white active:bg-white/[0.14]"
                          }`}
                        >
                          <div className={`flex-shrink-0 transition-colors duration-150 ${childActive ? "text-[#1d9e75]" : "group-hover:text-[#1d9e75]"}`}>
                            <child.icon size={12} />
                          </div>
                          <span className="text-[11px] font-medium whitespace-nowrap tracking-wide">
                            {child.label}
                          </span>
                          {childActive && (
                            <div className="ml-auto w-1 h-1 rounded-full bg-[#1d9e75]" />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-white/[0.07]" />

        {/* User info */}
        <div
          className={`px-3 py-3 flex items-center gap-2.5 overflow-hidden cursor-pointer group hover:bg-white/[0.05] transition-colors duration-150 rounded-[9px] mx-1 mb-1 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-[32px] h-[32px] rounded-full bg-[#1d9e75] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ring-2 ring-[#1d9e75]/30 group-hover:ring-[#1d9e75]/60 transition-all duration-150">
            MA
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-[11px] font-semibold text-white whitespace-nowrap">Mazaharul</p>
              <p className="text-[10px] text-[#6fa890] whitespace-nowrap">Free account</p>
            </div>
          )}
          {!isCollapsed && (
            <div className="w-1.5 h-1.5 rounded-full bg-[#1d9e75] flex-shrink-0" title="Online" />
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
        className="cursor-pointer lg:hidden fixed top-3.5 left-4 z-50 w-8 h-8 flex items-center justify-center bg-[#0a3d2e] hover:bg-[#0f5c44] text-white rounded-[8px] transition-colors duration-150 shadow-lg"
      >
        <Menu size={15} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full">
            <button
              onClick={() => setMobileOpen(false)}
              className="cursor-pointer absolute top-4 right-[-36px] w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors duration-150"
            >
              <X size={13} />
            </button>
            <SidebarContent mobile />
          </div>
        </div>
      )}

      {/* Logout confirmation modal — rendered at root level (above everything) */}
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => !logoutLoading && setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        loading={logoutLoading}
      />
    </>
  )
}