const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/Order");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// Register Delivery Partner
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, vehicleNumber } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "delivery_partner",
    });
    await user.save();
    const partner = new DeliveryPartner({
      user: user._id,
      vehicleNumber,
      isAvailable: true,
    });
    await partner.save();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({ token, user, partner });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login Delivery Partner
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: "delivery_partner" });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const deliveryPartner = await DeliveryPartner.findOne({ user: user._id });
    if (!deliveryPartner) {
      return res.status(400).json({ error: "Delivery Partner profile not found" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, user, deliveryPartner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View unassigned orders
router.get("/orders/unassigned", authMiddleware, async (req, res) => {
  const orders = await Order.find({ deliveryPartner: null, status: "PLACED" });
  res.json(orders);
});

// ACCEPT ORDER (lock mechanism)
router.post("/orders/accept/:orderId", authMiddleware, async (req, res) => {
  try {
    const partnerId = req.user.id;
    console.log('partnerId: ', partnerId);
    const { orderId } = req.params;
    const order = await Order.findOneAndUpdate(
      { _id: orderId, deliveryPartner: null },
      { deliveryPartner: partnerId, status: "ACCEPTED" },
      { new: true }
    );
    if (!order) return res.status(400).json({ error: "Order already accepted" });
    req.app.get("io").to(order.customer.toString()).emit("order_update", order);
    console.log('Emitted to order_update room');
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Delivery Status
router.post("/orders/status/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ["ACCEPTED", "PICKED_UP", "ON_THE_WAY", "DELIVERED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    req.app.get("io").to(order.customer.toString()).emit("order_update", order);
    console.log('Emitted to order_update room');
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// View assigned orders for a delivery partner
router.get("/orders/assigned", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const partner = await DeliveryPartner.findOne({ user: userId });
    
    if (!partner) {
      return res.status(404).json({ error: "Delivery Partner not found" });
    }
    
    const orders = await Order.find({
      deliveryPartner: partner.user,
      status: { $in: ["ACCEPTED", "PICKED_UP", "ON_THE_WAY", "DELIVERED"] },
    }).populate("customer", "name email phone");
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;