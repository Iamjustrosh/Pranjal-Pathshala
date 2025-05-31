import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png"; // ✅ Import the logo properly

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Admission Form", path: "/admission" },
    { name: "Quiz", path: "/quiz" },
    { name: "Study Material", path: "/study-material" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <nav className="bg-white shadow-md relative top-0 left-0 w-full z-50 border-b-2 border-gray-400">
      <div className="w-full px-2 md:py-3 flex items-center justify-between">
  
        <Link to="/" className="text-xl font-bold text-blue-600">
          <img src={logo} alt="logo" className="w-20 h-20" />
        </Link>

        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            <i
              className={`ri-${isOpen ? "close-line" : "menu-line"} text-3xl`}
            ></i>
          </button>
        </div>

        <div
          className={`
            ${isOpen ? "block" : "hidden"} 
            md:flex md:items-center md:gap-8
            absolute md:static left-0 top-full w-full h-screen md:h-auto py-32 md:py-0.5 md:w-auto bg-white md:bg-transparent
            ${isOpen ? "shadow-md" : ""}
            transition-all
          `}
          style={isOpen ? { zIndex: 100 } : {}}
        >
          <div className="flex flex-col gap-2 text-2xl md:text-xl md:flex-row md:gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center justify-center gap-2 py-2 px-4 text-gray-800 hover:text-blue-600 ${
                    isActive ? "font-semibold text-blue-600" : ""
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
