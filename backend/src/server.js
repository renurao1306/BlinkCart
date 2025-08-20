const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./db");
const customerRoutes = require("./routes/customerRoutes");
const deliveryPartnerRoutes = require("./routes/deliveryPartnerRoutes");
const adminRoutes = require("./routes/adminRoutes");

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
  socket.on("join", (customerId) => {
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
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Backend running on http://35.154.71.3:${process.env.PORT}`);
});