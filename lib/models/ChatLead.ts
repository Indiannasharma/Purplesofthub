import mongoose, { Schema, models } from "mongoose";

const ChatLeadSchema = new Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  summary: String,
  handoffTriggered: Boolean,
  source: { type: String, default: "chatbot" },
  status: { type: String, default: "new" },
  createdAt: { type: Date, default: Date.now },
});

const ChatLead =
  models.ChatLead ||
  mongoose.model("ChatLead", ChatLeadSchema, "chat_leads");

export default ChatLead;
