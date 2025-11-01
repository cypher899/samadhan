// routes/recent.js
import express from "express";
import db from "../config/database.js"; // if db is not in app.locals

const router = express.Router();

router.get("/", async (req, res) => {
  const showAll = req.query.all === "true";

  const query = `
    SELECT
      main_department AS department,
      department_name AS office,
      officer_designation AS officerPost,
      cm_jandarshan AS cmJanDarshan,
      collector_jandarshan AS collectorJanDarshan,
      jansikayatPostMail AS postMail,
      jansikayatWEB AS web,
      pgPortal,
      call_center AS callCenter,
      total_complaints AS total
    FROM jandarshan_data
    ${showAll ? "" : "ORDER BY total_complaints DESC LIMIT 5"}
  `;

  try {
    // Set connection charset before query
    await db.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

    const [rows] = await db.query(query);

    // Ensure response has correct content type
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching recent complaints:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
