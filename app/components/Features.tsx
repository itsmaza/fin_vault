import {
  Shield,
  Zap,
  MessageSquare,
  BarChart2,
  Monitor,
  FileText,
} from "lucide-react"

const features = [
  {
    icon: Shield,
    iconBg: "#E1F5EE",
    iconColor: "#0F6E56",
    title: "Bank-grade security",
    desc: "JWT auth, 4-digit passcode, rate limiting, and human-in-the-loop confirmations before every transaction.",
  },
  {
    icon: Zap,
    iconBg: "#FAEEDA",
    iconColor: "#854F0B",
    title: "Real-time transfers",
    desc: "Instant money transfers with live balance updates and complete audit logs for every action.",
  },
  {
    icon: MessageSquare,
    iconBg: "#E6F1FB",
    iconColor: "#185FA5",
    title: "AI chat interface",
    desc: "Type naturally — \"Send  $500 to Rahim\" — and the AI handles everything else automatically.",
  },
  {
    icon: BarChart2,
    iconBg: "#EEEDFE",
    iconColor: "#534AB7",
    title: "Spending analytics",
    desc: "Ask \"How much did I spend last month?\" and get an instant AI-powered breakdown of your finances.",
  },
  {
    icon: Monitor,
    iconBg: "#FCEBEB",
    iconColor: "#A32D2D",
    title: "Multi-device access",
    desc: "Secure access from any device. Your session stays protected with token-based authentication.",
  },
  {
    icon: FileText,
    iconBg: "#E1F5EE",
    iconColor: "#0F6E56",
    title: "Transaction history",
    desc: "Full filterable history with smart categorization, date ranges, and export options.",
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-[#f6faf8] border-t border-b border-[#e8efeb]">
      <div className="max-w-[1100px] mx-auto px-6 py-20">

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-block bg-[#E1F5EE] text-[#085041] text-[11px] font-semibold px-3 py-1.5 rounded-full mb-3 tracking-wide">
              Features
            </div>
            <h2
              className="text-[32px] font-bold text-[#0a3d2e] leading-tight tracking-[-0.5px]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Everything you need,<br />nothing you don't
            </h2>
          </div>
          <p className="text-[14px] text-[#5a7568] leading-relaxed max-w-[380px]">
            Powerful AI tools built for modern banking — simple enough for anyone to use from anywhere.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-[#dde8e3] rounded-[16px] p-6 hover:border-[#b5cfc5] transition-colors"
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4"
                style={{ background: f.iconBg }}
              >
                <f.icon size={18} style={{ color: f.iconColor }} />
              </div>
              <h3
                className="text-[15px] font-bold text-[#0a3d2e] mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {f.title}
              </h3>
              <p className="text-[13px] text-[#5a7568] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}