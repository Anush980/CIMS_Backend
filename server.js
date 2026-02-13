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
const adminRoutes = require("./routes/adminRoutes")
const otpResetRoutes=require("./routes/otpResetRoutes");
// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/reset", otpResetRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", customerRoutes);
app.use("/api", salesRoutes);
app.use("/api", staffRoutes); 
app.use("/api", profileRoutes);
app.use("/api/admin",adminRoutes);


// --- DEFAULT ROUTE ---
app.get("/health", (req, res) => {
  res.send("Welcome to Stockmate API");
});

// --- DATABASE CONNECTION ---
mongoose
  // .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .connect(process.env.MONGODB_URI)
  .then(() => console.log(" Connected to the database"))
  .catch((err) => console.error(" Database connection error:", err));

// --- ERROR HANDLING (Fallback) ---
app.use((err, req, res) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});
