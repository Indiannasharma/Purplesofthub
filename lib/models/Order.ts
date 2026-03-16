import mongoose, { Schema, models } from 'mongoose'

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    amountNGN: { type: Number },
    amountUSD: { type: Number },
    currency: { type: String, enum: ['NGN', 'USD'], default: 'NGN' },
    paymentMethod: { type: String, enum: ['paystack', 'flutterwave', 'manual'] },
    paymentReference: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    notes: { type: String },
  },
  { timestamps: true }
)

export default models.Order || mongoose.model('Order', OrderSchema)
