import { Router } from 'express'
import Provider from '../models/Provider.js'
import { adminAuth } from '../middleware/auth.js'

const router = Router()

// Public — list active providers (name + id only, for booking form)
router.get('/', async (req, res) => {
  try {
    const providers = await Provider.find({ active: true }, 'name _id services').populate('services', 'title slug category')
    res.json(providers)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Admin CRUD
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const providers = await Provider.find().populate('services', 'title slug category').select('-password')
    res.json(providers)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/admin', adminAuth, async (req, res) => {
  try {
    const provider = await Provider.create(req.body)
    res.status(201).json(provider)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.put('/admin/:id', adminAuth, async (req, res) => {
  try {
    const update = { ...req.body }
    if (update.password === '') delete update.password
    const provider = await Provider.findByIdAndUpdate(req.params.id, update, { returnDocument: "after" }).select('-password')
    if (!provider) return res.status(404).json({ error: 'Not found' })
    res.json(provider)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    await Provider.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
