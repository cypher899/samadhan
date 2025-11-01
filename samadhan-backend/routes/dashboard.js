import express from "express";
import db from "../config/database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Get latest entry from dashboard_stats
    const [statsResult] = await db.query(`
      SELECT total_complaints, pending, resolved
      FROM dashboard_stats
      ORDER BY createdAt DESC
      LIMIT 1
    `);

    const stats = statsResult[0] || {
      total_complaints: 0,
      pending: 0,
      resolved: 0,
    };

    // Get source-wise totals from jandarshan_data
    const [sourcesResult] = await db.query(`
      SELECT
        SUM(cm_jandarshan) AS cm,
        SUM(collector_jandarshan) AS collector,
        SUM(jansikayatPostMail) AS post,
        SUM(jansikayatWEB) AS web,
        SUM(pgPortal) AS pg,
        SUM(call_center) AS call_center
      FROM jandarshan_data
    `);

    const sources = sourcesResult[0];

    res.json({
      total_complaints: stats.total_complaints || 0,
      pending: stats.pending || 0,
      resolved: stats.resolved || 0,
      cm: sources.cm || 0,
      collector: sources.collector || 0,
      post: sources.post || 0,
      web: sources.web || 0,
      pg: sources.pg || 0,
      call_center: sources.call_center || 0,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
