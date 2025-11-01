import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const JandarshanGraph = () => {
  const [data, setData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("bar");
  const [viewType, setViewType] = useState("department"); // department, weekly, monthly
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState(null);
  const [totalStats, setTotalStats] = useState({});

  useEffect(() => {
    fetchJandarshanData();
  }, [viewType, dateRange]);

  const fetchJandarshanData = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const queryParams = new URLSearchParams({
        view: viewType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await fetch(`/api/jandarshan-data?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();

      if (viewType === "department") {
        setData(result.departmentData || []);
      } else {
        setTimeSeriesData(result.timeSeriesData || []);
      }
      setTotalStats(result.totalStats || {});
    } catch (err) {
      setError(err.message);
      // Mock data for demonstration
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    if (viewType === "department") {
      setData([
        {
          department_name: "Education",
          cm_jandarshan: 150,
          collector_jandarshan: 89,
          call_center: 234,
          pgPortal: 67,
          jansikayatPostMail: 45,
          jansikayatWEB: 123,
          total_complaints: 708,
        },
        {
          department_name: "Health",
          cm_jandarshan: 120,
          collector_jandarshan: 76,
          call_center: 189,
          pgPortal: 54,
          jansikayatPostMail: 32,
          jansikayatWEB: 98,
          total_complaints: 569,
        },
        {
          department_name: "Public Works",
          cm_jandarshan: 98,
          collector_jandarshan: 134,
          call_center: 267,
          pgPortal: 89,
          jansikayatPostMail: 67,
          jansikayatWEB: 156,
          total_complaints: 811,
        },
        {
          department_name: "Revenue",
          cm_jandarshan: 203,
          collector_jandarshan: 167,
          call_center: 345,
          pgPortal: 123,
          jansikayatPostMail: 89,
          jansikayatWEB: 234,
          total_complaints: 1161,
        },
      ]);
    } else {
      // Generate mock time series data
      const mockTimeData = [];
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      const timeUnit = viewType === "weekly" ? 7 : 30;

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + timeUnit)
      ) {
        const periodLabel =
          viewType === "weekly"
            ? `Week of ${d.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              })}`
            : d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

        mockTimeData.push({
          period: periodLabel,
          cm_jandarshan: Math.floor(Math.random() * 200) + 50,
          collector_jandarshan: Math.floor(Math.random() * 150) + 40,
          call_center: Math.floor(Math.random() * 300) + 100,
          pgPortal: Math.floor(Math.random() * 100) + 30,
          jansikayatPostMail: Math.floor(Math.random() * 80) + 20,
          jansikayatWEB: Math.floor(Math.random() * 200) + 60,
          total_complaints: 0,
        });

        // Calculate total for each period
        const lastIndex = mockTimeData.length - 1;
        const item = mockTimeData[lastIndex];
        item.total_complaints =
          item.cm_jandarshan +
          item.collector_jandarshan +
          item.call_center +
          item.pgPortal +
          item.jansikayatPostMail +
          item.jansikayatWEB;
      }

      setTimeSeriesData(mockTimeData);
    }

    // Mock total stats
    setTotalStats({
      totalComplaints: 3249,
      avgPerDay: 108,
      highestCategory: "Call Center",
      lowestCategory: "Jansikayat Post Mail",
    });
  };

  const colors = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const currentData = viewType === "department" ? data : timeSeriesData;
  const xAxisKey = viewType === "department" ? "department_name" : "period";

  const renderTimeSeriesChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={timeSeriesData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="cm_jandarshan"
          stackId="1"
          stroke="#0088FE"
          fill="#0088FE"
        />
        <Area
          type="monotone"
          dataKey="collector_jandarshan"
          stackId="1"
          stroke="#00C49F"
          fill="#00C49F"
        />
        <Area
          type="monotone"
          dataKey="call_center"
          stackId="1"
          stroke="#FFBB28"
          fill="#FFBB28"
        />
        <Area
          type="monotone"
          dataKey="pgPortal"
          stackId="1"
          stroke="#FF8042"
          fill="#FF8042"
        />
        <Area
          type="monotone"
          dataKey="jansikayatWEB"
          stackId="1"
          stroke="#8884D8"
          fill="#8884D8"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={currentData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="cm_jandarshan" fill="#0088FE" name="CM Jandarshan" />
        <Bar
          dataKey="collector_jandarshan"
          fill="#00C49F"
          name="Collector Jandarshan"
        />
        <Bar dataKey="call_center" fill="#FFBB28" name="Call Center" />
        <Bar dataKey="pgPortal" fill="#FF8042" name="PG Portal" />
        <Bar dataKey="jansikayatWEB" fill="#8884D8" name="Jansikayat Web" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    const pieData = currentData.map((item, index) => ({
      name: item[xAxisKey],
      value: item.total_complaints,
      fill: colors[index % colors.length],
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={currentData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="total_complaints"
          stroke="#8884d8"
          strokeWidth={3}
        />
        <Line
          type="monotone"
          dataKey="cm_jandarshan"
          stroke="#82ca9d"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="collector_jandarshan"
          stroke="#ffc658"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 m-4">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          📊 Jandarshan Complaints Analytics
        </h2>

        {/* View Type Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewType("department")}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              viewType === "department"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🏛️ Departments
          </button>
          <button
            onClick={() => setViewType("weekly")}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              viewType === "weekly"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📅 Weekly
          </button>
          <button
            onClick={() => setViewType("monthly")}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              viewType === "monthly"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📊 Monthly
          </button>
        </div>
      </div>

      {/* Date Range Selector for Time Views */}
      {(viewType === "weekly" || viewType === "monthly") && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">📅 Date Range</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setChartType("bar")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            chartType === "bar"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📊 Bar Chart
        </button>
        <button
          onClick={() => setChartType("pie")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            chartType === "pie"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🥧 Pie Chart
        </button>
        <button
          onClick={() => setChartType("line")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            chartType === "line"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📈 Line Chart
        </button>
        {(viewType === "weekly" || viewType === "monthly") && (
          <button
            onClick={() => setChartType("area")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              chartType === "area"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📊 Area Chart
          </button>
        )}
      </div>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-medium">⚠️ Using demo data: {error}</p>
        </div>
      )}

      {/* Summary Stats */}
      {Object.keys(totalStats).length > 0 && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800">Total Complaints</h4>
            <p className="text-2xl font-bold text-blue-600">
              {totalStats.totalComplaints || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800">Avg Per Day</h4>
            <p className="text-2xl font-bold text-green-600">
              {totalStats.avgPerDay || 0}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800">Highest Category</h4>
            <p className="text-sm font-bold text-yellow-600">
              {totalStats.highestCategory || "N/A"}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800">Lowest Category</h4>
            <p className="text-sm font-bold text-red-600">
              {totalStats.lowestCategory || "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Chart Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        {chartType === "bar" && renderBarChart()}
        {chartType === "pie" && renderPieChart()}
        {chartType === "line" && renderLineChart()}
        {chartType === "area" &&
          (viewType === "weekly" || viewType === "monthly") &&
          renderTimeSeriesChart()}
      </div>

      {/* Data Cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentData.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg"
          >
            <h3 className="font-semibold text-sm text-gray-800 truncate">
              {item[xAxisKey]}
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {item.total_complaints}
            </p>
            <p className="text-xs text-gray-600">Total Complaints</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JandarshanGraph;
