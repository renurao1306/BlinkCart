const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicleNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);