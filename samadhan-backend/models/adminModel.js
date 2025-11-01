import db from "../config/database.js";

// Promise-based getAdmin
export async function getAdmin(email) {
  if (email) {
    // Query by email
    const [rows] = await db.query("SELECT * FROM admins WHERE email = ?", [
      email,
    ]);
    return [rows];
  } else {
    // Return all admins or first admin
    const [rows] = await db.query("SELECT * FROM admins LIMIT 1");
    return rows[0];
  }
}

// Find admin by email and password (for login)
export async function findAdminByEmailAndPassword(email, password) {
  // Example using mysql2/promise
  const query = `
    SELECT * FROM admins
    WHERE email = ? AND password = ?
    LIMIT 1
  `;
  const [rows] = await db.query(query, [email, password]);
  return rows[0]; // returns undefined if not found
}
