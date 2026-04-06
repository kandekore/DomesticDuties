import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Admin from '../models/Admin.js'
import Provider from '../models/Provider.js'

const router = Router()

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const admin = await Admin.findOne({ email: email.toLowerCase() })
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await admin.comparePassword(password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Provider login
router.post('/provider/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const provider = await Provider.findOne({ email: email.toLowerCase() })
    if (!provider) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await provider.comparePassword(password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: provider._id, role: 'provider' }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, provider: { id: provider._id, name: provider.name, email: provider.email } })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
