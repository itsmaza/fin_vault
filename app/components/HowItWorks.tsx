const steps = [
  {
    num: "1",
    title: "Create account",
    desc: "Sign up with your name, email, address and a secure 4-digit passcode",
  },
  {
    num: "2",
    title: "Verify identity",
    desc: "Quick verification to keep your account and funds fully protected",
  },
  {
    num: "3",
    title: "Add funds",
    desc: "Deposit money to your FinVault balance instantly from any source",
  },
  {
    num: "4",
    title: "Start banking",
    desc: "Chat with AI to send, receive, analyze, and manage your money",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#f6faf8] border-t border-b border-[#e8efeb]">
      <div className="max-w-[1100px] mx-auto px-6 py-20">

        <div className="text-center mb-12">
          <div className="inline-block bg-[#E1F5EE] text-[#085041] text-[11px] font-semibold px-3 py-1.5 rounded-full mb-3 tracking-wide">
            How it works
          </div>
          <h2
            className="text-[32px] font-bold text-[#0a3d2e] tracking-[-0.5px]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Up and running in minutes
          </h2>
          <p className="text-[14px] text-[#5a7568] mt-2">
            Four simple steps to your AI-powered financial life
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connector line — desktop only */}
          <div
            className="hidden lg:block absolute top-[22px] left-[12%] right-[12%] h-px"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #1d9e75 0, #1d9e75 6px, transparent 6px, transparent 14px)",
            }}
          />

          {steps.map((s, i) => (
            <div key={i} className="text-center relative z-10">
              <div className="w-11 h-11 bg-[#0a3d2e] rounded-full flex items-center justify-center mx-auto mb-4">
                <span
                  className="text-white text-[16px] font-bold"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {s.num}
                </span>
              </div>
              <h3
                className="text-[14px] font-bold text-[#0a3d2e] mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {s.title}
              </h3>
              <p className="text-[12px] text-[#5a7568] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}