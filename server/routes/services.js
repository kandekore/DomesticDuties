import { Router } from 'express'
import Service from '../models/Service.js'
import { adminAuth } from '../middleware/auth.js'

const router = Router()

// Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ active: true })
    res.json(services)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, active: true })
    if (!service) return res.status(404).json({ error: 'Not found' })
    res.json(service)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Admin CRUD
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const services = await Service.find()
    res.json(services)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/admin', adminAuth, async (req, res) => {
  try {
    const service = await Service.create(req.body)
    res.status(201).json(service)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.put('/admin/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" })
    if (!service) return res.status(404).json({ error: 'Not found' })
    res.json(service)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
