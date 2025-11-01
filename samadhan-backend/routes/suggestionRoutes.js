import express from "express";
import db from "../config/database.js"; // promise pool

const router = express.Router();

router.get("/suggestions", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT DISTINCT main_department, department_name, officer_designation
      FROM jandarshan_data
    `);
    res.json(results);
  } catch (err) {
    console.error("Failed to fetch suggestions:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;

//  INSERT INTO jandarshan_data (
//           main_department,
//           department_name,
//           officer_designation,
//           cm_jandarshan,
//           collector_jandarshan,
//           call_center,
//           pgPortal,
//           jansikayatPostMail,
//           jansikayatWEB,
//           total_complaints
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;
