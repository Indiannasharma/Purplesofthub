import mongoose, { Schema, models } from 'mongoose'

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    category: {
      type: String,
      enum: [
        'web-development',
        'mobile-apps',
        'digital-marketing',
        'ui-ux-design',
        'saas-development',
        'music-promotion',
        'content-creation',
        'seo',
        'social-media',
      ],
    },
    description: { type: String },
    shortDesc: { type: String },
    features: [{ type: String }],
    priceNGN: { type: Number },
    priceUSD: { type: Number },
    deliveryDays: { type: Number },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    icon: { type: String },
    order: { type: Number },
  },
  { timestamps: true }
)

export default models.Service || mongoose.model('Service', ServiceSchema)
