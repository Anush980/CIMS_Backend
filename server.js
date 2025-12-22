const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// Parse JSON request bodies
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// --- ROUTES ---
// Auth, Inventory, Customers, Sales
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const salesRoutes = require("./routes/salesRoutes");
const staffRoutes = require("./routes/staffRoutes"); 
const profileRoutes = require("./routes/profileRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", customerRoutes);
app.use("/api", salesRoutes);
app.use("/api", staffRoutes); 
app.use("/api", profileRoutes);

// --- DEFAULT ROUTE ---
app.get("/", (req, res) => {
  res.send("Welcome to Stockmate API");
});

// --- DATABASE CONNECTION ---
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to the database"))
  .catch((err) => console.error("❌ Database connection error:", err));

// --- ERROR HANDLING (Fallback) ---
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
