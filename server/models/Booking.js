import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  bookingDate: { type: String, required: true },   // YYYY-MM-DD
  startTime: { type: String, required: true },     // HH:MM
  endTime: { type: String, required: true },       // HH:MM
  // Client info (guest booking)
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, required: true },
  clientAddress: String,
  clientNotes: String,
  status: {
    type: String,
    enum: ['pending_deposit', 'pending_confirmation', 'confirmed', 'cancelled', 'completed'],
    default: 'pending_deposit',
  },
  // Payment
  paymentMethod: { type: String, enum: ['stripe', 'bank_transfer', 'none'], default: 'bank_transfer' },
  depositAmount: Number,           // pence (Stripe) or display value
  depositPaid: { type: Boolean, default: false },
  depositPaidAt: Date,
  remainingAmount: Number,
  // Stripe
  stripePaymentIntentId: String,
  stripeChargeId: String,
  // Email verification token for guest bookings
  verifyToken: String,
  verifyExpiry: Date,
  // Google Calendar
  googleEventId: String,
  // Snapshots at booking time
  priceSnapshot: Number,
  serviceTitle: String,
  // Admin
  adminNotes: String,
  // Reminders
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true })

bookingSchema.index({ provider: 1, bookingDate: 1 })
bookingSchema.index({ service: 1, bookingDate: 1 })
bookingSchema.index({ clientEmail: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ verifyToken: 1 })

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema)
