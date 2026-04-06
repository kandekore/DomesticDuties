import jwt from 'jsonwebtoken'

export function adminAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorised' })
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    req.admin = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function providerAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorised' })
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    if (payload.role !== 'provider' && payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    req.provider = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
