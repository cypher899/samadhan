import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";

export default function AddComplaintForm() {
  const [officerName, setOfficerName] = useState("");
  const [officerMobile, setOfficerMobile] = useState("");

  const [departmentName, setDepartmentName] = useState("");
  const [officerDesignation, setOfficerDesignation] = useState("");
  // const [recordExists, setRecordExists] = useState(false);

  const [cmJanDarshan, setCmJanDarshan] = useState("0");
  const [collectorJanDarshan, setCollectorJanDarshan] = useState("0");
  const [postMail, setPostMail] = useState("0");
  const [web, setWeb] = useState("0");
  const [pgPortal, setPgPortal] = useState("0");
  const [callCenter, setCallCenter] = useState("0");

  const [suggestions, setSuggestions] = useState([]);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [mainDepartment, setMainDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [footerTime, setFooterTime] = useState(Date.now());
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const Navigate = useNavigate();
  const location = useLocation();

  // Calculate total complaints
  useEffect(() => {
    const total =
      Number(cmJanDarshan || 0) +
      Number(collectorJanDarshan || 0) +
      Number(postMail || 0) +
      Number(web || 0) +
      Number(pgPortal || 0) +
      Number(callCenter || 0);
    setTotalComplaints(total);
  }, [cmJanDarshan, collectorJanDarshan, postMail, web, pgPortal, callCenter]);

  useEffect(() => {
    if (!mainDepartment && !departmentName && !officerDesignation) {
      setCmJanDarshan("0");
      setCollectorJanDarshan("0");
      setPostMail("0");
      setWeb("0");
      setPgPortal("0");
      setCallCenter("0");
    }
  }, [mainDepartment, departmentName, officerDesignation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all required fields
    if (
      !mainDepartment ||
      !departmentName ||
      !officerDesignation ||
      !officerName ||
      !officerMobile ||
      cmJanDarshan === "" ||
      collectorJanDarshan === "" ||
      postMail === "" ||
      web === "" ||
      pgPortal === "" ||
      callCenter === ""
    ) {
      alert("सभी फ़ील्ड्स भरना आवश्यक है।");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        main_department: mainDepartment,
        department_name: departmentName,
        officer_designation: officerDesignation,
        officer_name: officerName,
        officer_mobile: officerMobile,
        cm_jandarshan: parseInt(cmJanDarshan || 0),
        collector_jandarshan: parseInt(collectorJanDarshan || 0),
        jansikayatPostMail: parseInt(postMail || 0),
        jansikayatWEB: parseInt(web || 0),
        pgPortal: parseInt(pgPortal || 0),
        call_center: parseInt(callCenter || 0),
        total_complaints: totalComplaints,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/complaints/add-complaint`,
        payload
      );

      if (res.status === 200 || res.status === 201) {
        alert("शिकायत सफलतापूर्वक दर्ज हो गई!");
        setFooterTime(Date.now()); // Update footer time on successful submit
        setLastUpdate(Date.now()); // Update last update time
        Navigate("/"); // change this to your desired route
      } else {
        alert("कुछ गलत हो गया। कृपया पुनः प्रयास करें।");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("डेटा सबमिट करने में त्रुटि हुई।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/suggestions`)
      .then((res) => {
        // Fix: Ensure res.data is an array
        const arr = Array.isArray(res.data) ? res.data : res.data.data || [];
        const cleanData = arr.map((s) => ({
          main_department: s.main_department || s.mainDepartment || "",
          department_name: s.department_name || s.departmentName || "",
          officer_designation:
            s.officer_designation || s.officerDesignation || "",
        }));
        setSuggestions(cleanData);
      })
      .catch((err) => console.error("Failed to fetch suggestions:", err));
  }, []);

  // Filter suggestions for department and designation
  const filteredDepartments = suggestions
    .filter((s) => s.main_department === mainDepartment)
    .map((s) => s.department_name);
  const uniqueFilteredDepartments = [...new Set(filteredDepartments)];

  const filteredDesignations = suggestions
    .filter(
      (s) =>
        s.main_department === mainDepartment &&
        s.department_name === departmentName
    )
    .map((s) => s.officer_designation);
  const uniqueFilteredDesignations = [...new Set(filteredDesignations)];

  // Autofill logic for edit (only first 3 columns)
  useEffect(() => {
    if (location.state && location.state.editData) {
      const d = location.state.editData;
      setMainDepartment(d.department || "");
      setDepartmentName(d.office || "");
      setOfficerDesignation(d.officerPost || "");
    }
  }, [location.state]);

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen">
        <div className="text-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">
            नया शिकायत दर्ज करें
          </h1>
          <p className="text-lg text-blue-400">Register New Complaint</p>
        </div>
        <main className="flex-1 mb-10 flex items-center justify-center">
          <form
            className="bg-white p-4 md:p-10 rounded-3xl border-2 border-blue-300 shadow-[0_1.5px_0_0_rgb(147,197,253)] flex flex-col gap-5 w-[90vw] md:w-[60vw]"
            onSubmit={handleSubmit}
          >
            {/* Department Fields */}
            <div className="flex flex-col w-full gap-4">
              {/* Main Department */}
              <label className="flex flex-col font-medium text-black gap-1">
                मुख्य विभाग
                <input
                  list="mainDepartments"
                  placeholder="मुख्य विभाग चुनें"
                  value={mainDepartment}
                  onChange={(e) => {
                    setMainDepartment(e.target.value);
                    setDepartmentName("");
                    setOfficerDesignation("");
                  }}
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
                <datalist id="mainDepartments">
                  {[...new Set(suggestions.map((s) => s.main_department))].map(
                    (dept, i) => (
                      <option key={i} value={dept} />
                    )
                  )}
                </datalist>
              </label>

              {/* Department Name */}
              <label className="flex flex-col font-medium text-black gap-1">
                विभाग का नाम
                <input
                  list="departmentNames"
                  placeholder="विभाग का नाम दर्ज करें"
                  value={departmentName}
                  onChange={(e) => {
                    setDepartmentName(e.target.value);
                    setOfficerDesignation("");
                  }}
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
                <datalist id="departmentNames">
                  {uniqueFilteredDepartments.map((dept, i) => (
                    <option key={i} value={dept} />
                  ))}
                </datalist>
              </label>

              {/* Officer Designation */}
              <label className="flex flex-col font-medium text-black gap-1">
                प्रभारी अधिकारी का पद
                <input
                  list="officerDesignations"
                  placeholder="प्रभारी अधिकारी का पद"
                  value={officerDesignation}
                  onChange={(e) => setOfficerDesignation(e.target.value)}
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
                <datalist id="officerDesignations">
                  {uniqueFilteredDesignations.map((designation, i) => (
                    <option key={i} value={designation} />
                  ))}
                </datalist>
              </label>

              {/* Officer Name */}
              <label className="flex flex-col font-medium text-black">
                प्रभारी अधिकारी का नाम
                <input
                  type="text"
                  placeholder="नाम"
                  value={officerName}
                  onChange={(e) =>
                    setOfficerName(
                      e.target.value.replace(/[^a-zA-Z\s\u0900-\u097F]/g, "")
                    )
                  }
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
              </label>

              {/* Officer Mobile */}
              <label className="flex flex-col font-medium text-black">
                मोबाइल नंबर
                <input
                  type="tel"
                  placeholder="मोबाइल नंबर"
                  value={officerMobile}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) {
                      setOfficerMobile(input);
                    }
                  }}
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
              </label>
            </div>

            <hr className="border-blue-300 w-full" />

            {/* Sources Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
              <label className="flex flex-col font-medium text-black">
                मुख्यमंत्री जनदर्शन
                <input
                  type="number"
                  value={cmJanDarshan}
                  onChange={(e) => setCmJanDarshan(e.target.value)}
                  min="0"
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
              </label>
              <label className="flex flex-col font-medium text-black">
                कलेक्टर जनदर्शन
                <input
                  type="number"
                  value={collectorJanDarshan}
                  onChange={(e) => setCollectorJanDarshan(e.target.value)}
                  min="0"
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
              </label>
              <label className="flex flex-col font-medium text-black">
                जनदर्शन (डाक / मेल)
                <input
                  type="number"
                  value={postMail}
                  onChange={(e) => setPostMail(e.target.value)}
                  min="0"
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
              </label>
              <label className="flex flex-col font-medium text-black">
                जनदर्शन (वेब)
                <input
                  type="number"
                  value={web}
                  onChange={(e) => setWeb(e.target.value)}
                  min="0"
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
              </label>
              <label className="flex flex-col font-medium text-black">
                पीजी पोर्टल
                <input
                  type="number"
                  value={pgPortal}
                  onChange={(e) => setPgPortal(e.target.value)}
                  min="0"
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
              </label>
              <label className="flex flex-col font-medium text-black">
                कॉल सेंटर
                <input
                  type="number"
                  value={callCenter}
                  onChange={(e) => setCallCenter(e.target.value)}
                  min="0"
                  required
                  className="border border-blue-300 rounded-xl px-4 py-2 bg-blue-50"
                />
              </label>

              <div className="flex flex-col font-medium text-black">
                कुल शिकायतें = <b>{totalComplaints}</b>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${
                loading
                  ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              } rounded-xl px-6 py-3 text-lg font-semibold mt-4 transition-all duration-200`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </main>
        <Footer refreshTime={footerTime} lastUpdate={lastUpdate} />
      </div>
    </>
  );
}
