import mongoose, { Schema, models } from 'mongoose'

const MusicPromotionSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    artistName: { type: String, required: true },
    trackTitle: { type: String, required: true },
    trackLink: { type: String },
    genre: { type: String },
    platforms: [{ type: String }],
    package: { type: String, enum: ['starter', 'growth', 'pro'] },
    status: {
      type: String,
      enum: ['submitted', 'in-review', 'active', 'completed'],
      default: 'submitted',
    },
    streamCount: { type: Number, default: 0 },
    playlistPlacements: [{ type: String }],
    campaignStartDate: { type: Date },
    campaignEndDate: { type: Date },
    reportUrl: { type: String },
    adminNotes: { type: String },
  },
  { timestamps: true }
)

export default models.MusicPromotion || mongoose.model('MusicPromotion', MusicPromotionSchema)
