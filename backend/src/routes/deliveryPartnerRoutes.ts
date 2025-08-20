import express, { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DeliveryPartner from "../models/DeliveryPartner.ts";
import Order from "../models/Order.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import User from "../models/User.ts";

const router = express.Router();

// Register Delivery Partner
router.post("/register", async (req: Request, res: Response) => {
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
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, user, partner });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login Delivery Partner
router.post("/login", async (req: Request, res: Response) => {
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
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({ token, user, deliveryPartner });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// View unassigned orders
router.get("/orders/unassigned", authMiddleware, async (req: Request, res: Response) => {
  const orders = await Order.find({ deliveryPartner: null, status: "PLACED" });
  res.json(orders);
});

// ACCEPT ORDER (lock mechanism)
router.post("/orders/accept/:orderId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).user.id;
    console.log('partnerId: ', partnerId);
    const { orderId } = req.params;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, deliveryPartner: null },
      { deliveryPartner: partnerId, status: "ACCEPTED" },
      { new: true }
    );

    if (!order) return res.status(400).json({ error: "Order already accepted" });

    req.app.get("io").to(order.customer.toString()).emit("order_update", order);
    console.log('Emitted to order_update room')

    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update Delivery Status
router.post("/orders/status/:orderId", authMiddleware, async (req: Request, res: Response) => {
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
    console.log('Emitted to order_update room')

    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


// View assigned orders for a delivery partner
router.get("/orders/assigned", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Find delivery partner profile
    const partner = await DeliveryPartner.findOne({ user: userId });
    if (!partner) {
      return res.status(404).json({ error: "Delivery Partner not found" });
    }

    // Fetch assigned orders
    const orders = await Order.find({
      deliveryPartner: partner.user,
      status: { $in: ["ACCEPTED", "PICKED_UP", "ON_THE_WAY", "DELIVERED"] },
    }).populate("customer", "name email phone");

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
);


export default router;
