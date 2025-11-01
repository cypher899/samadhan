import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  charset: "utf8mb4",
  // collation: "utf8mb4_unicode_ci", // Add this line
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add these MySQL settings for proper UTF-8 handling
  typeCast: function (field, next) {
    if (field.type === "VAR_STRING" || field.type === "STRING") {
      return field.string();
    }
    return next();
  },
});

// Set connection charset on each connection
pool.on("connection", function (connection) {
  connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
  connection.query("SET CHARACTER SET utf8mb4");
  connection.query("SET character_set_connection=utf8mb4");
});

export default pool;
