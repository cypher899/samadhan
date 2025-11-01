import express from "express";
import db from "../config/database.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const body = req.body || {};

    // Normalization helper
    const norm = (o) => ({
      pending: Number(o?.pending ?? 0),
      resolve: Number(o?.resolve ?? 0),
    });

    // Accept legacy / alt keys
    const payload = {
      callcenter: norm(body.callcenter || body.callCenter),
      cm_jandarshan: norm(body.cm_jandarshan || body.cmJandarshan),
      coll_jandarshan: norm(body.coll_jandarshan || body.collectorJandarshan),
      jansikayatpostmail: norm(
        body.jansikayatpostmail ||
          body.jansikayatPostMail ||
          body.jansikayatPost ||
          body.postMail
      ),
      jansikayatweb: norm(body.jansikayatweb || body.jansikayatWeb),
      pgportal: norm(body.pgportal || body.pgPortal),
    };

    const portalTables = [
      "callcenter",
      "cm_jandarshan",
      "coll_jandarshan",
      "jansikayatpostmail",
      "jansikayatweb",
      "pgportal",
    ];

    // Validate: Prevent inserting if any portal data is missing or not a number
    for (const table of portalTables) {
      const d = payload[table];
      if (
        typeof d.pending !== "number" ||
        typeof d.resolve !== "number" ||
        isNaN(d.pending) ||
        isNaN(d.resolve)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing data for ${table}`,
        });
      }
    }

    // 1. Insert a new snapshot row in each portal table
    for (const table of portalTables) {
      const d = payload[table];
      await db.query(`INSERT INTO ${table} (pending, resolve) VALUES (?, ?)`, [
        d.pending,
        d.resolve,
      ]);
    }

    // 2. Update stats_form (no insert if source row absent)
    for (const source of portalTables) {
      const d = payload[source];
      const [rows] = await db.query(
        "SELECT id FROM stats_form WHERE sources = ?",
        [source]
      );
      if (rows.length > 0) {
        await db.query(
          "UPDATE stats_form SET pending = ?, resolve = ?, createdAt = NOW() WHERE id = ?",
          [d.pending, d.resolve, rows[0].id]
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Statistics updated successfully ✅",
      stored: payload,
    });
  } catch (error) {
    console.error("🔥 Error updating stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update statistics ❌",
      error: error.message,
    });
  }
});

export default router;
