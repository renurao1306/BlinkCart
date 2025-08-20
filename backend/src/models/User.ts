import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "delivery_partner" | "admin";
  phone?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "delivery_partner", "admin"],
      required: true,
    },
    phone: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
