import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import CommercialQuote from '../models/CommercialQuote.js'
import Settings from '../models/Settings.js'
import { adminAuth } from '../middleware/auth.js'
import { sendQuoteToAdmin, sendQuoteConfirmation, sendMail } from '../utils/email.js'

const router = Router()

const uploadDir = path.join(process.cwd(), 'uploads', 'quotes')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g,'_')}`),
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/
    cb(null, allowed.test(file.mimetype))
  },
})

// Submit commercial quote request
router.post('/quote', upload.array('images', 5), async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: 'main' })
    const { name, email, phone, businessLocation, premisesType, preferredDate, requirements, preferredContact } = req.body
    const imagePaths = (req.files || []).map(f => f.path)

    const quote = await CommercialQuote.create({
      name, email, phone, businessLocation, premisesType, preferredDate, requirements, preferredContact,
      images: imagePaths,
    })

    // Send emails (non-blocking)
    sendQuoteToAdmin(quote, req.files || [], settings).catch(e => console.error('Quote admin email:', e.message))
    sendQuoteConfirmation(quote).catch(e => console.error('Quote confirm email:', e.message))

    res.json({ ok: true, id: quote._id })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// General contact message (Contact Us page)
router.post('/message', async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: 'main' })
    const { name, email, phone, message } = req.body
    const adminEmail = settings?.email?.adminEmail || process.env.GMAIL_USER
    const html = `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || '—'}</p><p><strong>Message:</strong><br>${message}</p>`
    await sendMail({ to: adminEmail, subject: `Website Enquiry from ${name}`, html })
    await sendMail({
      to: email,
      subject: 'We\'ve received your message – Domestic Duties Commercial Ltd.',
      html: `<p>Hi ${name}, thank you for your message. We'll be in touch within 24 hours.</p><p>Domestic Duties Commercial Ltd.</p>`,
    })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Admin — list quotes
router.get('/admin/quotes', adminAuth, async (req, res) => {
  try {
    const quotes = await CommercialQuote.find().sort({ createdAt: -1 })
    res.json(quotes)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/admin/quotes/:id', adminAuth, async (req, res) => {
  try {
    const q = await CommercialQuote.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" })
    res.json(q)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.delete('/admin/quotes/:id', adminAuth, async (req, res) => {
  try {
    const q = await CommercialQuote.findById(req.params.id)
    if (q?.images) q.images.forEach(p => fs.unlink(p, () => {}))
    await CommercialQuote.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
