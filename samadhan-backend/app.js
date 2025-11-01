// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import recent from "./routes/recent.js";
import db from "./config/database.js";
import adminRoutes from "./routes/adminRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import suggestionRoutes from "./routes/suggestionRoutes.js";
import { findAdminByEmailAndPassword } from "./models/adminModel.js";
import dashboardRouter from "../backend/routes/dashboard.js";
import stats from "./routes/stats.js";
import updateStats from "./routes/update.js";
dotenv.config();

const app = express();
const BASE_URL = process.env.BASE_URL;
// const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

// ✅ CORS setup
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json({ charset: "utf-8" }));
app.use(express.urlencoded({ extended: true, charset: "utf-8" }));

// Add UTF-8 headers middleware
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// ✅ Routes

app.use("/updateStats", updateStats);
app.use("/stats", stats);
app.use("/dashboard", dashboardRouter);
app.use("/api", suggestionRoutes);
app.use("/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/recent", recent);

// ✅ Admin login route (with debug logs)
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body; // Remove captchaToken
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    // Remove captcha verification
    // Debug: Log credentials for troubleshooting (remove in production)
    // console.log("Login attempt:", { email, password });
    // Make sure your admin table has a user with this email and password
    const user = await findAdminByEmailAndPassword(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const { password: _, ...safeUser } = user;
    res.json({ message: "Login successful", user: safeUser });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// ✅ Additional complaint-related routes (called directly by frontend)
app.post("/get-complaint-data", async (req, res) => {
  const { mainDepartment, departmentName, officerDesignation } = req.body;

  const query = `
    SELECT * FROM jandarshan_data 
    WHERE main_department = ? AND department_name = ? AND officer_designation = ?
  `;

  try {
    const [results] = await db.query(query, [
      mainDepartment,
      departmentName,
      officerDesignation,
    ]);

    if (results.length > 0) {
      const data = results[0];
      res.json({
        success: true,
        data: {
          cm_jandarshan: data.cm_jandarshan,
          collector_jandarshan: data.collector_jandarshan,
          jansikayatPostMail: data.jansikayatPostMail,
          jansikayatWEB: data.jansikayatWEB,
          pgPortal: data.pgPortal,
          call_center: data.call_center,
          total_complaints: data.total_complaints,
        },
      });
    } else {
      res.json({ success: false, message: "No data found" });
    }
  } catch (err) {
    console.error("Error fetching complaint data:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/get-officer-details", async (req, res) => {
  const { mainDepartment, departmentName, officerDesignation } = req.body;

  const query = `
    SELECT cr.name, cr.contact_no 
    FROM complaint_reciever cr
    JOIN jandarshan_data jd ON cr.complaint_id = jd.id
    WHERE jd.main_department = ? AND jd.department_name = ? AND jd.officer_designation = ?
  `;

  try {
    const [results] = await db.query(query, [
      mainDepartment,
      departmentName,
      officerDesignation,
    ]);

    if (results.length > 0) {
      res.json({
        success: true,
        data: results[0],
      });
    } else {
      res.json({ success: false, message: "No officer found" });
    }
  } catch (err) {
    console.error("Error fetching officer details:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Sample Home Route
app.get("/", async (req, res) => {
  res
    .status(200)
    .json({ message: "Samadhan Backend Is Running Successfully!!" });
});

// ✅ Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running at ${BASE_URL}`);
});
