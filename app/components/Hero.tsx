import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"

export default function Hero() {
  return (
    <section className="max-w-[1100px] mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      {/* Left — copy */}
      <div>
        <div className="inline-flex items-center gap-2 bg-[#E1F5EE] text-[#085041] text-[11px] font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wide">
          <span className="w-1.5 h-1.5 bg-[#1d9e75] rounded-full" />
          AI-Powered Banking
        </div>

        <h1
          className="text-[42px] lg:text-[50px] font-bold text-[#0a3d2e] leading-[1.1] tracking-[-1.5px] mb-4"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Banking that<br />
          understands{" "}
          <em className="text-[#1d9e75] not-italic">you</em>
        </h1>

        <p className="text-[15px] text-[#5a7568] leading-relaxed mb-7 max-w-[420px]">
          Send money, check history, and manage your finances — all with a single
          message. No menus, no clicks, no friction.
        </p>

        <div className="flex flex-wrap gap-3 mb-5">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0a3d2e] text-white text-[14px] font-semibold rounded-[10px] hover:bg-[#0f5c44] transition-colors"
          >
            Open free account <ArrowRight size={15} />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#c8ddd4] text-[#0a3d2e] text-[14px] font-semibold rounded-[10px] hover:bg-[#f6faf8] transition-colors"
          >
            See how it works
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#1d9e75]" />
          <span className="text-[12px] text-[#8a9e96]">
            Trusted by 50,000+ users in the US
          </span>
        </div>
      </div>

      {/* Right — dashboard card preview */}
      <div className="bg-[#f6faf8] border border-[#dde8e3] rounded-[20px] p-6">

        {/* Card header */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="text-[13px] font-semibold text-[#0a3d2e]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            FinVault
          </span>
          <div className="w-7 h-5 bg-[#1d9e75] rounded-[4px] opacity-70" />
        </div>

        {/* Balance */}
        <p className="text-[11px] text-[#8a9e96] font-semibold tracking-widest mb-1">TOTAL BALANCE</p>
        <p
          className="text-[30px] font-bold text-[#0a3d2e] mb-4"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          $84,220.50
        </p>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "INCOME", value: "$42k", badge: "+12%", up: true },
            { label: "SPENT", value: "$12k", badge: "-8%", up: false },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#dde8e3] rounded-[10px] p-3">
              <p className="text-[10px] font-semibold text-[#8a9e96] tracking-wide mb-1.5">{s.label}</p>
              <div className="flex items-center gap-2">
                <span
                  className="text-[16px] font-bold text-[#0a3d2e]"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {s.value}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    s.up
                      ? "bg-[#E1F5EE] text-[#085041]"
                      : "bg-[#FAEEDA] text-[#633806]"
                  }`}
                >
                  {s.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* AI Chat preview */}
        <div className="bg-white border border-[#dde8e3] rounded-[12px] p-3.5">
          <p className="text-[10px] font-semibold text-[#8a9e96] tracking-wide mb-2.5">AI ASSISTANT</p>
          <div className="bg-[#E1F5EE] text-[#085041] text-[12px] rounded-[8px] px-3 py-2 inline-block mb-3">
            "Send $500 to Alex — done! Confirm?"
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#f6faf8] border border-[#dde8e3] rounded-[7px] px-3 py-2 text-[11px] text-[#8a9e96]">
              Type anything...
            </div>
            <button className="bg-[#0a3d2e] text-white text-[11px] font-semibold rounded-[7px] px-3">
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}