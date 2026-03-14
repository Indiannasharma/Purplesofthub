import mongoose, { Schema, models } from "mongoose";

const ChatLeadSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    summary: { type: String, default: "" },
    handoffMethod: {
      type: String,
      enum: ["whatsapp", "email", "tawkto", "none"],
      default: "none",
    },
    source: { type: String, default: "chatbot" },
    status: { type: String, default: "new" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ChatLead = models.ChatLead || mongoose.model("ChatLead", ChatLeadSchema);
export default ChatLead;
