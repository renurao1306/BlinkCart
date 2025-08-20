const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);