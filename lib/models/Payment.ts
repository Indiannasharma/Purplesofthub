import mongoose, { Schema, models } from 'mongoose'

const PaymentSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    method: { type: String, enum: ['paystack', 'flutterwave', 'manual'] },
    reference: { type: String, unique: true, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    gatewayResponse: {
      status: { type: String },
      message: { type: String },
      reference: { type: String },
      amount: { type: Number },
      currency: { type: String },
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
)

export default models.Payment || mongoose.model('Payment', PaymentSchema)
