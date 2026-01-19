import React from 'react';
import { Link } from 'react-router-dom';

const OutlinePencilIcon = () => (
  <svg
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    className="w-10 h-10 md:w-12 md:h-12"
  >
    <g
      fill="none"
      stroke="#60A5FA"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 44 L44 18 L52 26 L26 52 L14 54 Z" />
      <path d="M40 22 L48 30" />
      <path d="M22 48 L28 42" />
    </g>
  </svg>
);

const OutlineBagIcon = () => (
  <svg
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    className="w-11 h-11 md:w-13 md:h-13"
  >
    <g
      fill="none"
      stroke="#60A5FA"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="14" y="20" width="36" height="28" rx="6" />
      <path d="M24 20 C24 14 28 10 32 10 C36 10 40 14 40 20" />
      <path d="M20 30 H44" />
      <path d="M24 36 H28" />
      <path d="M36 36 H40" />
    </g>
  </svg>
);

const Hero = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EEF2FF] via-[#FFFFFF] to-[#E0F2FE] px-4 md:px-8 lg:px-12 py-12 md:py-16 shadow-[0_24px_80px_rgba(148,163,184,0.35)] border border-blue-100/70">
      {/* Soft floating blobs */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(129,140,248,0.20),transparent_60%)]" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.26),transparent_65%)]" />

      {/* Floating outline stationery icons */}
      <div className="pointer-events-none absolute -left-2 md:left-6 top-10 md:top-8 rotate-[-8deg] animate-[float_5s_ease-in-out_infinite]">
        <OutlinePencilIcon />
      </div>
      <div className="pointer-events-none absolute right-4 md:right-16 top-16 md:top-10 rotate-[10deg] animate-[float_6s_ease-in-out_infinite]">
        <OutlineBagIcon />
      </div>
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-4 md:bottom-6 opacity-70 rotate-[4deg] animate-[float_7s_ease-in-out_infinite]">
        <OutlinePencilIcon />
      </div>

      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs md:text-sm text-[#3B82F6] border border-blue-100/70 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[#60A5FA]" />
          Personalized coaching for Class 1–10 & Python
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl lg:text-6xl poppins-black leading-tight tracking-tight">
            Aapka Safar,
          </h1>
          <h1 className="text-4xl md:text-5xl lg:text-6xl poppins-black leading-tight tracking-tight text-[#3B82F6] drop-shadow-[0_6px_18px_rgba(37,99,235,0.28)]">
            Humhari Zimmedari!
          </h1>
          <p className="text-xs md:text-sm uppercase tracking-[0.22em] text-gray-500 mt-1">
            Pranjal Pathshala • Strong Concepts • Confident Students
          </p>
        </div>

        <p className="text-base md:text-lg text-slate-700 max-w-2xl">
          Pranjal Pathshala ek vishwasniya, result-oriented coaching institute hai jo
          har student ko strong foundation, regular practice aur personal attention ke
          saath unke academic goals tak pahunchne mein madad karta hai.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/new-admission">
            <button className="px-7 py-3.5 bg-[#60A5FA] text-white text-base md:text-lg poppins-semibold rounded-2xl shadow-[0_18px_40px_rgba(96,165,250,0.55)] hover:bg-[#3B82F6] hover:shadow-[0_22px_55px_rgba(96,165,250,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              Start Today
            </button>
          </Link>
          <div className="text-sm md:text-base text-gray-600">
            <p className="poppins-semibold text-gray-800">
              All Subjects | CBSE & State Board
            </p>
            <p>Regular tests • Doubt support • Progress tracking</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
