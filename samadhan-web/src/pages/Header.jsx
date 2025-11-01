import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/cg-logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  // const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate(); // ✅ useNavigate hook

  // const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeAllMenus = () => {
    setMenuOpen(false);
    // setDropdownOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full shadow-md px-3 sm:px-4 py-2 md:px-10 bg-gradient-to-br from-[#4d60ef] to-blue-500 z-50 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-br"
      role="banner"
    >
      <div className="flex items-center justify-between h-14 sm:h-16 relative">
        {/* Left: Logo */}
        <div className="flex items-center flex-shrink-0 z-10">
          <button
            onClick={() => navigate("/")}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-md"
            aria-label="Go to home"
          >
            <img
              src={logo}
              alt="Chhattisgarh Government Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain select-none"
              draggable={false}
            />
          </button>
        </div>

        {/* Center: Title */}
        <div className="absolute left-1/2 -translate-x-1/2 z-0 flex justify-center items-center w-full">
          <button
            onClick={() => navigate("/login")}
            className="text-2xl lg:text-3xl font-bold text-white tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-md"
            aria-label="Go to login"
          >
            SAMADHAN
          </button>
        </div>

        {/* Right: Hamburger (Mobile) */}
        <div className="md:hidden z-10">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 text-3xl p-2 rounded-md transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <i
              className={`fa-solid ${
                menuOpen ? "fa-xmark" : "fa-bars"
              } transition-transform`}
            />
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-6 z-10"
          aria-label="Primary"
        >
          <Link
            to="/"
            className="text-lg text-white hover:text-black font-semibold"
          >
            Home
          </Link>
          <Link
            to="/stats"
            className="text-lg text-white hover:text-black font-semibold"
          >
            Stats
          </Link>
          <Link
            to="/update"
            className="text-lg text-white hover:text-black font-semibold"
          >
            Update
          </Link>

          {/* Click-to-toggle Dropdown */}
          <div className="relative">
            <button
              onClick={() => navigate("/add-complaint")}
              className="text-lg text-white hover:text-black font-semibold cursor-pointer"
            >
              Complaint
            </button>
          </div>

          {/* Account Icon (Desktop) */}
          <button
            onClick={() => navigate("/profile")}
            className="text-white hover:text-black text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-md p-1"
            aria-label="Profile"
          >
            <i className="fa-regular fa-circle-user" />
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden bg-white/95 backdrop-blur shadow-lg border border-white/40 rounded-xl mt-2 py-3 px-5 space-y-2 z-40 absolute top-full left-3 right-3 animate-fade-in"
        >
          <Link
            to="/"
            onClick={closeAllMenus}
            className="block text-gray-700 font-medium hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/stats"
            onClick={closeAllMenus}
            className="block text-gray-700 font-medium hover:text-blue-600 transition-colors"
          >
            Stats
          </Link>
          <Link
            to="/add-complaint"
            onClick={closeAllMenus}
            className="block text-gray-700 font-medium hover:text-blue-600 transition-colors"
          >
            Complaint
          </Link>
          <Link
            to="/update"
            onClick={closeAllMenus}
            className="block text-gray-700 font-medium hover:text-blue-600 transition-colors"
          >
            Update
          </Link>

          {/* Account Icon (Mobile) */}
          <button
            onClick={() => {
              closeAllMenus();
              navigate("/profile");
            }}
            className="block text-gray-700 font-medium hover:text-blue-600 transition-colors"
            aria-label="Profile / Login"
          >
            Profile
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
