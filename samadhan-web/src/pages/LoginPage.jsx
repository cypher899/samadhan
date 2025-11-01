import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import logo from "../assets/images/samadhan-logo.jpeg";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in (sessionStorage check)
  useEffect(() => {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      navigate("/add-complaint");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Remove captcha logic
    // setCaptchaError("");
    // if (!captcha) {
    //   setCaptchaError("Please complete the captcha.");
    //   return;
    // }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/login`,
        {
          email,
          password,
        }
      );

      if (res.status === 200 && res.data.user) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/add-complaint");
      } else {
        // Handle unexpected response
        alert(
          res.data.error || "Invalid credentials or captcha. Please try again."
        );
      }
    } catch (error) {
      // Improved error handling
      if (error.response) {
        // Server responded with a status outside 2xx
        alert(
          error.response.data.error ||
            "Invalid credentials or captcha. Please try again."
        );
      } else if (error.request) {
        // Request made but no response received
        alert("No response from server. Please check your connection.");
      } else {
        // Something else happened
        alert("Error: " + error.message);
      }
      // console.error(error);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f0f8ff] flex items-center justify-center px-4">
        <div className="w-full max-w-3xl bg-white p-10 rounded-2xl shadow-xl flex flex-col justify-center">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Samadhan Logo"
              className="h-40 w-auto"
              style={{
                border: "2px solid #080808ff",
                borderRadius: "100%",
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-[#182fdb] text-center mb-1 tracking-wide">
            SAMADHAN
          </h1>
          <p className="text-center text-gray-600 mb-8 text-base">
            Complaint Registration Portal
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Remove captcha UI */}
            {/* <div className="flex flex-col items-center">
              <ReCAPTCHA
                sitekey="6LewCp4rAAAAAKJccECZVxuOFDrzBSMQ_jRCla5U"
                onChange={(value) => {
                  setCaptcha(value);
                  setCaptchaError("");
                }}
              />
              {captchaError && (
                <span className="text-red-500 text-sm mt-2">
                  {captchaError}
                </span>
              )}
            </div> */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#182fdb]"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#182fdb]"
              />
            </div>
            {/* <div className="flex justify-end text-sm">
              <a href="#" className="text-[#182fdb] hover:underline">
                Forgot Password?
              </a>
            </div> */}
            <button
              type="submit"
              className="w-full py-3 bg-[#182fdb] text-white font-semibold rounded-xl hover:bg-blue-500 transition duration-200"
            >
              Login
            </button>
            {/* <div className="text-center pt-3">
              <Link
                to="/create-new-user"
                className="text-sm text-[#182fdb] font-semibold hover:underline"
              >
                Create a New Account
              </Link>
            </div> */}
          </form>
        </div>
      </div>
    </>
  );
}

// Error: The dependency 'react-google-recaptcha' is missing.
// Solution: Install it using npm or yarn.

// In your terminal, run:
// npm install react-google-recaptcha

// or if you use yarn:
// yarn add react-google-recaptcha

// After installing, restart your dev server.
// After installing, restart your dev server.
