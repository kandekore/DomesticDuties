import mongoose from 'mongoose'

// Stored temporarily so admin can view in dashboard; auto-cleared after 90 days
const commercialQuoteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  businessLocation: String,
  premisesType: String,
  preferredDate: String,
  requirements: String,
  preferredContact: { type: String, enum: ['phone', 'email'], default: 'email' },
  images: [String],     // stored file paths
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  adminNotes: String,
}, { timestamps: true })

export default mongoose.models.CommercialQuote || mongoose.model('CommercialQuote', commercialQuoteSchema)
