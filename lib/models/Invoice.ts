import mongoose, { Schema, models } from 'mongoose'

const InvoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, unique: true, required: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    items: [
      {
        description: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number },
        total: { type: Number },
      },
    ],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, enum: ['NGN', 'USD'], default: 'NGN' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    dueDate: { type: Date },
    paidAt: { type: Date },
    paymentReference: { type: String },
    paymentMethod: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
)

export default models.Invoice || mongoose.model('Invoice', InvoiceSchema)
