import mongoose, { Schema, models } from 'mongoose'

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    avatar: { type: String },
    role: { type: String, enum: ['admin', 'client'], default: 'client' },
    phone: { type: String },
    company: { type: String },
    country: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default models.User || mongoose.model('User', UserSchema)
