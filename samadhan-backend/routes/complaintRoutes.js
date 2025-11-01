import express from "express";
import db from "../config/database.js";

const router = express.Router();

router.post("/add-complaint", async (req, res) => {
  try {
    let {
      main_department,
      department_name,
      officer_designation,
      officer_name,
      officer_mobile,
      cm_jandarshan = 0,
      collector_jandarshan = 0,
      jansikayatPostMail = 0,
      jansikayatWEB = 0,
      pgPortal = 0,
      call_center = 0,
      total_complaints,
    } = req.body;

    // Force numeric and recompute
    cm_jandarshan = Number(cm_jandarshan) || 0;
    collector_jandarshan = Number(collector_jandarshan) || 0;
    jansikayatPostMail = Number(jansikayatPostMail) || 0;
    jansikayatWEB = Number(jansikayatWEB) || 0;
    pgPortal = Number(pgPortal) || 0;
    call_center = Number(call_center) || 0;

    const computedTotal =
      cm_jandarshan +
      collector_jandarshan +
      jansikayatPostMail +
      jansikayatWEB +
      pgPortal +
      call_center;

    if (Number(total_complaints) !== computedTotal) {
      total_complaints = computedTotal;
    }

    // 1. Check if record exists
    const checkQuery = `
      SELECT id FROM jandarshan_data
      WHERE main_department = ? AND department_name = ? AND officer_designation = ?
    `;
    const checkValues = [main_department, department_name, officer_designation];

    const [checkResult] = await db.query(checkQuery, checkValues);

    if (checkResult.length > 0) {
      // ✅ Record exists – Update it (triggers will handle history)
      const existingId = checkResult[0].id;

      const updateQuery = `
        UPDATE jandarshan_data
        SET cm_jandarshan = ?, collector_jandarshan = ?, call_center = ?,
            pgPortal = ?, jansikayatPostMail = ?, jansikayatWEB = ?, total_complaints = ?,
            created_at = NOW()
        WHERE id = ?
      `;
      const updateValues = [
        cm_jandarshan,
        collector_jandarshan,
        call_center,
        pgPortal,
        jansikayatPostMail,
        jansikayatWEB,
        total_complaints,
        existingId,
      ];

      await db.query(updateQuery, updateValues);

      // Update officer details
      const updateOfficerQuery = `
        UPDATE complaint_reciever
        SET name = ?, contact_no = ?
        WHERE complaint_id = ?
      `;
      await db.query(updateOfficerQuery, [
        officer_name,
        officer_mobile,
        existingId,
      ]);

      // console.log(
      //   `✅ Updated record ID ${existingId} - triggers should have created history entries`
      // );

      return res
        .status(200)
        .json({ message: "Complaint updated successfully" });
    } else {
      // ✅ Record does not exist – Insert it (trigger will handle history)
      const insertComplaint = `
        INSERT INTO jandarshan_data (
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
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      const insertValues = [
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
      ];

      const [insertResult] = await db.query(insertComplaint, insertValues);
      const complaintId = insertResult.insertId;

      const insertOfficer = `
        INSERT INTO complaint_reciever (name, contact_no, complaint_id)
        VALUES (?, ?, ?)
      `;
      await db.query(insertOfficer, [
        officer_name,
        officer_mobile,
        complaintId,
      ]);

      // console.log(
      //   `✅ Inserted new record ID ${complaintId} - trigger should have created history entry`
      // );

      return res.status(201).json({ message: "Complaint added successfully" });
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return res.status(500).json({ message: "Unexpected server error" });
  }
});

export default router;
