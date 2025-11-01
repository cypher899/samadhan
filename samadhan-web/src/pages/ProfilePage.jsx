import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or sessionStorage
    let email = "";
    if (location.state && location.state.email) {
      email = location.state.email;
    } else {
      // fallback to sessionStorage user object
      const user = sessionStorage.getItem("user");
      if (user) {
        try {
          const parsed = JSON.parse(user);
          email = parsed.email || "";
        } catch (err) {
          console.error(err);
        }
      }
    }
    if (!email) {
      setError("No email found for profile.");
      setLoading(false);
      return;
    }
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/admin`, {
        params: { email },
      })
      .then((res) => {
        let data = res.data;
        if (Array.isArray(data)) {
          data = data[0] || {};
        } else if (data && data.data) {
          data = data.data;
        }
        setUserData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch admin:", err);
        setError("Failed to fetch admin data.");
        setLoading(false);
      });
  }, [location.state]);

  const handleEditClick = () => {
    setEditData({ ...userData });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSaveEdit = async () => {
    setUpdating(true);

    // Check if passwords match when changing password
    if (editData.password && editData.password !== editData.confirmPassword) {
      alert("Password and Confirm Password do not match.");
      setUpdating(false);
      return;
    }

    try {
      const updatePayload = {
        id: userData.id,
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        username: editData.username,
      };

      // Include password only if it's being changed
      if (editData.password && editData.password.trim() !== "") {
        updatePayload.password = editData.password;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/update-profile`,
        updatePayload
      );

      if (response.data.success) {
        setUserData({ ...userData, ...editData });
        setIsEditing(false);
        setEditData({});
        alert("Profile updated successfully!");
      } else {
        alert(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile. Please try again.");
    }
    setUpdating(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-red-100">
          <p className="text-xl text-red-600">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-3 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-10 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-blue-700">
                Admin Profile
              </h1>
              <p className="text-sm sm:text-base text-blue-600 mt-1">
                Your account & access details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {(userData.name || "A").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {!isEditing ? (
            <>
              {/* View Mode */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-sm sm:text-base">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col gap-1">
                  <dt className="text-xs uppercase tracking-wide text-blue-500 font-semibold">
                    Full Name
                  </dt>
                  <dd className="font-medium text-gray-800 break-words">
                    {userData.name || "-"}
                  </dd>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col gap-1">
                  <dt className="text-xs uppercase tracking-wide text-blue-500 font-semibold">
                    Email
                  </dt>
                  <dd className="font-medium text-gray-800 break-all">
                    {userData.email || "-"}
                  </dd>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col gap-1">
                  <dt className="text-xs uppercase tracking-wide text-blue-500 font-semibold">
                    Phone
                  </dt>
                  <dd className="font-medium text-gray-800">
                    {userData.phone || "-"}
                  </dd>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col gap-1">
                  <dt className="text-xs uppercase tracking-wide text-blue-500 font-semibold">
                    Username
                  </dt>
                  <dd className="font-medium text-gray-800 break-words">
                    {userData.username || "-"}
                  </dd>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col gap-1 sm:col-span-2 md:col-span-1">
                  <dt className="text-xs uppercase tracking-wide text-blue-500 font-semibold">
                    Role
                  </dt>
                  <dd className="font-medium text-gray-800">
                    {userData.role || "-"}
                  </dd>
                </div>
              </dl>

              {/* Actions */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center justify-center">
                <button
                  onClick={handleEditClick}
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg shadow-sm hover:shadow transition-all text-sm sm:text-base"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate("/create-new-user")}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg shadow-sm hover:shadow transition-all text-sm sm:text-base"
                >
                  Add Admin
                </button>
                <button
                  onClick={() => {
                    sessionStorage.clear();
                    navigate("/login");
                  }}
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg shadow-sm hover:shadow transition-all text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Edit Profile Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.email || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editData.phone || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editData.username || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, username: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter username"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                      <span className="text-xs text-gray-500 ml-2">
                        (Leave blank to keep current password)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={editData.password || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, password: e.target.value })
                        }
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password (optional)"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={editData.confirmPassword || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 ${
                          editData.confirmPassword &&
                          editData.password !== editData.confirmPassword
                            ? "border-red-400 focus:ring-red-400"
                            : "border-gray-300 focus:ring-blue-500"
                        } focus:border-transparent`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {editData.confirmPassword &&
                      editData.password !== editData.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          Passwords do not match
                        </p>
                      )}
                  </div>
                </div>

                {/* Edit Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t">
                  <button
                    onClick={handleSaveEdit}
                    disabled={
                      updating ||
                      (editData.confirmPassword &&
                        editData.password !== editData.confirmPassword)
                    }
                    className={`w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:shadow transition-all ${
                      updating ||
                      (editData.confirmPassword &&
                        editData.password !== editData.confirmPassword)
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={updating}
                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="w-100">
        <Footer />
      </div>
    </>
  );
};

export default ProfilePage;
