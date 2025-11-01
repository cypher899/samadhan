// Import database in ESM style
import db from "../config/database.js";

// Utility function to map portal name → column
function getPortalColumn(portal) {
  const portalMap = {
    "MukhyaMantri Jandarshan": "cm_jandarshan",
    "Collector Jandarshan": "collector_jandarshan",
    "Janshikayat (Post/Mail)": "jansikayatPostMail",
    "Janshikayat (Web)": "jansikayatWEB",
    "PG Portal": "pgPortal",
    "Call Center": "call_center",
  };

  return portalMap[portal] || "total_complaints";
}

class StatsController {
  // Get real-time statistics
  static async getRealTimeStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_records,
          SUM(cm_jandarshan) as total_cm,
          SUM(collector_jandarshan) as total_collector,
          SUM(call_center) as total_call_center,
          SUM(pgPortal) as total_pg_portal,
          SUM(jansikayatPostMail) as total_post_mail,
          SUM(jansikayatWEB) as total_web,
          SUM(total_complaints) as grand_total,
          AVG(total_complaints) as avg_complaints
        FROM jandarshan_data
      `;

      const [result] = await db.query(query);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Real-time stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch real-time statistics",
      });
    }
  }

  // Get top departments by complaints
  static async getTopDepartments(req, res) {
    try {
      const { limit = 5, portal = "All Portals" } = req.query;
      const column = getPortalColumn(portal);

      const query = `
        SELECT 
          main_department,
          department_name,
          officer_designation,
          ${column} as complaint_count,
          total_complaints
        FROM jandarshan_data
        WHERE ${column} > 0
        ORDER BY ${column} DESC
        LIMIT ?
      `;

      const [result] = await db.query(query, [parseInt(limit)]);

      res.json({
        success: true,
        data: result,
        portal,
        limit,
      });
    } catch (error) {
      console.error("Top departments error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch top departments",
      });
    }
  }
}

// ✅ Export properly in ESM
export default StatsController;
