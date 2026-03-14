import mongoose, { Schema, models } from "mongoose";

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    status: { type: String, enum: ["active", "unsubscribed"], default: "active" },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Subscriber = models.Subscriber || mongoose.model("Subscriber", SubscriberSchema);
export default Subscriber;
