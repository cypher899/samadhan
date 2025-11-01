import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddComplaintForm from "./pages/AddComplaintForm";
import LoginPage from "./pages/LoginPage";
import CreateNewUser from "./pages/CreateNewUser";
import UserHome from "./pages/UserHome";
import Recent from "./pages/Recent";
import Stats from "./pages/Stats";
import Profile from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute"; // 👈 Import it
import Update from "./pages/Update";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserHome />} />
        <Route path="/recent" element={<Recent />} />
        <Route path="/create-new-user" element={<CreateNewUser />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/stats" element={<Stats />} />
        <Route
          path="/Update"
          element={
            <PrivateRoute>
              <Update />
            </PrivateRoute>
          }
        />

        {/* 👇 Protected Routes using PrivateRoute */}
        <Route
          path="/add-complaint"
          element={
            <PrivateRoute>
              <AddComplaintForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
