import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full border-t border-blue-100 bg-gradient-to-r from-[#EEF2FF] via-white to-[#E0F2FE] mt-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-4 py-5 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-lg md:text-xl poppins-semibold text-slate-900">
            Pranjal Pathshala
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            © {new Date().getFullYear()} • Guided learning for classes 1–10 & beyond
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <a
            href="https://wa.me/919479480495?text=Hello%21%20I%20need%20more%20information%20about%20your%20services"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#22C55E] text-white px-4 py-2 text-sm md:text-base poppins-medium shadow-[0_12px_32px_rgba(34,197,94,0.45)] hover:bg-[#16A34A] hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <i className="ri-whatsapp-line text-lg md:text-xl" />
            <span>+91 94794 80495</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer