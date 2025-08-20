import mongoose, { Schema, Document } from "mongoose";
import { type IUser } from "./User.ts";

export interface IAdmin extends Document {
  user: IUser["_id"];
}

const adminSchema = new Schema<IAdmin>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>("Admin", adminSchema);
