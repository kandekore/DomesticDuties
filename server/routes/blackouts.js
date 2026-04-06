import { Router } from 'express'
import BlackoutDate from '../models/BlackoutDate.js'
import { adminAuth } from '../middleware/auth.js'

const router = Router()

// Public — client needs this to grey out calendar dates
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query
    const filter = {}
    if (from) filter.date = { $gte: from }
    if (to) filter.date = { ...filter.date, $lte: to }
    const dates = await BlackoutDate.find(filter).sort({ date: 1 })
    res.json(dates)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/admin', adminAuth, async (req, res) => {
  try {
    const b = await BlackoutDate.create(req.body)
    res.status(201).json(b)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    await BlackoutDate.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
