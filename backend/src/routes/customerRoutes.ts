import express, { type Request, type Response } from "express";
import Customer from "../models/Customer.ts";
import Product from "../models/Product.ts";
import Order from "../models/Order.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import User from "../models/User.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register customer (public)
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, address } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "customer",
    });
    await user.save();

    const customer = new Customer({ user: user._id, address });
    await customer.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, user, customer });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login Route
router.post("/login", async (req: Request, res: Response) => {
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

    const customer = await Customer.findOne({ user: user._id });
    if (!customer) {
      return res.status(400).json({ error: "Customer profile not found" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.json({ token, user, customer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Get all products (public)
router.get("/products", async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Place an order (protected)
router.post("/order", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { items, deliveryAddress } = req.body;
    const customerId = (req as any).user.id;

    let total = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findOne({ sku: item.sku });
      if (!product) throw new Error(`Product with SKU ${item.sku} not found`);

      total += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        sku: product.sku,
        quantity: item.quantity,
      });
    }

    const order = new Order({
      customer: customerId,
      items: orderItems,
      totalAmount: total,
      deliveryAddress,
      deliveryPartner: null,
      status: "PLACED"
    });

    await order.save();
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get customer orders (protected)
router.get("/orders", authMiddleware, async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.id;
    const orders = await Order.find({ customer: customerId });
    console.log('orders is ', orders);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
