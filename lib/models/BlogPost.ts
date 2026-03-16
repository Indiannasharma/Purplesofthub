import mongoose, { Schema, models } from 'mongoose'

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    content: { type: String },
    excerpt: { type: String },
    coverImage: { type: String },
    category: { type: String },
    tags: [{ type: String }],
    author: {
      name: { type: String, default: 'PurpleSoftHub Team' },
      avatar: { type: String },
    },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    seoTitle: { type: String },
    seoDescription: { type: String },
    readTime: { type: String },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
)

export default models.BlogPost || mongoose.model('BlogPost', BlogPostSchema)
