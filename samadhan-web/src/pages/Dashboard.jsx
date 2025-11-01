// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Recent from "./Recent";
import Footer from "./Footer";

const Dashboard = () => {
  const [_, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });

  const [sources, setSources] = useState({
    cm: 0,
    collector: 0,
    post: 0,
    web: 0,
    pg: 0,
    call_center: 0,
  });

  const [masterTotals, setMasterTotals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/`)
      .then((res) => {
        const {
          total_complaints,
          pending,
          resolved,
          cm,
          collector,
          post,
          web,
          pg,
          call_center,
        } = res.data;
        setStats({ total: total_complaints, pending: pending, resolved });
        setSources({ cm, collector, post, web, pg, call_center });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data.", err);
        setLoading(false);
      });

    // Fetch master graph latest totals
    fetch(`${import.meta.env.VITE_API_BASE_URL}/stats/summary-graph`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setMasterTotals(result.data || []);
      });
  }, []);

  // Link masterTotals to statCards
  const statCards = [
    {
      label: "Total Complaints",
      value: masterTotals.reduce(
        (sum, item) => sum + (Number(item.total) || 0),
        0
      ),
    },
    {
      label: "Pending",
      value: masterTotals.reduce(
        (sum, item) => sum + (Number(item.pending) || 0),
        0
      ),
    },
    {
      label: "Resolved",
      value: masterTotals.reduce(
        (sum, item) => sum + (Number(item.resolve) || 0),
        0
      ),
    },
  ];

  if (loading) {
    return (
      <p className="text-center py-10 text-lg">Loading dashboard data...</p>
    );
  }

  const complaintSources = [
    { label: "मुख्यमंत्री जनदर्शन", key: "cm", value: sources.cm },
    { label: "कलेक्टर जनदर्शन", key: "collector", value: sources.collector },
    { label: "जनशिकायत (डाक/मेल)", key: "post", value: sources.post },
    { label: "जनशिकायत (वेब)", key: "web", value: sources.web },
    { label: "पीजी पोर्टल", key: "pg", value: sources.pg },
    { label: "कॉल सेंटर", key: "call_center", value: sources.call_center },
  ];

  const totalSourceCount = complaintSources.reduce(
    (sum, s) => sum + (Number(s.value) || 0),
    0
  );

  return (
    <div
      className="relative min-h-screen w-full overflow-x-auto font-sans"
      style={{ backgroundColor: "#F0F8FF" }} // Alice Blue background
    >
      <div className="max-w-screen-xl mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-5 sm:mb-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#182fdb] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#7495c3] mt-1">
            Overview of complaint data
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
          {statCards.map(({ label, value }) => (
            <div
              key={label}
              className="bg-white border border-[#dce3f0] rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-xs sm:text-sm text-[#7495c3] font-medium">
                {label}
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-[#182fdb] mt-1">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Complaint by Source */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-bold text-[#182fdb] mb-3 sm:mb-4">
            Complaints by Source
          </h2>
          <div className="bg-white border border-[#dce3f0] rounded-xl p-4 sm:p-6 shadow-sm overflow-x-auto">
            <div className="grid gap-y-5 gap-x-5 grid-cols-1 sm:grid-cols-[auto_1fr] items-center min-w-[260px]">
              {complaintSources.map(({ label, value }) => {
                const count = Number(value) || 0;
                const percent =
                  totalSourceCount > 0 ? (count / totalSourceCount) * 100 : 0;
                return (
                  <React.Fragment key={label}>
                    <p className="text-xs sm:text-sm font-medium text-black pr-2 sm:pr-0">
                      {label}
                    </p>
                    <div className="flex items-center gap-2 w-full max-w-full">
                      <div className="w-full bg-[#e2e8f0] h-2.5 sm:h-3 rounded-md relative overflow-hidden">
                        <div
                          className="h-2.5 sm:h-3 rounded-md transition-all duration-500 ease-in-out"
                          style={{
                            width: `${percent.toFixed(2)}%`,
                            backgroundColor: "#7495c3",
                          }}
                          aria-label={`${label}: ${percent.toFixed(1)}%`}
                          role="progressbar"
                          aria-valuenow={percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#333] whitespace-nowrap">
                        {percent.toFixed(1)}%
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
              {totalSourceCount === 0 && (
                <div className="col-span-1 sm:col-span-2 text-xs sm:text-sm text-gray-500">
                  No source data available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Master Totals (Latest Values) */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-bold text-green-700 mb-3 sm:mb-4">
            Latest Portal Totals
          </h2>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {masterTotals.map((item) => (
              <div
                key={item.portal}
                className="bg-white border border-[#dce3f0] rounded-xl p-4 sm:p-6 shadow-sm"
              >
                <p className="text-xs sm:text-sm text-[#7495c3] font-semibold mb-1 sm:mb-2">
                  {item.portal}
                </p>
                <div className="text-sm sm:text-md text-gray-700 mb-1">
                  Pending: <span className="font-bold">{item.pending}</span>
                </div>
                <div className="text-sm sm:text-md text-gray-700 mb-1">
                  Resolve: <span className="font-bold">{item.resolve}</span>
                </div>
                <div className="text-sm sm:text-md text-gray-700">
                  Total: <span className="font-bold">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Complaints Table */}
        <Recent />
      </div>
    </div>
  );
};

export default Dashboard;
