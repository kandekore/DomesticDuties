import { Router } from 'express'
import Stripe from 'stripe'
import { v4 as uuid } from 'uuid'
import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import Provider from '../models/Provider.js'
import Settings from '../models/Settings.js'
import { adminAuth } from '../middleware/auth.js'
import { sendBookingConfirmation, sendBookingConfirmedEmail, sendAdminNewBooking } from '../utils/email.js'
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from '../utils/google.js'

const router = Router()

function calcDeposit(service) {
  if (service.depositMode === 'fixed') return service.depositFixed
  if (service.depositMode === 'percent') return +(service.price * service.depositPercent / 100).toFixed(2)
  return 0
}

// Create booking (public)
router.post('/', async (req, res) => {
  try {
    const { serviceSlug, providerId, bookingDate, startTime, clientName, clientEmail, clientPhone, clientAddress, clientNotes } = req.body
    const settings = await Settings.findOne({ singleton: 'main' })

    const service = await Service.findOne({ slug: serviceSlug, active: true })
    if (!service) return res.status(404).json({ error: 'Service not found' })

    let provider
    if (providerId) {
      provider = await Provider.findById(providerId)
    } else {
      provider = await Provider.findOne({ active: true, services: service._id })
    }
    if (!provider) return res.status(400).json({ error: 'No provider available' })

    const [sh, sm] = startTime.split(':').map(Number)
    const endMins = sh * 60 + sm + service.duration
    const endTime = `${String(Math.floor(endMins / 60)).padStart(2,'0')}:${String(endMins % 60).padStart(2,'0')}`

    const depositAmount = calcDeposit(service)
    const paymentMethod = service.paymentMethod

    let stripeClientSecret = null
    let stripePaymentIntentId = null

    if (paymentMethod === 'stripe' && settings?.stripe?.enabled && settings.stripe.secretKey) {
      const stripe = new Stripe(settings.stripe.secretKey)
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(depositAmount * 100),
        currency: 'gbp',
        metadata: { clientEmail, serviceTitle: service.title, bookingDate, startTime },
      })
      stripeClientSecret = intent.client_secret
      stripePaymentIntentId = intent.id
    }

    const booking = await Booking.create({
      service: service._id,
      provider: provider._id,
      bookingDate,
      startTime,
      endTime,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      clientNotes,
      paymentMethod,
      depositAmount,
      remainingAmount: service.price - depositAmount,
      priceSnapshot: service.price,
      serviceTitle: service.title,
      stripePaymentIntentId,
      verifyToken: uuid(),
      verifyExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000),
      status: paymentMethod === 'stripe' ? 'pending_deposit' : 'pending_deposit',
    })

    // Send confirmation email
    try {
      await sendBookingConfirmation(booking, settings)
      await sendAdminNewBooking(booking, settings)
    } catch (emailErr) {
      console.error('Email error:', emailErr.message)
    }

    res.status(201).json({
      bookingId: booking._id,
      stripeClientSecret,
      paymentMethod,
      depositAmount,
      remainingAmount: booking.remainingAmount,
      bankTransfer: paymentMethod === 'bank_transfer' ? settings?.bankTransfer : null,
      booking: { clientName, bookingDate, startTime, serviceTitle: service.title },
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Stripe webhook — mark deposit paid
router.post('/stripe-webhook', async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: 'main' })
    const stripe = new Stripe(settings.stripe.secretKey)
    const sig = req.headers['stripe-signature']
    let event
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch {
      return res.status(400).send('Webhook error')
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object
      await Booking.findOneAndUpdate(
        { stripePaymentIntentId: pi.id },
        { depositPaid: true, depositPaidAt: new Date(), status: 'pending_confirmation', stripeChargeId: pi.latest_charge },
      )
    }
    res.json({ received: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Admin — list bookings
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const { status, date, page = 1, limit = 50 } = req.query
    const filter = {}
    if (status) filter.status = status
    if (date) filter.bookingDate = date
    const bookings = await Booking.find(filter)
      .populate('service', 'title slug category')
      .populate('provider', 'name email')
      .sort({ bookingDate: 1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    const total = await Booking.countDocuments(filter)
    res.json({ bookings, total })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Admin — get single
router.get('/admin/:id', adminAuth, async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id).populate('service provider')
    if (!b) return res.status(404).json({ error: 'Not found' })
    res.json(b)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Admin — update (confirm, cancel, mark deposit, notes)
router.put('/admin/:id', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('service provider')
    if (!booking) return res.status(404).json({ error: 'Not found' })

    const settings = await Settings.findOne({ singleton: 'main' })
    const prev = booking.status
    Object.assign(booking, req.body)
    await booking.save()

    // When admin confirms — create Google Calendar event + send confirmation email
    if (req.body.status === 'confirmed' && prev !== 'confirmed') {
      try {
        if (settings?.google?.enabled && booking.provider?.googleRefreshToken) {
          const eventId = await createGoogleCalendarEvent(booking, settings)
          if (eventId) { booking.googleEventId = eventId; await booking.save() }
        }
        await sendBookingConfirmedEmail(booking, settings)
      } catch (err) {
        console.error('Post-confirm error:', err.message)
      }
    }

    // When cancelled — delete Google Calendar event
    if (req.body.status === 'cancelled' && booking.googleEventId) {
      try {
        await deleteGoogleCalendarEvent(booking, settings)
      } catch (err) {
        console.error('Calendar delete error:', err.message)
      }
    }

    res.json(booking)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
