import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Login failed')
      localStorage.setItem('dd_admin_token', d.token)
      navigate('/admin')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
      <div style={{ width: 380, background: '#1a1a1a', borderRadius: 16, padding: 40, border: '1px solid rgba(255,255,255,0.08)' }}>
        <img src="/assets/brand/logowhite300px.png" alt="Logo" style={{ height: 40, marginBottom: 32 }} />
        <h2 style={{ color: '#fff', marginBottom: 6, fontSize: '1.3rem' }}>Admin Login</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: 28 }}>Domestic Duties Commercial Ltd.</p>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
          </div>
          {error && <p style={{ color: '#ff6b6b', fontSize: '0.88rem', marginBottom: 16 }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: 'var(--accent, #0077cc)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
