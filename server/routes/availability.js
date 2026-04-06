import { Router } from 'express'
import Availability from '../models/Availability.js'
import { adminAuth } from '../middleware/auth.js'

const router = Router()

// Get availability for a provider (admin)
router.get('/admin/:providerId', adminAuth, async (req, res) => {
  try {
    const rules = await Availability.find({ provider: req.params.providerId }).sort({ dayOfWeek: 1, overrideDate: 1 })
    res.json(rules)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Upsert a recurring rule
router.put('/admin/:providerId/day/:dayOfWeek', adminAuth, async (req, res) => {
  try {
    const { startTime, endTime, isAvailable } = req.body
    const rule = await Availability.findOneAndUpdate(
      { provider: req.params.providerId, dayOfWeek: Number(req.params.dayOfWeek), overrideDate: null },
      { startTime, endTime, isAvailable },
      { returnDocument: "after", upsert: true }
    )
    res.json(rule)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// Upsert a date override
router.put('/admin/:providerId/date/:date', adminAuth, async (req, res) => {
  try {
    const { startTime, endTime, isAvailable } = req.body
    const rule = await Availability.findOneAndUpdate(
      { provider: req.params.providerId, overrideDate: req.params.date, dayOfWeek: null },
      { startTime, endTime, isAvailable },
      { returnDocument: "after", upsert: true }
    )
    res.json(rule)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    await Availability.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
