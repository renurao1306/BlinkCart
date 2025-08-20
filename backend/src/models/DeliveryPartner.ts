import mongoose, { Schema, Document } from "mongoose";
import { type IUser } from "./User.ts";

export interface IDeliveryPartner extends Document {
    user: IUser["_id"];
    vehicleNumber: string;
    isAvailable: boolean;
}

const deliveryPartnerSchema = new Schema<IDeliveryPartner>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicleNumber: { type: String, required: true },
    isAvailable: { type: Boolean, default: true }
},
    { timestamps: true }
);

export default mongoose.model<IDeliveryPartner>("DeliveryPartner", deliveryPartnerSchema);
