// Import database connection in ESM style
import connection from "../config/database.js";

// Define controller function
export const getAdmin = (req, res) => {
  const query = "SELECT * FROM admins LIMIT 1";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching admin:", err);
      return res.status(500).json({ error: "Failed to fetch admin" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No admin found" });
    }

    // ✅ Send only one object, not an array
    res.status(200).json(results[0]);
  });
};
