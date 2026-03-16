import mongoose, { Schema, models } from 'mongoose'

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
    status: {
      type: String,
      enum: ['planning', 'design', 'development', 'review', 'completed', 'on-hold'],
      default: 'planning',
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    startDate: { type: Date },
    dueDate: { type: Date },
    completedDate: { type: Date },
    updates: [
      {
        message: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

export default models.Project || mongoose.model('Project', ProjectSchema)
