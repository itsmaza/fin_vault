import type { Metadata } from "next"
import Sidebar from "./components/Sidebar"

export const metadata: Metadata = {
  title: "FinVault — AI Banking",
  description: "AI-powered conversational fintech dashboard",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#061f17] font-sans antialiased">
      {/* Sidebar — sticky, full height */}
      <Sidebar />

      {/* Main content — scrollable */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}