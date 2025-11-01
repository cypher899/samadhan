import express from "express";
import db from "../config/database.js";

const router = express.Router();

// Get department-wise statistics for each portal
router.get("/departments", async (req, res) => {
  try {
    const { portal, limit = 10 } = req.query;

    // Map portal label to table name
    const portalTableMap = {
      "CM Jandarshan": "cm_jandarshan",
      "Collector Jandarshan": "coll_jandarshan",
      "Call Center": "callcenter",
      "PG Portal": "pgportal",
      "Jansikayat Post Mail": "jansikayatpostmail",
      "Jansikayat Web": "jansikayatweb",
    };

    const tableName = portalTableMap[portal];
    if (!tableName) {
      return res.json({ success: false, message: "Invalid portal selected" });
    }

    // Query department data from the portal table
    const query = `
      SELECT 
        main_department,
        department_name,
        complaints,
        total_complaints
      FROM ${tableName}
      ORDER BY complaints DESC
      LIMIT ?
    `;
    const [rows] = await db.query(query, [Number(limit)]);

    res.json({
      success: true,
      data: rows,
      portal,
    });
  } catch (error) {
    console.error("Department stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department statistics",
      error: error.message,
    });
  }
});

// Get all records from main stats table
router.get("/main", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, pending, resolve, total, createdAt FROM stats ORDER BY createdAt DESC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// FIX: canonical mapping (URL param => physical table)
const PHYSICAL_TABLE_MAP = {
  callCenter: "callcenter",
  jansikayatPostMail: "jansikayatpostmail",
  jansikayatWeb: "jansikayatweb",
  pgPortal: "pgportal",
  coll_jandarshan: "coll_jandarshan",
  cm_jandarshan: "cm_jandarshan",
};

// ADD helper: ensure table has at least one baseline row
async function ensureSeed(table) {
  const [cntRows] = await db.query(`SELECT COUNT(*) AS c FROM ${table}`);
  if (cntRows[0].c === 0) {
    await db.query(`INSERT INTO ${table} (pending, resolve) VALUES (0,0)`);
  }
}

// ADD: latest snapshot for each portal (used by LatestStatsGraph)
router.get("/latest", async (req, res) => {
  try {
    const tables = Object.values(PHYSICAL_TABLE_MAP);
    const results = [];
    for (const table of tables) {
      await ensureSeed(table); // NEW
      const [rows] = await db.query(
        `SELECT pending, resolve, total, createdAt FROM ${table} ORDER BY createdAt DESC LIMIT 1`
      );
      if (rows[0]) {
        results.push({
          portal: table,
          pending: rows[0].pending,
          resolve: rows[0].resolve,
          total: rows[0].total,
          createdAt: rows[0].createdAt,
        });
      }
    }
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("latest endpoint error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generic endpoint for portal tables with timeRange support
router.get("/portal/:name", async (req, res) => {
  try {
    const table = PHYSICAL_TABLE_MAP[req.params.name];
    if (!table) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid portal name" });
    }
    await ensureSeed(table);
    const { timeRange = "all" } = req.query;
    let query = "";

    if (timeRange === "weekly") {
      query = `
      SELECT * FROM (
        SELECT 
          CONCAT(YEAR(createdAt), '-W', LPAD(WEEK(createdAt), 2, '0')) AS id,
          YEAR(createdAt) AS year, 
          WEEK(createdAt) AS week,
          DATE(MIN(createdAt)) AS week_start,
          DATE(MAX(createdAt)) AS week_end,
          SUM(COALESCE(pending, 0)) AS pending, 
          SUM(COALESCE(resolve, 0)) AS resolve, 
          SUM(COALESCE(total, 0)) AS total
        FROM ${table}
        WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 16 WEEK)
        GROUP BY YEAR(createdAt), WEEK(createdAt),
                CONCAT(YEAR(createdAt), '-W', LPAD(WEEK(createdAt), 2, '0'))
        ORDER BY week_start DESC
        LIMIT 16
      ) sub
      ORDER BY week_start ASC;

  `;
    } else if (timeRange === "monthly") {
      query = `
    SELECT * FROM (
      SELECT 
        CONCAT(YEAR(createdAt), '-', LPAD(MONTH(createdAt), 2, '0')) AS id,
        YEAR(createdAt) AS year,
        MONTH(createdAt) AS month,
        MIN(createdAt) AS month_start,
        MAX(createdAt) AS month_end,
        SUM(COALESCE(pending, 0)) AS pending,
        SUM(COALESCE(resolve, 0)) AS resolve,
        SUM(COALESCE(total, 0)) AS total
      FROM ${table}
      WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(createdAt), MONTH(createdAt),
               CONCAT(YEAR(createdAt), '-', LPAD(MONTH(createdAt), 2, '0'))
      ORDER BY month_start DESC
      LIMIT 12
    ) sub
    ORDER BY month_start ASC;
  `;
    } else {
      query = `
    SELECT id, 
           COALESCE(pending, 0) as pending, 
           COALESCE(resolve, 0) as resolve, 
           COALESCE(total, 0) as total, 
           createdAt
    FROM (
        SELECT id, 
               COALESCE(pending, 0) as pending, 
               COALESCE(resolve, 0) as resolve, 
               COALESCE(total, 0) as total, 
               createdAt
        FROM ${table}
        ORDER BY createdAt DESC
        LIMIT 6
    ) sub
    ORDER BY createdAt ASC;
  `;
    }

    const [rows] = await db.query(query);
    // console.log(`Results for ${table}:`, rows.length, "rows", rows);

    // If no data found, create sample data for demonstration
    if (rows.length === 0) {
      // console.log(`No data found for ${table}, creating sample data...`);
      let sampleData = [];

      if (timeRange === "weekly") {
        // Create sample weekly data for last 6 weeks
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i * 7);
          sampleData.push({
            id: `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`,
            year: date.getFullYear(),
            week: Math.ceil(date.getDate() / 7),
            createdAt: date.toISOString().split("T")[0],
            pending: Math.floor(Math.random() * 50) + 10,
            resolve: Math.floor(Math.random() * 30) + 5,
            total: Math.floor(Math.random() * 80) + 20,
          });
        }
      } else if (timeRange === "monthly") {
        // Create sample monthly data for last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          sampleData.push({
            id: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}`,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            createdAt: date.toISOString().split("T")[0],
            pending: Math.floor(Math.random() * 100) + 20,
            resolve: Math.floor(Math.random() * 60) + 10,
            total: Math.floor(Math.random() * 160) + 40,
          });
        }
      } else {
        // Create sample daily data
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          sampleData.push({
            id: i + 1,
            createdAt: date.toISOString().split("T")[0],
            pending: Math.floor(Math.random() * 30) + 5,
            resolve: Math.floor(Math.random() * 20) + 3,
            total: Math.floor(Math.random() * 50) + 10,
          });
        }
      }

      return res.json({ success: true, data: sampleData });
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(`❌ Error in /portal/${req.params.name}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to get total_complaints from main jandarshan_data table
router.get("/main-jandarshan", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT SUM(total_complaints) AS total_complaints FROM jandarshan_data"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// FIX summary-graph to use physical names
router.get("/summary-graph", async (req, res) => {
  try {
    const { timeRange = "all" } = req.query;
    const tables = Object.values(PHYSICAL_TABLE_MAP);
    const summary = [];

    for (const table of tables) {
      await ensureSeed(table);
      let query = "";

      if (timeRange === "weekly") {
        query = `
          SELECT 
            YEAR(createdAt) year, 
            WEEK(createdAt) week,
            MIN(createdAt) createdAt,
            SUM(COALESCE(pending, 0)) pending, 
            SUM(COALESCE(resolve, 0)) resolve, 
            SUM(COALESCE(total, 0)) total
          FROM ${table}
          WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
          GROUP BY year, week
          ORDER BY year DESC, week DESC
          LIMIT 1
        `;
      } else if (timeRange === "monthly") {
        query = `
          SELECT 
            YEAR(createdAt) year, 
            MONTH(createdAt) month,
            MIN(createdAt) createdAt,
            SUM(COALESCE(pending, 0)) pending, 
            SUM(COALESCE(resolve, 0)) resolve, 
            SUM(COALESCE(total, 0)) total
          FROM ${table}
          WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
          GROUP BY year, month
          ORDER BY year DESC, month DESC
          LIMIT 1
        `;
      } else {
        query = `
          SELECT COALESCE(pending, 0) as pending, 
                 COALESCE(resolve, 0) as resolve, 
                 COALESCE(total, 0) as total, 
                 createdAt
          FROM ${table}
          ORDER BY createdAt DESC
          LIMIT 1
        `;
      }

      const [rows] = await db.query(query);

      if (rows.length > 0) {
        summary.push({ portal: table, ...rows[0] });
      } else {
        // Create sample data if no real data exists
        const samplePending = Math.floor(Math.random() * 50) + 10;
        const sampleResolve = Math.floor(Math.random() * 30) + 5;
        summary.push({
          portal: table,
          pending: samplePending,
          resolve: sampleResolve,
          total: samplePending + sampleResolve,
          createdAt: new Date(),
        });
      }
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error("summary-graph error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Department-wise graph from history table
router.get("/department-graph", async (req, res) => {
  try {
    // Optional: filter by date range if needed (e.g., last 7 days)
    // const { from, to } = req.query;
    // let where = "";
    // let params = [];
    // if (from && to) {
    //   where = "WHERE snapshot_date BETWEEN ? AND ?";
    //   params = [from, to];
    // }

    const query = `
      SELECT 
        main_department,
        SUM(cm_jandarshan) AS cm_jandarshan,
        SUM(collector_jandarshan) AS collector_jandarshan,
        SUM(call_center) AS call_center,
        SUM(pgPortal) AS pgPortal,
        SUM(jansikayatPostMail) AS jansikayatPostMail,
        SUM(jansikayatWEB) AS jansikayatWEB,
        SUM(total_complaints) AS total_complaints
      FROM jandarshan_data_history
      GROUP BY main_department
      ORDER BY total_complaints DESC
    `;
    const [rows] = await db.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Department-wise graph from history table (by department_name)
router.get("/department-name-graph", async (req, res) => {
  try {
    const { timeRange = "all", department_name } = req.query;
    let query = "";
    let params = [];

    if (timeRange === "all") {
      query = `
        SELECT 
          department_name,
          LEFT(DATE(snapshot_date), 8) AS snapshot_date,
          cm_jandarshan,
          collector_jandarshan,
          call_center,
          pgPortal,
          jansikayatPostMail,
          jansikayatWEB,
          total_complaints
        FROM jandarshan_data_history
        WHERE department_name IS NOT NULL AND department_name != ''
          ${department_name ? "AND department_name = ?" : ""}
        ORDER BY snapshot_date ASC
        LIMIT 200
      `;
      if (department_name) params.push(department_name);
    } else if (timeRange === "weekly") {
      query = `
        SELECT
          YEAR(snapshot_date) AS year,
          WEEK(snapshot_date, 1) AS week,
          LEFT(DATE(MIN(snapshot_date)), 10) AS week_start,
          LEFT(DATE(MAX(snapshot_date)), 10) AS week_end,
          SUM(cm_jandarshan) AS cm_pending,
          SUM(collector_jandarshan) AS collector_pending,
          SUM(jansikayatWEB) AS web_pending,
          SUM(jansikayatPostMail) AS post_pending,
          SUM(pgPortal) AS pg_pending,
          SUM(call_center) AS call_pending,
          SUM(total_complaints) AS total_complaints
        FROM jandarshan_data_history
        WHERE department_name IS NOT NULL
          ${department_name ? "AND department_name = ?" : ""}
          AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL 16 WEEK)
        GROUP BY YEAR(snapshot_date), WEEK(snapshot_date, 1)
        ORDER BY year ASC, week ASC
        LIMIT 16
      `;
      if (department_name) params.push(department_name);
    } else if (timeRange === "monthly") {
      query = `
        SELECT
          YEAR(snapshot_date) AS year,
          MONTH(snapshot_date) AS month,
          LEFT(DATE(MIN(snapshot_date)), 10) AS month_start,
          LEFT(DATE(MAX(snapshot_date)), 10) AS month_end,
          SUM(cm_jandarshan) AS cm_pending,
          SUM(collector_jandarshan) AS collector_pending,
          SUM(jansikayatWEB) AS web_pending,
          SUM(jansikayatPostMail) AS post_pending,
          SUM(pgPortal) AS pg_pending,
          SUM(call_center) AS call_pending,
          SUM(total_complaints) AS total_complaints
        FROM jandarshan_data_history
        WHERE department_name IS NOT NULL
          ${department_name ? "AND department_name = ?" : ""}
          AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY YEAR(snapshot_date), MONTH(snapshot_date)
        ORDER BY year ASC, month ASC
        LIMIT 12
      `;
      if (department_name) params.push(department_name);
    } else {
      // ...existing code...
    }

    const [rows] = await db.query(query, params);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("department-name-graph error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Department historical stats for selected department
router.get("/department-history", async (req, res) => {
  try {
    const { main_department } = req.query;
    if (!main_department) {
      return res
        .status(400)
        .json({ success: false, error: "main_department required" });
    }
    const query = `
      SELECT 
        snapshot_date,
        cm_jandarshan,
        collector_jandarshan,
        call_center,
        pgPortal,
        jansikayatPostMail,
        jansikayatWEB,
        total_complaints
      FROM jandarshan_data_history
      WHERE main_department = ?
      ORDER BY snapshot_date ASC
    `;
    const [rows] = await db.query(query, [main_department]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Main department-wise graph from jandarshan_data_history (last 5 records)
router.get("/main-department-graph", async (req, res) => {
  try {
    const { main_department } = req.query;

    let query = "";
    let params = [];

    if (main_department) {
      // Get last 5 records for specific department
      query = `
        SELECT 
          history_id,
          original_id,
          main_department,
          department_name,
          officer_designation,
          cm_jandarshan,
          collector_jandarshan,
          call_center,
          pgPortal,
          jansikayatPostMail,
          jansikayatWEB,
          total_complaints,
          snapshot_date
        FROM jandarshan_data_history
        WHERE main_department = ?
        ORDER BY snapshot_date DESC
        limit 7
      `;
      params = [main_department];
    } else {
      // Get last 5 records overall
      query = `
        SELECT 
          history_id,
          original_id,
          main_department,
          department_name,
          officer_designation,
          cm_jandarshan,
          collector_jandarshan,
          call_center,
          pgPortal,
          jansikayatPostMail,
          jansikayatWEB,
          total_complaints,
          snapshot_date
        FROM jandarshan_data_history
        ORDER BY snapshot_date DESC
        LIMIT 5
      `;
    }

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add this new endpoint to check history for a specific record
router.get("/history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        history_id,
        original_id,
        main_department,
        department_name,
        officer_designation,
        cm_jandarshan,
        collector_jandarshan,
        call_center,
        pgPortal,
        jansikayatPostMail,
        jansikayatWEB,
        total_complaints,
        snapshot_date
      FROM jandarshan_data_history
      WHERE original_id = ?
      ORDER BY snapshot_date DESC
    `;
    const [rows] = await db.query(query, [id]);
    res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add endpoint to get all history records
router.get("/all-history", async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const query = `
      SELECT 
        h.*,
        j.main_department as current_main_department,
        j.total_complaints as current_total
      FROM jandarshan_data_history h
      LEFT JOIN jandarshan_data j ON h.original_id = j.id
      ORDER BY h.snapshot_date DESC
      LIMIT ?
    `;
    const [rows] = await db.query(query, [Number(limit)]);
    res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as default };
