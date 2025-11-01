import db from "../config/database.js";

// Find user by email and password in login table (async/await)
export const findUserByEmailAndPassword = async (email, password) => {
  const query = "SELECT * FROM login WHERE email = ? AND password = ?";
  const [results] = await db.query(query, [email, password]);
  return results[0];
};
