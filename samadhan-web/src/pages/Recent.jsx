// src/components/Recent.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Recent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  // Remove showAll state
  const [sortField, setSortField] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [groupBy, setGroupBy] = useState(""); // New state for group by
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://165.22.208.62:3108";
    // Always fetch all data
    const endpoint = `${baseURL}/recent?all=true`;

    // console.log("Fetching from:", endpoint);

    axios
      .get(endpoint, {
        headers: {
          Accept: "application/json; charset=utf-8",
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      .then((res) => {
        // console.log("Response data:", res.data);
        const responseData = Array.isArray(res.data) ? res.data : [];
        setData(responseData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error loading recent complaints:", err);
        setData([]);
        setLoading(false);
      });
  }, []); // Remove showAll dependency

  // Sort data when sortField changes
  const sortedData = React.useMemo(() => {
    if (!sortField || !Array.isArray(data)) return data;
    return [...data].sort((a, b) => {
      if (typeof a[sortField] === "number") {
        return sortAsc
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      }
      return sortAsc
        ? String(a[sortField]).localeCompare(String(b[sortField]))
        : String(b[sortField]).localeCompare(String(a[sortField]));
    });
  }, [data, sortField, sortAsc]);

  // Group data by selected field
  const groupedData = React.useMemo(() => {
    if (!groupBy || !Array.isArray(sortedData)) return sortedData;
    const groups = {};
    sortedData.forEach((row) => {
      const key = row[groupBy] || "अन्य";
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    return groups;
  }, [sortedData, groupBy]);

  // Pagination logic
  const totalPages = React.useMemo(() => {
    if (groupBy) return 1;
    return Math.ceil(
      (Array.isArray(sortedData) ? sortedData.length : 0) / rowsPerPage
    );
  }, [sortedData, groupBy, rowsPerPage]);

  const paginatedData = React.useMemo(() => {
    if (groupBy) return groupedData;
    if (!Array.isArray(sortedData)) return [];
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage, groupBy, groupedData]);

  // Mobile card layout renderer for better responsiveness on narrow screens
  const MobileCards = ({ dataset }) => {
    if (!Array.isArray(dataset) || dataset.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4 border rounded-lg bg-white">
          कोई शिकायत उपलब्ध नहीं है。
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {dataset.map((entry, idx) => {
          const metrics = [
            { label: "मुख्यमंत्री", value: entry.cmJanDarshan },
            { label: "कलेक्टर", value: entry.collectorJanDarshan },
            { label: "डाक/मेल", value: entry.postMail },
            { label: "वेब", value: entry.web },
            { label: "पीजी", value: entry.pgPortal },
            { label: "कॉल", value: entry.callCenter },
          ];
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#dce3f0] p-4 shadow-sm"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#34699A] font-semibold truncate">
                    {entry.department}
                  </p>
                  <p className="text-sm font-medium text-gray-800 break-words mt-0.5">
                    {entry.office}
                  </p>
                  <p className="text-xs text-gray-600 break-words mt-0.5">
                    {entry.officerPost}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate("/add-complaint", {
                      state: {
                        editData: {
                          department: entry.department,
                          office: entry.office,
                          officerPost: entry.officerPost,
                        },
                      },
                    });
                  }}
                  className="shrink-0 bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded transition"
                  aria-label="Edit complaint"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="bg-blue-50 rounded-md px-2 py-1 flex flex-col items-center"
                  >
                    <span className="text-[10px] text-gray-600 leading-tight">
                      {m.label}
                    </span>
                    <span className="text-xs font-semibold text-[#34699A]">
                      {m.value}
                    </span>
                  </div>
                ))}
                <div className="col-span-3 bg-[#34699A] text-white rounded-md px-3 py-1 flex items-center justify-between mt-1">
                  <span className="text-xs font-medium">कुल</span>
                  <span className="text-sm font-bold">{entry.total}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // If clicking the same field, toggle the order
      setSortAsc(!sortAsc);
    } else {
      // If clicking a new field, set it and default to ascending
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (loading) {
    return <p className="text-center text-lg py-10">लोड हो रहा है...</p>;
  }

  return (
    <div className="px-3 sm:px-4 py-4 sm:py-6 w-full">
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-3 md:gap-4 mb-4 flex-wrap">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            className="px-3 py-2 border rounded-xl w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#34699A]"
            value={sortField}
            onChange={(e) => {
              setSortField(e.target.value);
              setSortAsc(true); // Default to ascending when selecting new field
            }}
          >
            <option value="">Sort by...</option>
            <option value="department">मुख्य विभाग</option>
            <option value="office">कार्यालय का नाम</option>
            <option value="officerPost">अधिकारी का पद</option>
            <option value="cmJanDarshan">मुख्यमंत्री जनदर्शन</option>
            <option value="collectorJanDarshan">कलेक्टर जनदर्शन</option>
            <option value="postMail">जनशिकायत (डाक/मेल)</option>
            <option value="web">जनशिकायत (वेब)</option>
            <option value="pgPortal">पीजी पोर्टल</option>
            <option value="callCenter">कॉल सेंटर</option>
            <option value="total">कुल</option>
          </select>
          <button
            className={`px-4 py-2 text-white font-semibold rounded-xl transition w-full sm:w-auto ${
              !sortField
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#7495c3] hover:bg-[#4d6c92]"
            }`}
            onClick={() => setSortAsc((prev) => !prev)}
            disabled={!sortField}
          >
            {sortField ? (sortAsc ? "⬆️ Asc" : "⬇️ Desc") : "Sort Order"}
          </button>
          <select
            className="px-3 py-2 border rounded-xl w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#34699A]"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="">Group by...</option>
            <option value="department">मुख्य विभाग</option>
            <option value="office">कार्यालय का नाम</option>
            <option value="officerPost">अधिकारी का पद</option>
          </select>
        </div>
      </div>

      {/* Data Table - Mobile & Desktop */}
      <div
        className="overflow-x-auto rounded-lg shadow-md border border-[#dce3f0] bg-white"
        role="region"
        tabIndex="0"
      >
        <table className="min-w-full w-full border-collapse border border-[#dce3f0] text-xs sm:text-sm bg-white">
          <caption className="caption-top text-left text-sm sm:text-base lg:text-lg font-semibold p-2 sm:p-3 lg:p-4 text-[#34699A] bg-[#f0f8ff]">
            हाल की शिकायतें
          </caption>
          <thead className="bg-[#34699A] text-white font-semibold text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
            <tr>
              {[
                {
                  label: "मुख्य विभाग",
                  field: "department",
                },
                {
                  label: "कार्यालय का नाम",
                  field: "office",
                },
                {
                  label: "अधिकारी का पद",
                  field: "officerPost",
                },
                {
                  label: "मुख्यमंत्री जनदर्शन",
                  field: "cmJanDarshan",
                },
                {
                  label: "कलेक्टर जनदर्शन",
                  field: "collectorJanDarshan",
                },
                {
                  label: "जनशिकायत (डाक/मेल)",
                  field: "postMail",
                },
                {
                  label: "जनशिकायत (वेब)",
                  field: "web",
                },
                {
                  label: "पीजी पोर्टल",
                  field: "pgPortal",
                },
                {
                  label: "कॉल सेंटर",
                  field: "callCenter",
                },
                {
                  label: "कुल",
                  field: "total",
                },
                {
                  label: "एक्शन",
                  field: null,
                },
              ].map((heading, index) => (
                <th
                  key={index}
                  className={`border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 sticky top-0 bg-[#34699A] break-words ${
                    heading.field
                      ? "cursor-pointer hover:bg-[#2a5a8a] select-none"
                      : ""
                  }`}
                  onClick={() => heading.field && handleSort(heading.field)}
                  style={{ minWidth: index < 3 ? "60px" : "40px" }}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="leading-tight">{heading.label}</span>
                    {heading.field && sortField === heading.field && (
                      <span className="text-[8px] xs:text-xs">
                        {sortAsc ? "⬆️" : "⬇️"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupBy ? (
              Object.entries(groupedData).map(([group, rows]) => (
                <React.Fragment key={group}>
                  <tr className="bg-blue-50">
                    <td
                      colSpan={11}
                      className="font-bold text-blue-700 text-left px-2 sm:px-4 py-1 sm:py-2 border border-[#dce3f0] text-xs sm:text-sm"
                    >
                      {group}
                    </td>
                  </tr>
                  {Array.isArray(rows) &&
                    rows.map((entry, index) => (
                      <tr
                        key={index}
                        className="hover:bg-[#e3efff] transition-colors text-center"
                      >
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 whitespace-pre-wrap break-words text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                          {entry.department}
                        </td>
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 whitespace-pre-wrap break-words text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                          {entry.office}
                        </td>
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 break-words text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                          {entry.officerPost}
                        </td>
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                          {entry.cmJanDarshan}
                        </td>
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                          {entry.collectorJanDarshan}
                        </td>
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                          {entry.postMail}
                        </td>
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                          {entry.web}
                        </td>
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                          {entry.pgPortal}
                        </td>
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                          {entry.callCenter}
                        </td>
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 font-bold text-[#34699A] text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                          {entry.total}
                        </td>
                        <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
                          <button
                            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-1 xs:px-2 sm:px-3 lg:px-4 py-1 rounded transition text-[8px] xs:text-[9px] sm:text-xs md:text-sm"
                            onClick={() => {
                              navigate("/add-complaint", {
                                state: {
                                  editData: {
                                    department: entry.department,
                                    office: entry.office,
                                    officerPost: entry.officerPost,
                                  },
                                },
                              });
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))
            ) : !Array.isArray(paginatedData) || paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="text-center text-gray-500 py-4 border border-[#dce3f0] text-xs sm:text-sm"
                >
                  कोई शिकायत उपलब्ध नहीं है。
                </td>
              </tr>
            ) : (
              Array.isArray(paginatedData) &&
              paginatedData.map((entry, index) => (
                <tr
                  key={index}
                  className="hover:bg-[#e3efff] transition-colors text-center"
                >
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 whitespace-pre-wrap break-words text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    {entry.department}
                  </td>
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 whitespace-pre-wrap break-words text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    {entry.office}
                  </td>
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 break-words text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    {entry.officerPost}
                  </td>
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    {entry.cmJanDarshan}
                  </td>
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    {entry.collectorJanDarshan}
                  </td>
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    {entry.postMail}
                  </td>
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    {entry.web}
                  </td>
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    {entry.pgPortal}
                  </td>
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    {entry.callCenter}
                  </td>
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2 font-bold text-[#34699A] text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    {entry.total}
                  </td>
                  <td className="border border-[#dce3f0] px-1 xs:px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-1 xs:px-2 sm:px-3 lg:px-4 py-1 rounded transition text-[8px] xs:text-[9px] sm:text-xs md:text-sm"
                      onClick={() => {
                        navigate("/add-complaint", {
                          state: {
                            editData: {
                              department: entry.department,
                              office: entry.office,
                              officerPost: entry.officerPost,
                            },
                          },
                        });
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {!groupBy && totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 py-2 sm:py-4">
            <button
              className="px-2 sm:px-3 py-1 rounded bg-[#34699A] text-white font-semibold disabled:opacity-50 text-xs sm:text-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-2 sm:px-3 py-1 rounded font-semibold text-xs sm:text-sm ${
                  currentPage === i + 1
                    ? "bg-[#234766] text-white"
                    : "bg-gray-100 text-[#34699A] hover:bg-[#e3efff]"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-2 sm:px-3 py-1 rounded bg-[#34699A] text-white font-semibold disabled:opacity-50 text-xs sm:text-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recent;
