import mongoose from 'mongoose'

// Recurring weekly rule (dayOfWeek set) OR date-specific override (overrideDate set)
const availabilitySchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  dayOfWeek: { type: Number, min: 0, max: 6, default: null }, // 0=Sun … 6=Sat
  overrideDate: { type: String, default: null },               // YYYY-MM-DD
  startTime: { type: String, required: true },                 // HH:MM
  endTime: { type: String, required: true },                   // HH:MM
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true })

availabilitySchema.index({ provider: 1, dayOfWeek: 1 })
availabilitySchema.index({ provider: 1, overrideDate: 1 })

export default mongoose.models.Availability || mongoose.model('Availability', availabilitySchema)
