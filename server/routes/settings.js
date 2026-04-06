import { Router } from 'express'
import Settings from '../models/Settings.js'
import { adminAuth } from '../middleware/auth.js'

const router = Router()

// Public — client app fetches this for WhatsApp widget config
router.get('/', async (req, res) => {
  try {
    let s = await Settings.findOne({ singleton: 'main' })
    if (!s) s = await Settings.create({ singleton: 'main' })
    // Strip sensitive fields for public response
    const pub = s.toObject()
    delete pub.stripe?.secretKey
    delete pub.whatsappApi?.authToken
    delete pub.whatsappApi?.accessToken
    delete pub.google?.clientSecret
    delete pub.adminPassword
    delete pub.email?.smtpPass
    res.json(pub)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Admin — full settings
router.get('/admin', adminAuth, async (req, res) => {
  try {
    let s = await Settings.findOne({ singleton: 'main' })
    if (!s) s = await Settings.create({ singleton: 'main' })
    res.json(s)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/admin', adminAuth, async (req, res) => {
  try {
    const s = await Settings.findOneAndUpdate(
      { singleton: 'main' },
      { $set: req.body },
      { returnDocument: "after", upsert: true, runValidators: true }
    )
    res.json(s)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
