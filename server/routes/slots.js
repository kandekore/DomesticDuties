import { Router } from 'express'
import Service from '../models/Service.js'
import Provider from '../models/Provider.js'
import { getSlotsForDate, getAvailableDatesForMonth } from '../utils/slots.js'

const router = Router()

// GET /api/slots/:serviceSlug/month/:yearMonth?provider=id
// Returns array of available date strings
router.get('/:serviceSlug/month/:yearMonth', async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.serviceSlug, active: true })
    if (!service) return res.status(404).json({ error: 'Service not found' })

    let providerId = req.query.provider
    if (!providerId) {
      // Pick first active provider that offers this service
      const p = await Provider.findOne({ active: true, services: service._id })
      if (!p) return res.json([])
      providerId = p._id
    }

    const dates = await getAvailableDatesForMonth(providerId, service.duration, service.bufferTime, req.params.yearMonth)
    res.json(dates)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/slots/:serviceSlug/date/:date?provider=id
// Returns array of available HH:MM time strings
router.get('/:serviceSlug/date/:date', async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.serviceSlug, active: true })
    if (!service) return res.status(404).json({ error: 'Service not found' })

    let providerId = req.query.provider
    if (!providerId) {
      const p = await Provider.findOne({ active: true, services: service._id })
      if (!p) return res.json([])
      providerId = p._id
    }

    const slots = await getSlotsForDate(providerId, service._id, req.params.date, service.duration, service.bufferTime)
    res.json(slots)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
