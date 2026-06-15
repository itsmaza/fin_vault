// app/layout.tsx
import type { Metadata } from "next"
import { Sora, Inter } from "next/font/google"
import "./globals.css"

const sora = Sora({
  subsets:  ["latin"],
  weight:   ["400", "600", "700"],
  variable: "--font-display",
  display:  "swap",
})

const inter = Inter({
  subsets:  ["latin"],
  weight:   ["400", "500", "600"],
  variable: "--font-sans",
  display:  "swap",
})

export const metadata: Metadata = {
  title: {
    default:  "FinVault — AI Banking",
    template: "%s | FinVault",
  },
  description:
    "FinVault is an AI-powered banking dashboard. Send money, track transactions, and manage your finances with ease.",
  keywords: ["banking", "fintech", "AI banking", "send money", "transactions", "finance dashboard"],
  authors:  [{ name: "FinVault" }],
  creator:  "FinVault",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://finvault.app"
  ),
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         process.env.NEXT_PUBLIC_APP_URL ?? "https://finvault.app",
    siteName:    "FinVault",
    title:       "FinVault — AI Banking",
    description: "AI-powered banking dashboard. Send money, track transactions, and manage your finances.",
    images: [{
      url:    "/og-image.png",
      width:  1200,
      height: 630,
      alt:    "FinVault — AI Banking",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "FinVault — AI Banking",
    description: "AI-powered banking dashboard. Send money, track transactions, and manage your finances.",
    images:      ["/og-image.png"],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-[#f6faf8]">
        {children}
      </body>
    </html>
  )
}