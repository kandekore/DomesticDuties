import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
}, { timestamps: true })

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

adminSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema)
