const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model("Product", ProductSchema);