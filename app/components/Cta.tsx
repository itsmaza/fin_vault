import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CTA() {
  return (
    <section className="bg-[#0a3d2e] py-20 px-6 text-center">
      <h2
        className="text-[34px] font-bold text-white tracking-[-0.5px] mb-3"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        Ready to bank{" "}
        <em className="text-[#5DCAA5] not-italic">smarter?</em>
      </h2>
      <p className="text-[14px] text-[#6fa890] mb-8 leading-relaxed max-w-md mx-auto">
        Join thousands of users managing money through conversation. Free to start, instant to set up.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1d9e75] text-white text-[14px] font-semibold rounded-[10px] hover:bg-[#17845f] transition-colors"
        >
          Create free account <ArrowRight size={15} />
        </Link>
        <Link
          href="#features"
          className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white text-[14px] font-semibold rounded-[10px] hover:bg-white/10 transition-colors"
        >
          Learn more
        </Link>
      </div>
    </section>
  )
}