import { Router } from 'express'
import Provider from '../models/Provider.js'
import Settings from '../models/Settings.js'
import { adminAuth } from '../middleware/auth.js'
import { getAuthUrl, exchangeCode } from '../utils/google.js'

const router = Router()

// Initiate OAuth flow for a provider
router.get('/auth-url/:providerId', adminAuth, async (req, res) => {
  try {
    const settings = await Settings.findOne({ singleton: 'main' })
    const url = getAuthUrl(settings)
    if (!url) return res.status(400).json({ error: 'Google OAuth not configured' })
    // Store providerId in state so callback knows which provider to update
    res.json({ url: url + `&state=${req.params.providerId}` })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state: providerId } = req.query
    const settings = await Settings.findOne({ singleton: 'main' })
    const tokens = await exchangeCode(code, settings)
    await Provider.findByIdAndUpdate(providerId, { googleRefreshToken: tokens.refresh_token })
    res.send('<script>window.close()</script><p>Google Calendar connected. You can close this window.</p>')
  } catch (e) {
    res.status(500).send('OAuth error: ' + e.message)
  }
})

// Disconnect Google for a provider
router.delete('/disconnect/:providerId', adminAuth, async (req, res) => {
  try {
    await Provider.findByIdAndUpdate(req.params.providerId, { googleRefreshToken: null })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
