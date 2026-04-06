import mongoose from 'mongoose'

const blackoutSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  reason: String,
}, { timestamps: true })

export default mongoose.models.BlackoutDate || mongoose.model('BlackoutDate', blackoutSchema)
