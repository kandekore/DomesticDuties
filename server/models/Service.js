import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: String,
  duration: { type: Number, required: true, min: 5 },   // minutes
  bufferTime: { type: Number, default: 0 },              // minutes after
  price: { type: Number, required: true, default: 0 },
  depositMode: {
    type: String,
    enum: ['percent', 'fixed', 'none'],
    default: 'percent',
  },
  depositPercent: { type: Number, default: 10 },
  depositFixed: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'bank_transfer', 'none'],
    default: 'bank_transfer',
  },
  category: { type: String, enum: ['oven', 'carpet_upholstery', 'other'], default: 'other' },
  featuredImage: String,
  active: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Service || mongoose.model('Service', serviceSchema)
