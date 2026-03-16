import mongoose, { Schema, models } from 'mongoose'

const TaskSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    order: { type: Number, default: 0 },
    dueDate: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
)

export default models.Task || mongoose.model('Task', TaskSchema)
