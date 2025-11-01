import React, { useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { useNavigate } from "react-router-dom"; // Add this import

const Update = () => {
  // State for each section
  const [cmJandarshan, setCmJandarshan] = useState({
    pending: "",
    resolve: "",
  });
  const [collectorJandarshan, setCollectorJandarshan] = useState({
    pending: "",
    resolve: "",
  });
  const [callcenter, setCallCenter] = useState({ pending: "", resolve: "" });
  const [pgportal, setPgPortal] = useState({ pending: "", resolve: "" });
  const [jansikayatpostmail, setjansikayatpostmail] = useState({
    pending: "",
    resolve: "",
  });
  const [jansikayatweb, setJansikayatWeb] = useState({
    pending: "",
    resolve: "",
  });
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const navigate = useNavigate(); // Add this line

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: all fields required and must be numbers
    const fields = [
      cmJandarshan.pending,
      cmJandarshan.resolve,
      collectorJandarshan.pending,
      collectorJandarshan.resolve,
      callcenter.pending,
      callcenter.resolve,
      pgportal.pending,
      pgportal.resolve,
      jansikayatpostmail.pending,
      jansikayatpostmail.resolve,
      jansikayatweb.pending,
      jansikayatweb.resolve,
    ];
    if (fields.some((v) => v === "" || isNaN(Number(v)))) {
      alert("All fields are required and must be numbers.");
      return;
    }

    const payload = {
      // canonical
      callcenter: {
        pending: Number(callcenter.pending),
        resolve: Number(callcenter.resolve),
      },
      cm_jandarshan: {
        pending: Number(cmJandarshan.pending),
        resolve: Number(cmJandarshan.resolve),
      },
      coll_jandarshan: {
        pending: Number(collectorJandarshan.pending),
        resolve: Number(collectorJandarshan.resolve),
      },
      jansikayatpostmail: {
        pending: Number(jansikayatpostmail.pending),
        resolve: Number(jansikayatpostmail.resolve),
      },
      jansikayatweb: {
        pending: Number(jansikayatweb.pending),
        resolve: Number(jansikayatweb.resolve),
      },
      pgportal: {
        pending: Number(pgportal.pending),
        resolve: Number(pgportal.resolve),
      },
      // legacy duplicates (safe to remove later)
      callCenter: {
        pending: Number(callcenter.pending),
        resolve: Number(callcenter.resolve),
      },
      jansikayatPostMail: {
        pending: Number(jansikayatpostmail.pending),
        resolve: Number(jansikayatpostmail.resolve),
      },
      jansikayatWeb: {
        pending: Number(jansikayatweb.pending),
        resolve: Number(jansikayatweb.resolve),
      },
      pgPortal: {
        pending: Number(pgportal.pending),
        resolve: Number(pgportal.resolve),
      },
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/updateStats`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Stats updated successfully!");
        setLastUpdate(Date.now()); // update lastUpdate time
        navigate("/stats");
      } else {
        alert("Error: " + (data.error || "Failed to update stats"));
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 py-10">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <h2 className="text-3xl font-extrabold mb-10 text-center text-blue-900 tracking-tight">
            Update Stats
          </h2>
          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Heading 1 */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-blue-700 border-b pb-2">
                CM JANDARSHAN
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="cm-pending"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Pending
                  </label>
                  <input
                    id="cm-pending"
                    type="text"
                    placeholder="Enter pending count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={cmJandarshan.pending}
                    onChange={(e) =>
                      setCmJandarshan({
                        ...cmJandarshan,
                        pending: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="cm-resolve"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Resolve
                  </label>
                  <input
                    id="cm-resolve"
                    type="text"
                    placeholder="Enter resolved count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={cmJandarshan.resolve}
                    onChange={(e) =>
                      setCmJandarshan({
                        ...cmJandarshan,
                        resolve: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            {/* Heading 2 */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-blue-700 border-b pb-2">
                Collector JANDARSHAN
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="collector-pending"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Pending
                  </label>
                  <input
                    id="collector-pending"
                    type="text"
                    placeholder="Enter pending count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={collectorJandarshan.pending}
                    onChange={(e) =>
                      setCollectorJandarshan({
                        ...collectorJandarshan,
                        pending: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="collector-resolve"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Resolve
                  </label>
                  <input
                    id="collector-resolve"
                    type="text"
                    placeholder="Enter resolved count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={collectorJandarshan.resolve}
                    onChange={(e) =>
                      setCollectorJandarshan({
                        ...collectorJandarshan,
                        resolve: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            {/* Heading 3 */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-blue-700 border-b pb-2">
                Call Center
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="callcenter-pending"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Pending
                  </label>
                  <input
                    id="callcenter-pending"
                    type="text"
                    placeholder="Enter pending count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={callcenter.pending}
                    onChange={(e) =>
                      setCallCenter({ ...callcenter, pending: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="callcenter-resolve"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Resolve
                  </label>
                  <input
                    id="callcenter-resolve"
                    type="text"
                    placeholder="Enter resolved count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={callcenter.resolve}
                    onChange={(e) =>
                      setCallCenter({ ...callcenter, resolve: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            {/* Heading 4 */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-blue-700 border-b pb-2">
                PG Portal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="pgportal-pending"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Pending
                  </label>
                  <input
                    id="pgportal-pending"
                    type="text"
                    placeholder="Enter pending count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={pgportal.pending}
                    onChange={(e) =>
                      setPgPortal({ ...pgportal, pending: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="pgportal-resolve"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Resolve
                  </label>
                  <input
                    id="pgportal-resolve"
                    type="text"
                    placeholder="Enter resolved count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={pgportal.resolve}
                    onChange={(e) =>
                      setPgPortal({ ...pgportal, resolve: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            {/* Heading 5 */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-blue-700 border-b pb-2">
                Jansikayat Post Mail
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="postmail-pending"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Pending
                  </label>
                  <input
                    id="postmail-pending"
                    type="text"
                    placeholder="Enter pending count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={jansikayatpostmail.pending}
                    onChange={(e) =>
                      setjansikayatpostmail({
                        ...jansikayatpostmail,
                        pending: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="postmail-resolve"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Resolve
                  </label>
                  <input
                    id="postmail-resolve"
                    type="text"
                    placeholder="Enter resolved count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={jansikayatpostmail.resolve}
                    onChange={(e) =>
                      setjansikayatpostmail({
                        ...jansikayatpostmail,
                        resolve: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            {/* Heading 6 */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-blue-700 border-b pb-2">
                Jansikayat Web
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="web-pending"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Pending
                  </label>
                  <input
                    id="web-pending"
                    type="text"
                    placeholder="Enter pending count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={jansikayatweb.pending}
                    onChange={(e) =>
                      setJansikayatWeb({
                        ...jansikayatweb,
                        pending: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="web-resolve"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Resolve
                  </label>
                  <input
                    id="web-resolve"
                    type="text"
                    placeholder="Enter resolved count"
                    required
                    className="border border-blue-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                    value={jansikayatweb.resolve}
                    onChange={(e) =>
                      setJansikayatWeb({
                        ...jansikayatweb,
                        resolve: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="text-center pt-4">
              <button
                type="submit"
                className="bg-blue-700 text-white px-10 py-3 rounded-lg font-semibold shadow hover:bg-blue-800 transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer lastUpdate={lastUpdate} />
    </div>
  );
};

export default Update;
