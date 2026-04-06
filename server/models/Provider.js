import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  bio: String,
  avatar: String,
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  active: { type: Boolean, default: true },
  googleRefreshToken: String,
  googleCalendarId: { type: String, default: 'primary' },
}, { timestamps: true })

providerSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

providerSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

export default mongoose.models.Provider || mongoose.model('Provider', providerSchema)
