import mongoose, { Schema, models } from 'mongoose'

const FileSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedBy: { type: String, enum: ['admin', 'client'], required: true },
    name: { type: String, required: true },
    originalName: { type: String },
    url: { type: String, required: true },
    publicId: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    category: {
      type: String,
      enum: ['brief', 'design', 'asset', 'deliverable', 'report', 'invoice', 'other'],
      default: 'other',
    },
  },
  { timestamps: true }
)

FileSchema.index({ client: 1, createdAt: -1 })
FileSchema.index({ project: 1, createdAt: -1 })

export default models.File || mongoose.model('File', FileSchema)
