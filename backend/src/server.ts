import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./db.ts";
import customerRoutes from "./routes/customerRoutes.ts";
import deliveryPartnerRoutes from "./routes/deliveryPartnerRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Store io globally
app.set("io", io);

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("join", (customerId: string) => {
    socket.join(customerId);
    console.log(`Customer ${customerId} joined room`);
  });
  socket.on("order_update", (order) => {
    console.log("Order updated:", order);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Connect to DB
connectDB();

// Routes
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello World" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/customers", customerRoutes);
app.use("/api/delivery", deliveryPartnerRoutes);
app.use("/api/admin", adminRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Backend running on http://localhost:${process.env.PORT}`);
});
