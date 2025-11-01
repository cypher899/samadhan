import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
} from "recharts";
import axios from "axios";

const portalOptions = [
  { value: "cm_jandarshan", label: "CM Jandarshan" },
  { value: "collector_jandarshan", label: "Collector Jandarshan" },
  { value: "call_center", label: "Call Center" },
  { value: "pgPortal", label: "PG Portal" },
  { value: "jansikayatPostMail", label: "Jansikayat Post/Mail" },
  { value: "jansikayatWEB", label: "Jansikayat WEB" },
  { value: "total_complaints", label: "Total Complaints" },
];

const DepartmentNameGraph = () => {
  const [timeRange, setTimeRange] = useState("weekly");
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState("total_complaints");
  const [isSmall, setIsSmall] = useState(false);

  // Track screen size for responsive chart tweaks
  useEffect(() => {
    const handler = () => setIsSmall(window.innerWidth < 640); // Tailwind sm breakpoint
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Fetch departments list from the correct endpoint - UPDATE to use current timeRange
  useEffect(() => {
    axios
      .get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/stats/department-name-graph?timeRange=all`
      )
      .then((res) => {
        if (res.data.success) {
          const uniqueDepts = [
            ...new Set(
              res.data.data
                .map((d) => d.department_name)
                .filter(
                  (name) => typeof name === "string" && name.trim() !== ""
                )
            ),
          ];
          setDepartments(uniqueDepts);

          // Set default department if not selected
          if (!selectedDept && uniqueDepts.length > 0) {
            setSelectedDept(uniqueDepts[0]);
          }
        }
      })
      .catch((err) => console.error("Error fetching departments:", err));
  }, [selectedDept]); // Add selectedDept to dependency array to fix missing dependency warning

  // Fetch graph data based on timeRange and selectedDept
  useEffect(() => {
    setLoading(true);

    // Build URL with department_name parameter if selectedDept is available
    let url = `${
      import.meta.env.VITE_API_BASE_URL
    }/stats/department-name-graph?timeRange=${timeRange}`;
    if (selectedDept) {
      url += `&department_name=${encodeURIComponent(selectedDept)}`;
    }

    axios
      .get(url)
      .then((res) => {
        // console.log("Raw API Response:", res.data);
        if (res.data.success) {
          setGraphData(res.data.data || []);
        } else {
          setGraphData([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching graph data:", err);
        setGraphData([]);
      })
      .finally(() => setLoading(false));
  }, [timeRange, selectedDept]); // Add selectedDept as dependency

  // Add useEffect to reset selectedPortal when timeRange changes
  useEffect(() => {
    if (timeRange === "weekly" || timeRange === "monthly") {
      setSelectedPortal("cm_jandarshan"); // Default to first portal
    } else {
      setSelectedPortal("total_complaints");
    }
  }, [timeRange]);

  // Transform and filter data for chart
  const filteredData = graphData
    .filter(() => {
      // For weekly/monthly, backend already filters by department, so show all returned data
      return true; // Show all data returned from backend
    })
    .map((d) => {
      // console.log("Raw data item:", d); // Debug log

      if (timeRange === "weekly") {
        // Backend returns: year, month, week_of_month, week_no, week_start, week_end, cm_pending, etc.
        const currentDate = new Date();
        const monthName = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth()
        ).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

        return {
          week_label: `Week ${d.week_of_month || d.week_no || "N/A"}`,
          week_range: `${d.week_start || "N/A"} - ${d.week_end || "N/A"}`,
          week_display: `Week ${
            d.week_of_month || d.week_no || "N/A"
          } of ${monthName}`,
          // Map the backend fields to expected frontend fields - use pending fields for weekly
          cm_jandarshan: Number(d.cm_pending) || 0,
          collector_jandarshan: Number(d.collector_pending) || 0,
          call_center: Number(d.call_pending) || 0,
          pgPortal: Number(d.pg_pending) || 0,
          jansikayatPostMail: Number(d.post_pending) || 0,
          jansikayatWEB: Number(d.web_pending) || 0,
          new_complaints:
            (Number(d.cm_new) || 0) +
            (Number(d.collector_new) || 0) +
            (Number(d.web_new) || 0) +
            (Number(d.post_new) || 0) +
            (Number(d.pg_new) || 0) +
            (Number(d.call_new) || 0),
          resolved_complaints:
            (Number(d.cm_resolved) || 0) +
            (Number(d.collector_resolved) || 0) +
            (Number(d.web_resolved) || 0) +
            (Number(d.post_resolved) || 0) +
            (Number(d.pg_resolved) || 0) +
            (Number(d.call_resolved) || 0),
          total_complaints:
            (Number(d.cm_pending) || 0) +
            (Number(d.collector_pending) || 0) +
            (Number(d.call_pending) || 0) +
            (Number(d.pg_pending) || 0) +
            (Number(d.post_pending) || 0) +
            (Number(d.web_pending) || 0),
          sort_key: Number(d.week_of_month || d.week_no) || 0,
        };
      } else if (timeRange === "monthly") {
        // Backend returns: year, month, month_start, month_end, cm_pending, etc.
        return {
          month_label: `${new Date(
            d.year || new Date().getFullYear(),
            (d.month || 1) - 1
          ).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`,
          month_range: `${d.month_start || "N/A"} - ${d.month_end || "N/A"}`,
          // Map the backend fields to expected frontend fields - use pending fields for monthly
          cm_jandarshan: Number(d.cm_pending) || 0,
          collector_jandarshan: Number(d.collector_pending) || 0,
          call_center: Number(d.call_pending) || 0,
          pgPortal: Number(d.pg_pending) || 0,
          jansikayatPostMail: Number(d.post_pending) || 0,
          jansikayatWEB: Number(d.web_pending) || 0,
          new_complaints:
            (Number(d.cm_new) || 0) +
            (Number(d.collector_new) || 0) +
            (Number(d.web_new) || 0) +
            (Number(d.post_new) || 0) +
            (Number(d.pg_new) || 0) +
            (Number(d.call_new) || 0),
          resolved_complaints:
            (Number(d.cm_resolved) || 0) +
            (Number(d.collector_resolved) || 0) +
            (Number(d.web_resolved) || 0) +
            (Number(d.post_resolved) || 0) +
            (Number(d.pg_resolved) || 0) +
            (Number(d.call_resolved) || 0),
          total_complaints:
            (Number(d.cm_pending) || 0) +
            (Number(d.collector_pending) || 0) +
            (Number(d.call_pending) || 0) +
            (Number(d.pg_pending) || 0) +
            (Number(d.post_pending) || 0) +
            (Number(d.web_pending) || 0),
          sort_key: `${d.year || new Date().getFullYear()}-${String(
            d.month || 1
          ).padStart(2, "0")}`,
        };
      } else {
        // Backend returns: department_name, snapshot_date, cm_jandarshan, collector_jandarshan, etc.
        return {
          snapshot_date: d.snapshot_date,
          cm_jandarshan: Number(d.cm_jandarshan) || 0,
          collector_jandarshan: Number(d.collector_jandarshan) || 0,
          call_center: Number(d.call_center) || 0,
          pgPortal: Number(d.pgPortal) || 0,
          jansikayatPostMail: Number(d.jansikayatPostMail) || 0,
          jansikayatWEB: Number(d.jansikayatWEB) || 0,
          total_complaints: Number(d.total_complaints) || 0,
          sort_key: new Date(d.snapshot_date).getTime(),
        };
      }
    })
    // Sort in ascending order (oldest first)
    .sort((a, b) => {
      if (timeRange === "weekly" || timeRange === "monthly") {
        if (typeof a.sort_key === "string" && typeof b.sort_key === "string") {
          return a.sort_key.localeCompare(b.sort_key);
        }
        return (a.sort_key || 0) - (b.sort_key || 0);
      } else {
        return a.sort_key - b.sort_key;
      }
    });

  // console.log("=== DEBUG INFO ===");
  // console.log("Raw graphData length:", graphData.length);
  // console.log("Selected Department:", selectedDept);
  // console.log("Time Range:", timeRange);
  // console.log("Filtered Data length:", filteredData.length);
  // console.log("First few raw items:", graphData.slice(0, 2));
  // console.log("First few filtered items:", filteredData.slice(0, 2));

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-2 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-green-700 mb-4">
        Department-wise Complaints
      </h2>

      {/* Show current month info for weekly view */}
      {timeRange === "weekly" && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Weekly View:</strong> Showing weeks of{" "}
            {new Date().toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}{" "}
            (current month)
            {selectedDept && ` for department "${selectedDept}"`}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-2 sm:gap-4 mb-6">
        {/* First row - Department and Time Range */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border rounded-lg px-3 py-2 w-auto max-w-xs text-sm sm:text-base"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-lg px-3 py-2 w-auto sm:w-40 text-sm sm:text-base"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Second row - Portal Selection */}
        <div className="w-full">
          <select
            value={selectedPortal}
            onChange={(e) => setSelectedPortal(e.target.value)}
            className="border rounded-lg px-3 py-2 w-auto max-w-sm text-sm sm:text-base"
          >
            {portalOptions.map((portal) => (
              <option key={portal.value} value={portal.value}>
                {portal.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : filteredData.length > 0 ? (
        <div>
          <div className="mb-4">
            {timeRange === "weekly" || timeRange === "monthly" ? (
              <div className="w-full">
                <div className="overflow-x-auto scrollbar-thin pb-2">
                  <div
                    style={{
                      minWidth: Math.max(
                        filteredData.length * (isSmall ? 80 : 150),
                        isSmall ? 300 : 600
                      ),
                      width: "100%",
                    }}
                  >
                    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredData}
                          margin={{
                            top: isSmall ? 40 : 70, // Increased top margin for padding above bars
                            right: isSmall ? 5 : 20,
                            left: isSmall ? 5 : 20,
                            bottom: isSmall ? 60 : 80,
                          }}
                          barCategoryGap="15%"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            // Show week range for weekly, else month label for monthly, else date
                            dataKey={
                              timeRange === "weekly"
                                ? "week_range"
                                : timeRange === "monthly"
                                ? "month_range"
                                : "snapshot_date"
                            }
                            tick={{ fontSize: isSmall ? 10 : 12 }}
                            stroke="#475569"
                            interval={0}
                            angle={
                              isSmall ? -45 : filteredData.length > 4 ? -45 : 0
                            }
                            textAnchor={
                              isSmall || filteredData.length > 4
                                ? "end"
                                : "middle"
                            }
                            height={
                              isSmall ? 60 : filteredData.length > 4 ? 100 : 80
                            }
                            tickFormatter={(value) => {
                              // Show only the date range string for weekly/monthly
                              return value || "";
                            }}
                          />
                          <YAxis
                            tick={{ fontSize: isSmall ? 10 : 12 }}
                            stroke="#475569"
                            width={isSmall ? 30 : 50}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              fontSize: isSmall ? "10px" : "12px",
                            }}
                            labelFormatter={(value, payload) => {
                              if (payload && payload[0]) {
                                const data = payload[0].payload;
                                return timeRange === "weekly"
                                  ? `${data.week_display} (${data.week_range})`
                                  : `${data.month_label} (${data.month_range})`;
                              }
                              return value;
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              fontSize: isSmall ? "10px" : "12px",
                            }}
                          />
                          {/* Single bar based on selected portal */}
                          <Bar
                            dataKey={selectedPortal}
                            fill={
                              selectedPortal === "cm_jandarshan"
                                ? "#f59e42"
                                : selectedPortal === "collector_jandarshan"
                                ? "#42c5f5"
                                : selectedPortal === "call_center"
                                ? "#f542a7"
                                : selectedPortal === "pgPortal"
                                ? "#42f57b"
                                : selectedPortal === "jansikayatPostMail"
                                ? "#f54242"
                                : selectedPortal === "jansikayatWEB"
                                ? "#4242f5"
                                : selectedPortal === "total_complaints"
                                ? "#8884d8"
                                : "#86efac"
                            }
                            name={
                              portalOptions.find(
                                (p) => p.value === selectedPortal
                              )?.label || "Selected Portal"
                            }
                            stroke={
                              selectedPortal === "cm_jandarshan"
                                ? "#e67e22"
                                : selectedPortal === "collector_jandarshan"
                                ? "#2980b9"
                                : selectedPortal === "call_center"
                                ? "#c0392b"
                                : selectedPortal === "pgPortal"
                                ? "#27ae60"
                                : selectedPortal === "jansikayatPostMail"
                                ? "#e74c3c"
                                : selectedPortal === "jansikayatWEB"
                                ? "#2c3e50"
                                : selectedPortal === "total_complaints"
                                ? "#6c5ce7"
                                : "#22c55e"
                            }
                            strokeWidth={1}
                          >
                            <LabelList
                              dataKey={selectedPortal}
                              position="top"
                              // Make values bold and increase font size
                              style={{
                                fontWeight: "bold",
                                fontSize: isSmall ? 16 : 22,
                                fill: "#374151",
                                // Add extra padding above the label
                                dy: -10, // Moves label down, so increase negative value for more space
                              }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Responsive container for all-time data */
              <div className="w-full">
                {filteredData.length > 10 ? (
                  <div>
                    <div className="mb-4 text-xs sm:text-sm text-gray-600 text-center">
                      Showing last 10 of {filteredData.length} records for{" "}
                      {
                        portalOptions.find((p) => p.value === selectedPortal)
                          ?.label
                      }
                      .
                      <br />
                      <span className="text-xs">
                        Most recent data displayed
                      </span>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin pb-2">
                      <div style={{ minWidth: isSmall ? "400px" : "600px" }}>
                        <div className="w-full h-[300px] sm:h-[400px] md:h-[500px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={filteredData.slice(-10)}
                              margin={{
                                top: isSmall ? 30 : 60,
                                right: isSmall ? 5 : 20,
                                left: isSmall ? 5 : 20,
                                bottom: isSmall ? 60 : 80,
                              }}
                              barCategoryGap="15%"
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                              />
                              <XAxis
                                dataKey="snapshot_date"
                                tick={{ fontSize: isSmall ? 9 : 11 }}
                                stroke="#475569"
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return !isNaN(date)
                                    ? date.toLocaleDateString("en-GB")
                                    : value;
                                }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={isSmall ? 60 : 80}
                              />
                              <YAxis
                                tick={{ fontSize: isSmall ? 10 : 12 }}
                                stroke="#475569"
                                width={isSmall ? 30 : 50}
                                domain={[0, "auto"]}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "8px",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                  fontSize: isSmall ? "10px" : "12px",
                                }}
                                labelFormatter={(value) => {
                                  const date = new Date(value);
                                  return !isNaN(date)
                                    ? date.toLocaleDateString("en-GB")
                                    : value;
                                }}
                              />
                              <Legend
                                wrapperStyle={{
                                  fontSize: isSmall ? "10px" : "12px",
                                }}
                              />
                              <Bar
                                dataKey={selectedPortal}
                                fill="#a78bfa"
                                name={
                                  portalOptions.find(
                                    (p) => p.value === selectedPortal
                                  )?.label
                                }
                                stroke="#8b5cf6"
                                strokeWidth={1}
                              >
                                <LabelList
                                  dataKey={selectedPortal}
                                  position="top"
                                  fontSize={isSmall ? 8 : 10}
                                  fill="#374151"
                                />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Small dataset - responsive container */
                  <div className="w-full h-[300px] sm:h-[400px] md:h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredData}
                        margin={{
                          top: isSmall ? 30 : 60,
                          right: isSmall ? 5 : 20,
                          left: isSmall ? 5 : 20,
                          bottom: isSmall ? 50 : 60,
                        }}
                        barCategoryGap="10%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="snapshot_date"
                          tick={{ fontSize: isSmall ? 10 : 12 }}
                          stroke="#475569"
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return !isNaN(date)
                              ? date.toLocaleDateString("en-GB")
                              : value;
                          }}
                          interval={filteredData.length > 5 ? 1 : 0}
                          angle={isSmall || filteredData.length > 5 ? -45 : 0}
                          textAnchor={
                            isSmall || filteredData.length > 5
                              ? "end"
                              : "middle"
                          }
                          height={isSmall || filteredData.length > 5 ? 60 : 60}
                        />
                        <YAxis
                          tick={{ fontSize: isSmall ? 10 : 12 }}
                          stroke="#475569"
                          width={isSmall ? 30 : 50}
                          domain={[0, "auto"]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            fontSize: isSmall ? "10px" : "12px",
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: isSmall ? "10px" : "12px" }}
                        />
                        <Bar
                          dataKey={selectedPortal}
                          fill="#a78bfa"
                          name={
                            portalOptions.find(
                              (p) => p.value === selectedPortal
                            )?.label
                          }
                          stroke="#8bcf6"
                          strokeWidth={1}
                        >
                          <LabelList
                            dataKey={selectedPortal}
                            position="top"
                            fontSize={isSmall ? 8 : 11}
                            fill="#374151"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {timeRange === "weekly"
                ? `No weekly data found for ${new Date().toLocaleDateString(
                    "en-GB",
                    { month: "long", year: "numeric" }
                  )}${selectedDept ? ` for "${selectedDept}"` : ""}.`
                : selectedDept
                ? `No ${timeRange} data found for "${selectedDept}".`
                : "Please select a department to view the chart data."}
            </p>
            {selectedDept && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Possible reasons:
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>
                    • No complaints have been recorded for this department
                  </li>
                  <li>
                    • No data exists for the selected time range ({timeRange})
                    {timeRange === "weekly" && " in current month"}
                  </li>
                  <li>• Data might be available in a different time range</li>
                  <li>• Department data is still being processed</li>
                </ul>
                <div className="mt-3 text-xs text-blue-600">
                  Try selecting a different time range or department to view
                  available data.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentNameGraph;
