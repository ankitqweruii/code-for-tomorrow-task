const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");
const { connectDB } = require("./src/config/db");

require("dotenv").config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", serviceRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Services & Categories API",
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
