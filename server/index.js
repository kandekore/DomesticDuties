import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import cron from 'node-cron'

import authRoutes from './routes/auth.js'
import settingsRoutes from './routes/settings.js'
import providersRoutes from './routes/providers.js'
import servicesRoutes from './routes/services.js'
import availabilityRoutes from './routes/availability.js'
import blackoutsRoutes from './routes/blackouts.js'
import slotsRoutes from './routes/slots.js'
import bookingsRoutes from './routes/bookings.js'
import googleRoutes from './routes/google.js'
import contactRoutes from './routes/contact.js'

import Admin from './models/Admin.js'
import Settings from './models/Settings.js'
import Booking from './models/Booking.js'
import { sendBookingReminder } from './utils/whatsapp.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))

// Raw body for Stripe webhooks MUST come before express.json()
app.use('/api/bookings/stripe-webhook', express.raw({ type: 'application/json' }))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/providers', providersRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/blackouts', blackoutsRoutes)
app.use('/api/slots', slotsRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/google', googleRoutes)
app.use('/api/contact', contactRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }))

// ── Cron: Daily WhatsApp reminders at 09:00 ──────────────────────────────────
cron.schedule('0 9 * * *', async () => {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().slice(0, 10)
    const bookings = await Booking.find({ bookingDate: dateStr, status: 'confirmed', reminderSent: false })
    for (const b of bookings) {
      try {
        await sendBookingReminder(b)
        b.reminderSent = true
        await b.save()
      } catch (e) {
        console.error('Reminder failed for', b._id, e.message)
      }
    }
    console.log(`Reminders sent for ${bookings.length} bookings on ${dateStr}`)
  } catch (e) {
    console.error('Cron reminder error:', e.message)
  }
})

// ── Cron: Flag unpaid bank-transfer deposits after 24h ──────────────────────
cron.schedule('0 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    await Booking.updateMany(
      { paymentMethod: 'bank_transfer', depositPaid: false, status: 'pending_deposit', createdAt: { $lt: cutoff } },
      { $set: { status: 'pending_confirmation', adminNotes: 'AUTO: Deposit not confirmed within 24h — please follow up.' } }
    )
  } catch (e) {
    console.error('Deposit flag cron error:', e.message)
  }
})

// ── Connect & boot ────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/domestic-duties')
  .then(async () => {
    console.log('MongoDB connected')
    // Seed admin if none exists
    const count = await Admin.countDocuments()
    if (count === 0) {
      await Admin.create({ email: process.env.ADMIN_EMAIL || 'admin@domesticduties.co.uk', password: process.env.ADMIN_PASSWORD || 'changeme123' })
      console.log('Default admin created: admin@domesticduties.co.uk / changeme123 — CHANGE THIS IMMEDIATELY')
    }
    // Ensure settings singleton
    await Settings.findOneAndUpdate({ singleton: 'main' }, {}, { upsert: true, returnDocument: 'after' })

    const PORT = process.env.PORT || 3001
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  })
  .catch(e => { console.error('MongoDB error:', e.message); process.exit(1) })
