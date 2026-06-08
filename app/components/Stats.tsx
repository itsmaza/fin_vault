const stats = [
  { num: "50k", unit: "+", label: "Active users nationwide" },
  { num: "$2B", unit: "+", label: "Transactions processed" },
  { num: "99.9", unit: "%", label: "Platform uptime" },
]

export default function Stats() {
  return (
    <section className="max-w-[1100px] mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <div className="inline-block bg-[#E1F5EE] text-[#085041] text-[11px] font-semibold px-3 py-1.5 rounded-full mb-3 tracking-wide">
          By the numbers
        </div>
        <h2
          className="text-[32px] font-bold text-[#0a3d2e] tracking-[-0.5px]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Trusted across the US
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-[#dde8e3] rounded-[16px] p-8 text-center hover:bg-[#f6faf8] transition-colors"
          >
            <div
              className="text-[44px] font-bold text-[#0a3d2e] tracking-[-1.5px] leading-none mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {s.num}
              <span className="text-[#1d9e75]">{s.unit}</span>
            </div>
            <p className="text-[13px] text-[#5a7568]">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}