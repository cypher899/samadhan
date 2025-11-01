import React from "react";
import Header from "./Header";
import Recent from "./Recent";
import Dashboard from "./Dashboard";
import Footer from "./Footer";
const UserHome = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
};

export default UserHome;
