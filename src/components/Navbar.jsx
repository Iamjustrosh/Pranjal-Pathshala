import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Admission Form", path: "/new-admission" },
    { name: "Quiz", path: "/quiz" },
    { name: "Study Material", path: "/study-material" },
    { name: "Contact Us", path: "/contact" },
    { name: (<><i className="ri-admin-line mr-1"></i></>), path: "/login" },
  ];

  return (
    <nav className="sticky top-0 left-0 w-full z-50 bg-white/80 backdrop-blur border-b border-blue-100 shadow-[0_8px_30px_rgba(148,163,184,0.28)]">
      <div className=" mx-auto px-3 md:px-6 lg:px-4 py-2 md:py-3 flex items-center justify-between gap-3">
        {/* Logo + brand */}
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center justify-center rounded-2xl bg-[#EEF2FF] border border-blue-100 px-2 py-1 md:px-2.5 md:py-1.5">
            <img src={logo} alt="Pranjal Pathshala logo" className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm md:text-base poppins-semibold text-slate-900">
              Pranjal Pathshala
            </span>
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Learn • Practice • Grow
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 text-sm md:text-[15px]">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-full flex items-center justify-center gap-2 transition-colors ${
                  isActive
                    ? "bg-[#DBEAFE] text-[#1D4ED8] font-semibold"
                    : "text-slate-700 hover:text-[#1D4ED8] hover:bg-slate-50"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-sm"
          aria-label="Toggle menu"
        >
          <i className={`ri-${isOpen ? "close-line" : "menu-line"} text-2xl`} />
        </button>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/96 backdrop-blur shadow-[0_14px_45px_rgba(148,163,184,0.28)]">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-sm ${
                    isActive
                      ? "bg-[#DBEAFE] text-[#1D4ED8] font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <span>{link.name}</span>
                <i className="ri-arrow-right-s-line text-slate-400 text-lg" />
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
