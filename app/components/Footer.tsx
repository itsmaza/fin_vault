import Link from "next/link"
import { Layers } from "lucide-react"

const footerLinks = {
  Product: ["Features", "Security", "Pricing", "Changelog"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy", "Terms", "Cookies"],
}

export default function Footer() {
  return (
    <footer className="bg-[#061f17]">
      <div className="max-w-[1100px] mx-auto px-6 pt-14 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-[#1d9e75] rounded-[9px] flex items-center justify-center">
                <Layers size={15} className="text-white" />
              </div>
              <span
                className="text-white text-[17px] font-bold tracking-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                FinVault
              </span>
            </Link>
            <p className="text-[13px] text-[#4a6358] leading-relaxed">
              AI-powered banking for everyday Bangladeshis. Fast, secure, and intelligent.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([col, links]) => (
            <div key={col}>
              <h4 className="text-[11px] font-semibold text-[#6fa890] uppercase tracking-[0.6px] mb-4">
                {col}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-[13px] text-[#4a6358] hover:text-[#5DCAA5] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#0f3828] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#2a4a3a]">
            © {new Date().getFullYear()} FinVault. All rights reserved.
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <Link key={l} href="#" className="text-[12px] text-[#2a4a3a] hover:text-[#4a6358] transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}