const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

// Hardcoded sample user
const sampleUser = {
  username: "admin",
  password: "12345",
};

// -------------------- LOGIN ROUTE --------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate user credentials
  if (username === sampleUser.username && password === sampleUser.password) {
    // Create JWT token (expires in 1 hour)
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ message: "Login successful!", token });
  }

  res.status(401).json({ message: "Invalid username or password" });
});

// -------------------- JWT VERIFY MIDDLEWARE --------------------
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract Bearer token

  if (!token) {
    return res.status(403).json({ message: "Access denied! No token provided." });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified; // attach user info to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// -------------------- PROTECTED ROUTE --------------------
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Access granted! You are authorized.",
    user: req.user,
  });
});

// -------------------- PUBLIC ROUTE --------------------
app.get("/", (req, res) => {
  res.send("Welcome to JWT Authentication API 🚀");
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
