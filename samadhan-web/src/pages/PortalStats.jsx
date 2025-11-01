import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import DepartmentNameGraph from "../components/DepartmentNameGraph";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const portals = [
  { label: "CM Jandarshan", value: "cm_jandarshan" },
  { label: "Collector Jandarshan", value: "coll_jandarshan" },
  { label: "Call Center", value: "callCenter" },
  { label: "PG Portal", value: "pgPortal" },
  { label: "Jansikayat Post Mail", value: "jansikayatPostMail" },
  { label: "Jansikayat Web", value: "jansikayatWeb" },
];

const PortalStats = () => {
  const [portalData, setPortalData] = useState({});
  const [masterData, setMasterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all"); // "all", "weekly", "monthly"
  const [suggestionDepartments, setSuggestionDepartments] = useState([]); // menu from suggestionRoute
  const [mainDeptGraphData, setMainDeptGraphData] = useState([]);
  const [mainDeptDropdown, setMainDeptDropdown] = useState(""); // dropdown for new graph
  const [isSmall, setIsSmall] = useState(false);
  const [_, setAllDepartmentOptions] = useState([]);

  // Track screen size for responsive chart tweaks
  useEffect(() => {
    const handler = () => setIsSmall(window.innerWidth < 640); // Tailwind sm breakpoint
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Fetch each portal's data
  useEffect(() => {
    const fetchAllPortalData = async () => {
      setLoading(true);
      let allData = {};
      for (const portal of portals) {
        try {
          // Add timeRange as query param
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/stats/portal/${
              portal.value
            }?timeRange=${timeRange}`
          );
          const result = await res.json();
          if (result.success) {
            allData[portal.label] = result.data || [];
          } else {
            allData[portal.label] = [];
          }
        } catch {
          allData[portal.label] = [];
        }
      }
      setPortalData(allData);
      setLoading(false);
    };
    fetchAllPortalData();
  }, [timeRange]);

  // Fetch master graph data (sum of all portals)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/stats/summary-graph?timeRange=${timeRange}`
        );
        const result = await res.json();
        if (result.success) {
          setMasterData(result.data || []);
        } else {
          setMasterData([]);
        }
      } catch {
        setMasterData([]);
      }
    };
    fetchMasterData();
  }, [timeRange]);

  // Fetch department menu from suggestionRoute
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/suggestions`)
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.data || [];
        const uniqueDepts = [
          ...new Set(arr.map((s) => s.main_department).filter(Boolean)),
        ];
        setSuggestionDepartments(uniqueDepts);
      });
  }, []);

  // Fetch main department-wise graph data from backend (last 5 records from history)
  useEffect(() => {
    // If no department selected, use the first department as default if available
    const dept =
      mainDeptDropdown ||
      (suggestionDepartments.length > 0 ? suggestionDepartments[0] : "");
    if (!dept) {
      setMainDeptGraphData([]);
      return;
    }

    const fetchMainDeptGraph = () => {
      const url = `${
        import.meta.env.VITE_API_BASE_URL
      }/stats/main-department-graph?main_department=${encodeURIComponent(
        dept
      )}`;

      fetch(url)
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setMainDeptGraphData(result.data.reverse() || []);
          } else {
            setMainDeptGraphData([]);
          }
        })
        .catch(() => setMainDeptGraphData([]));
    };

    fetchMainDeptGraph();
  }, [mainDeptDropdown, suggestionDepartments]);

  // Set default mainDeptDropdown to first department if not set
  useEffect(() => {
    if (!mainDeptDropdown && suggestionDepartments.length > 0) {
      setMainDeptDropdown(suggestionDepartments[0]);
    }
  }, [mainDeptDropdown, suggestionDepartments]);

  // Get unique department names for dropdown - fetch from "all" timeRange
  useEffect(() => {
    // Fetch all department names for dropdown options
    fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/stats/department-name-graph?timeRange=all`
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const uniqueDepts = [
            ...new Set(
              (result.data || [])
                .map((d) => d.department_name)
                .filter(
                  (name) => typeof name === "string" && name.trim() !== ""
                )
            ),
          ];
          setAllDepartmentOptions(uniqueDepts);
        }
      })
      .catch(() => setAllDepartmentOptions([]));
  }, []);

  // const departmentNameOptions = allDepartmentOptions;

  // Add this helper function that was missing
  const getLast6 = (data) => {
    if (!Array.isArray(data)) return [];
    return data.slice(-6); // Get last 6 records instead of 7
  };

  return (
    <>
      <Header />
      <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8 bg-gradient-to-br from-blue-50 to-blue-100">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-900 mb-4 sm:mb-8 tracking-tight">
          Portal Table Statistics
        </h1>

        {/* Time Range Switch Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          <button
            className={`px-4 sm:px-6 py-2 rounded-xl text-sm sm:text-base font-semibold border transition ${
              timeRange === "all"
                ? "bg-[#4d60efff] text-white"
                : "bg-white text-[#4d60efff] border-[#4d60efff]"
            }`}
            onClick={() => setTimeRange("all")}
          >
            All
          </button>
          <button
            className={`px-4 sm:px-6 py-2 rounded-xl text-sm sm:text-base font-semibold border transition ${
              timeRange === "weekly"
                ? "bg-[#4d60efff] text-white"
                : "bg-white text-[#4d60efff] border-[#4d60efff]"
            }`}
            onClick={() => setTimeRange("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-4 sm:px-6 py-2 rounded-xl text-sm sm:text-base font-semibold border transition ${
              timeRange === "monthly"
                ? "bg-[#4d60efff] text-white"
                : "bg-white text-[#4d60efff] border-[#4d60efff]"
            }`}
            onClick={() => setTimeRange("monthly")}
          >
            Monthly
          </button>
        </div>

        {/* Master Graph */}
        <div className="max-w-full sm:max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6 mb-6 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-green-700 mb-4 sm:mb-6">
            Master Graph (Total of All Portals)
          </h2>
          {masterData.length > 0 ? (
            (() => {
              // Filter out records where total is 0
              const filteredMasterData = masterData.filter(
                (d) => d.total && d.total !== 0
              );

              // Always show labels on both mobile and desktop
              const showLabels = true;

              return (
                <div className="relative">
                  {/* Horizontal Scroll Container for all screen sizes */}
                  <div className="overflow-x-auto scrollbar-thin pb-2">
                    <div
                      className="h-[260px] sm:h-[320px] md:h-[350px]"
                      style={{
                        minWidth: Math.max(
                          filteredMasterData.length * (isSmall ? 100 : 120),
                          isSmall ? 400 : 600
                        ),
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredMasterData}
                          barSize={isSmall ? 30 : 46}
                          margin={{
                            top: 20,
                            right: 10,
                            left: isSmall ? 10 : 20,
                            bottom: 4,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="portal"
                            tick={{ fontSize: isSmall ? 9 : 12 }}
                            interval={0}
                            angle={isSmall ? -45 : 0}
                            textAnchor={isSmall ? "end" : "middle"}
                            height={isSmall ? 60 : 40}
                          />
                          <YAxis
                            tick={{ fontSize: isSmall ? 9 : 12 }}
                            domain={[
                              0,
                              (dataMax) => Math.ceil(dataMax * 1.2) || 10,
                            ]}
                            width={isSmall ? 40 : 60}
                          />
                          <Tooltip
                            wrapperClassName="text-sm"
                            contentStyle={{
                              fontSize: isSmall ? "12px" : "14px",
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: isSmall ? 10 : 12 }}
                          />

                          <Bar dataKey="pending" fill="#f59e42" name="Pending">
                            {showLabels && (
                              <LabelList
                                dataKey="pending"
                                position="top"
                                style={{ fontSize: isSmall ? 8 : 10 }}
                              />
                            )}
                          </Bar>
                          <Bar dataKey="resolve" fill="#42c5f5" name="Resolve">
                            {showLabels && (
                              <LabelList
                                dataKey="resolve"
                                position="top"
                                style={{ fontSize: isSmall ? 8 : 10 }}
                              />
                            )}
                          </Bar>
                          <Bar dataKey="total" fill="#42f57b" name="Total">
                            {showLabels && (
                              <LabelList
                                dataKey="total"
                                position="top"
                                style={{ fontSize: isSmall ? 8 : 10 }}
                              />
                            )}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center text-gray-500 py-10">
              No data available for master graph.
            </div>
          )}
        </div>

        {/* Main Department Wise Graph with Dropdown */}
        <div className="max-w-full sm:max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6 mb-6 sm:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 sm:mb-6 gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-indigo-700">
              Main Department History
            </h2>
            <select
              className="border border-blue-300 rounded-xl px-3 sm:px-4 py-2 bg-blue-50 font-semibold text-xs sm:text-sm md:text-base"
              value={mainDeptDropdown}
              onChange={(e) => setMainDeptDropdown(e.target.value)}
            >
              <option value="">Select a Department</option>
              {suggestionDepartments.map((dept, idx) => (
                <option key={idx} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          {mainDeptGraphData.length > 0 ? (
            <>
              <div
                className={
                  mainDeptGraphData.length > 5 ? "overflow-x-auto" : ""
                }
              >
                <div
                  className="w-full h-[280px] sm:h-[360px] md:h-[420px]"
                  style={
                    mainDeptGraphData.length > 5
                      ? { minWidth: mainDeptGraphData.length * 110 }
                      : {}
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mainDeptGraphData.filter(
                        (d) => d.total_complaints !== 0
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="snapshot_date"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("en-GB");
                        }}
                        tick={{ fontSize: isSmall ? 10 : 13 }}
                      />
                      <YAxis
                        domain={[
                          0,
                          (dataMax) => Math.ceil(dataMax * 1.2) || 10,
                        ]}
                        tick={{ fontSize: isSmall ? 10 : 13 }}
                      />
                      <Tooltip
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return `Date: ${date.toLocaleDateString("en-GB")}`;
                        }}
                        formatter={(value, name, props) => {
                          const { payload } = props;
                          return [
                            value,
                            `${name} (${payload.main_department} - ${payload.department_name})`,
                          ];
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: isSmall ? 10 : 13 }} />
                      <Bar
                        dataKey="cm_jandarshan"
                        fill="#f59e42"
                        name="CM Jandarshan"
                      >
                        <LabelList
                          dataKey="cm_jandarshan"
                          position="top"
                          style={{ fontSize: isSmall ? 10 : 13 }}
                        />
                      </Bar>
                      <Bar
                        dataKey="collector_jandarshan"
                        fill="#42c5f5"
                        name="Collector Jandarshan"
                      >
                        <LabelList
                          dataKey="collector_jandarshan"
                          position="top"
                          style={{ fontSize: isSmall ? 10 : 13 }}
                        />
                      </Bar>
                      <Bar
                        dataKey="call_center"
                        fill="#f542a7"
                        name="Call Center"
                      >
                        <LabelList
                          dataKey="call_center"
                          position="top"
                          style={{ fontSize: isSmall ? 10 : 13 }}
                        />
                      </Bar>
                      <Bar dataKey="pgPortal" fill="#42f57b" name="PG Portal">
                        <LabelList
                          dataKey="pgPortal"
                          position="top"
                          style={{ fontSize: isSmall ? 10 : 13 }}
                        />
                      </Bar>
                      <Bar
                        dataKey="jansikayatPostMail"
                        fill="#f54242"
                        name="Jansikayat Post Mail"
                      >
                        <LabelList
                          dataKey="jansikayatPostMail"
                          position="top"
                          style={{ fontSize: isSmall ? 10 : 13 }}
                        />
                      </Bar>
                      <Bar
                        dataKey="jansikayatWEB"
                        fill="#4242f5"
                        name="Jansikayat Web"
                      >
                        <LabelList
                          dataKey="jansikayatWEB"
                          position="top"
                          style={{ fontSize: isSmall ? 10 : 13 }}
                        />
                      </Bar>
                      <Bar
                        dataKey="total_complaints"
                        fill="#8884d8"
                        name="Total Complaints"
                      >
                        <LabelList
                          dataKey="total_complaints"
                          position="top"
                          style={{ fontSize: isSmall ? 10 : 13 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Show department details */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2 text-xs sm:text-sm md:text-base">
                  Department: {mainDeptDropdown}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  {mainDeptGraphData
                    .filter((record) => record.total_complaints !== 0)
                    .map((record, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2 sm:p-3 rounded border"
                      >
                        <div>
                          <strong>Date:</strong>{" "}
                          {new Date(record.snapshot_date).toLocaleString(
                            "en-GB"
                          )}
                        </div>
                        <div>
                          <strong>Office:</strong> {record.department_name}
                        </div>
                        <div>
                          <strong>Officer:</strong> {record.officer_designation}
                        </div>
                        <div>
                          <strong>Total:</strong> {record.total_complaints}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-10">
              No history data available for {mainDeptDropdown}. Data will appear
              here when complaints are added or updated for this department.
            </div>
          )}
        </div>

        {/* NEW: Add the standalone DepartmentNameGraph component */}
        <div className="max-w-full sm:max-w-7xl mx-auto mb-6 sm:mb-12">
          <DepartmentNameGraph />
        </div>

        {/* Separate Graphs for Each Portal */}
        {loading ? (
          <div className="text-center py-10 sm:py-16">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <span className="text-base sm:text-lg text-gray-600">
              Loading graphs...
            </span>
          </div>
        ) : (
          portals.map((portal) => {
            // Get portal data - show all data regardless of timeRange
            const portalDataArray = portalData[portal.label] || [];
            const filteredPortalData = getLast6(portalDataArray);

            // console.log(
            //   `Portal ${portal.label} - TimeRange: ${timeRange}, Raw data:`,
            //   portalDataArray.length,
            //   "Filtered:",
            //   filteredPortalData.length
            // );

            return (
              <div
                key={portal.label}
                className="max-w-full sm:max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6 mb-6 sm:mb-12 overflow-x-auto"
              >
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-blue-700 mb-3 sm:mb-6">
                  {portal.label}
                  {timeRange !== "all" && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({timeRange} view - Last 6{" "}
                      {timeRange === "weekly"
                        ? "weeks"
                        : timeRange === "monthly"
                        ? "months"
                        : "records"}
                      )
                    </span>
                  )}
                </h2>
                {filteredPortalData.length > 0 ? (
                  <div className="w-full h-[260px] sm:h-[320px] md:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredPortalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          // Show week range for weekly, else fallback to previous logic
                          dataKey={
                            timeRange === "weekly" ? "week_range" : "createdAt"
                          }
                          tickFormatter={(value, index) => {
                            if (timeRange === "weekly") {
                              // If backend does not provide week_range, fallback to createdAt
                              return (
                                value ||
                                (() => {
                                  const item = filteredPortalData[index];
                                  if (
                                    item &&
                                    item.week_start &&
                                    item.week_end
                                  ) {
                                    return `${item.week_start} - ${item.week_end}`;
                                  }
                                  return item?.createdAt
                                    ? new Date(
                                        item.createdAt
                                      ).toLocaleDateString("en-GB")
                                    : "";
                                })()
                              );
                            }
                            // ...existing code for monthly/all...
                            const date = new Date(value);
                            if (!isNaN(date)) {
                              if (timeRange === "monthly") {
                                return date.toLocaleDateString("en-GB", {
                                  month: "short",
                                });
                              }
                              return date.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              });
                            }
                            return value?.toString().slice(0, 10);
                          }}
                        />
                        <YAxis
                          domain={[
                            0,
                            () => {
                              if (
                                Array.isArray(filteredPortalData) &&
                                filteredPortalData.length > 0
                              ) {
                                const maxTotal = Math.max(
                                  ...filteredPortalData.map((d) => {
                                    const val = Number(d.total);
                                    return isNaN(val) ? 0 : val;
                                  })
                                );
                                return Math.ceil(maxTotal * 1.2) || 10; // add buffer
                              }
                              return 10; // fallback if no data
                            },
                          ]}
                        />

                        <Tooltip
                          labelFormatter={(value) => {
                            const date = new Date(value);
                            if (!isNaN(date)) {
                              if (timeRange === "weekly") {
                                return `Week ${Math.ceil(
                                  date.getDate() / 7
                                )} - ${date.toLocaleDateString("en-GB")}`;
                              } else if (timeRange === "monthly") {
                                return `${date.toLocaleDateString("en-GB", {
                                  month: "long",
                                  year: "numeric",
                                })}`;
                              }
                              return date.toLocaleDateString("en-GB");
                            }
                            return value.toString().slice(0, 10);
                          }}
                        />
                        <Legend />
                        <Bar dataKey="pending" fill="#f59e42" name="Pending">
                          <LabelList
                            dataKey="pending"
                            position="top"
                            style={{ fontSize: isSmall ? 10 : 12 }}
                          />
                        </Bar>
                        <Bar dataKey="resolve" fill="#42c5f5" name="Resolve">
                          <LabelList
                            dataKey="resolve"
                            position="top"
                            style={{ fontSize: isSmall ? 10 : 12 }}
                          />
                        </Bar>
                        <Bar dataKey="total" fill="#42f57b" name="Total">
                          <LabelList
                            dataKey="total"
                            position="top"
                            style={{ fontSize: isSmall ? 10 : 12 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    <div className="text-sm mb-2">
                      No data available for {portal.label} in {timeRange} view.
                    </div>
                    <div className="text-xs text-gray-400 mb-4">
                      {timeRange === "weekly" &&
                        "Weekly data shows aggregated values for each week."}
                      {timeRange === "monthly" &&
                        "Monthly data shows aggregated values for each month."}
                      {timeRange === "all" && "Showing individual records."}
                    </div>
                    <div className="text-xs text-blue-600">
                      Data will appear here when statistics are added using the
                      Update Stats page.
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default PortalStats;
