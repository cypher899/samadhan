// src/components/Footer.jsx

import React from "react";
import samadhanLogo from "../assets/images/samadhan-logo.jpeg";

const Footer = () => {
  return (
    <footer className="bg-[#0c2d48] text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src={samadhanLogo}
            alt="Samadhan Logo"
            className="h-10 w-auto rounded-md"
          />
          <span className="text-lg font-semibold">Samadhan</span>
        </div>

        {/* Copyright + Institute */}
        <div className="text-center md:text-right mt-4 md:mt-0">
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} Samadhan. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">Powered by SSIPMT Raipur</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
