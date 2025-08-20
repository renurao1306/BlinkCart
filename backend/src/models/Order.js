const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      sku: { type: String, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner" },
  status: {
    type: String,
    enum: ["PLACED", "ACCEPTED", "PICKED_UP", "ON_THE_WAY", "DELIVERED"],
    default: "PLACED"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);