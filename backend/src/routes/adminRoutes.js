const express = require("express");
const Admin = require("../models/Admin");
const Order = require("../models/Order");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Register admin (public)
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "admin",
    });
    await user.save();
    const admin = new Admin({ user: user._id });
    await admin.save();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({ token, user, admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login Route (public)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const admin = await Admin.findOne({ user: user._id });
    if (!admin) {
      return res.status(400).json({ error: "Admin profile not found" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, user, admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View All Orders
router.get("/all-orders", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("deliveryPartner", "name phone");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;