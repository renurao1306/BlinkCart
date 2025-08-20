import mongoose, { Schema, Document } from "mongoose";
import { type IUser } from "./User.ts";

export interface ICustomer extends Document {
  user: IUser["_id"];
  address?: string;
}

const customerSchema = new Schema<ICustomer>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomer>("Customer", customerSchema);
