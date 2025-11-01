import express from "express";
import { getAdmin } from "../models/adminModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const email = req.query.email;
    if (email) {
      // Fetch admin by email
      const [rows] = await getAdmin(email);
      if (!rows || rows.length === 0)
        return res.status(404).json({ error: "No admin found" });
      res.json(rows[0]);
    } else {
      // Fallback: return first admin
      const admin = await getAdmin();
      if (!admin) return res.status(404).json({ error: "No admin found" });
      res.json(admin);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;
    if (!name || !email || !phone || !username || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    // Check if email already exists
    const [rows] = await getAdmin(email);
    if (rows && rows.length > 0) {
      return res.status(409).json({ error: "Email already exists." });
    }
    // Insert new admin
    const db = (await import("../config/database.js")).default;
    await db.query(
      `INSERT INTO admins (name, email, phone, username, password) VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, username, password]
    );
    res.json({ success: true, message: "Admin created successfully." });
  } catch (err) {
    console.error("Admin create error:", err);
    res.status(500).json({ error: "Failed to create admin." });
  }
});

router.put("/update-profile", async (req, res) => {
  try {
    const { id, name, email, phone, username, password } = req.body;

    // Validation
    if (!id || !name || !email || !phone || !username) {
      return res.status(400).json({
        success: false,
        message: "All fields (id, name, email, phone, username) are required.",
      });
    }

    // Check if the email already exists for another user
    const db = (await import("../config/database.js")).default;
    const [existingUser] = await db.query(
      `SELECT id FROM admins WHERE email = ? AND id != ?`,
      [email, id]
    );

    if (existingUser && existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists for another user.",
      });
    }

    // Check if the username already exists for another user
    const [existingUsername] = await db.query(
      `SELECT id FROM admins WHERE username = ? AND id != ?`,
      [username, id]
    );

    if (existingUsername && existingUsername.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists for another user.",
      });
    }

    // Build update query based on whether password is being changed
    let updateQuery = "";
    let updateParams = [];

    if (password && password.trim() !== "") {
      // Update with password
      updateQuery = `UPDATE admins SET name = ?, email = ?, phone = ?, username = ?, password = ? WHERE id = ?`;
      updateParams = [name, email, phone, username, password, id];
    } else {
      // Update without password
      updateQuery = `UPDATE admins SET name = ?, email = ?, phone = ?, username = ? WHERE id = ?`;
      updateParams = [name, email, phone, username, id];
    }

    // Update the admin record
    const [result] = await db.query(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found or no changes made.",
      });
    }

    res.json({
      success: true,
      message: "Admin updated successfully.",
      data: { id, name, email, phone, username },
    });
  } catch (err) {
    console.error("Admin update error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update admin.",
      error: err.message,
    });
  }
});

export default router;
