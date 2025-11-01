import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

const SECRET_KEY = process.env.SECRET_KEY; // Use environment variable in production

export const isLoggedIn = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.admin = decoded; // attach admin info to request object
    next(); // move to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
