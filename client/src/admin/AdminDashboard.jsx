import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_LABELS = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' }

function useApi(token) {
  const get = useCallback((url) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => {
      if (r.status === 401) { localStorage.removeItem('dd_admin_token'); window.location = '/admin/login'; }
      return r.json()
    }), [token])

  const put = useCallback((url, body) =>
    fetch(url, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()), [token])

  const post = useCallback((url, body) =>
    fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()), [token])

  const del = useCallback((url) =>
    fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()), [token])

  return { get, put, post, del }
}

// ── Shared input styles ───────────────────────────────────────────────────────
const inp = {
  width: '100%', padding: '10px 13px',
  background: 'rgba(255,255,255,0.07)',
  border: '2px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: 'white', fontSize: '0.9rem', outline: 'none',
  fontFamily: 'var(--font-body)',
}
function Input({ value, onChange, type = 'text', placeholder, style }) {
  return <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder}
    style={{ ...inp, ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
}
function Select({ value, onChange, children, style }) {
  return <select value={value || ''} onChange={onChange} style={{ ...inp, cursor: 'pointer', ...style }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
    {children}
  </select>
}
function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <div style={{ position: 'relative', width: 44, height: 24, flexShrink: 0 }}>
        <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
        <div style={{ position: 'absolute', inset: 0, background: checked ? '#0077cc' : 'rgba(255,255,255,0.15)', borderRadius: 12, transition: 'background 0.2s' }} />
        <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: 'left 0.2s' }} />
      </div>
      {label && <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>{label}</span>}
    </label>
  )
}
function Field({ label, helper, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{label}</label>
      {children}
      {helper && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: 5 }}>{helper}</p>}
    </div>
  )
}
function Card({ children, style }) {
  return <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, ...style }}>{children}</div>
}
function SectionTitle({ children }) {
  return <h3 style={{ color: '#fff', marginBottom: 20, fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>{children}</h3>
}

const statusColour = s => ({ pending_deposit:'#856404', pending_confirmation:'#1565c0', confirmed:'#155724', cancelled:'#c0392b', completed:'#2e7d32' })[s] || '#555'
const statusBg     = s => ({ pending_deposit:'#fff3cd', pending_confirmation:'#e8f4fd', confirmed:'#d4edda', cancelled:'#fde8e8', completed:'#e8f5e9' })[s] || '#f5f5f5'

// ── NAV ───────────────────────────────────────────────────────────────────────
// ── Tip banner helper ─────────────────────────────────────────────────────────
function Tip({ children }) {
  return (
    <div style={{ background: 'rgba(0,119,204,0.1)', border: '1px solid rgba(0,119,204,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>{children}</p>
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'bookings',      label: 'Bookings',        icon: '📅' },
  { id: 'quotes',        label: 'Quote Requests',  icon: '📋' },
  { id: 'services',      label: 'Services',        icon: '🧹' },
  { id: 'providers',     label: 'Providers',       icon: '👤' },
  { id: 'availability',  label: 'Availability',    icon: '🕐' },
  { id: 'blackouts',     label: 'Blackout Dates',  icon: '🚫' },
  { id: 'whatsapp',      label: 'WhatsApp Widget', icon: '💬' },
  { id: 'payment',       label: 'Payment',         icon: '💳' },
  { id: 'whatsapp_api',  label: 'WhatsApp API',    icon: '📱' },
  { id: 'google',        label: 'Google Calendar', icon: '📆' },
  { id: 'email',         label: 'Email Settings',  icon: '✉️' },
  { id: 'business',      label: 'Business Info',   icon: '🏢' },
  { id: 'hours',         label: 'Opening Hours',   icon: '🕑' },
  { id: 'guide',         label: 'Help & Guide',    icon: '📖' },
]

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate   = useNavigate()
  const token      = localStorage.getItem('dd_admin_token')
  const api        = useApi(token)

  const [active,      setActive]      = useState('bookings')
  const [settings,    setSettings]    = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return }
    api.get('/api/settings/admin').then(setSettings)
  }, [])

  const setSets = updater => setSettings(p => typeof updater === 'function' ? updater(p) : updater)

  const saveSettings = async () => {
    setSaving(true); setSaved(false)
    const d = await api.put('/api/settings/admin', settings)
    setSettings(d)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const logout = () => { localStorage.removeItem('dd_admin_token'); navigate('/admin/login') }

  const sidebarW = 220

  const handleNavClick = (id) => {
    setActive(id)
    setSidebarOpen(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0d0d', fontFamily: 'var(--font-body)' }}>
      {/* Mobile top bar */}
      <div className="admin-topbar" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 56, background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <img src="/assets/brand/logowhite300px.png" alt="Logo" style={{ height: 28 }} />
        <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.5rem', padding: 4 }} aria-label="Menu">
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 299 }} />}

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: sidebarW, flexShrink: 0, background: '#111', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, overflow: 'auto', zIndex: 300, transform: 'translateX(0)', transition: 'transform 0.25s ease' }}>
        <div style={{ padding: '24px 20px 16px' }}>
          <img src="/assets/brand/logowhite300px.png" alt="Logo" style={{ height: 36, marginBottom: 4 }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: 6 }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '8px 12px' }}>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => handleNavClick(n.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: 'none', background: active === n.id ? 'rgba(0,119,204,0.25)' : 'none', color: active === n.id ? '#4db8ff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: active === n.id ? 700 : 400, marginBottom: 2, textAlign: 'left' }}>
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={logout} style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main" style={{ marginLeft: sidebarW, flex: 1, padding: '32px 32px 60px', overflowY: 'auto' }}>
        {/* ── Bookings ── */}
        {active === 'bookings' && <BookingsSection api={api} token={token} />}
        {/* ── Quotes ── */}
        {active === 'quotes' && <QuotesSection api={api} />}
        {/* ── Services ── */}
        {active === 'services' && <ServicesSection api={api} />}
        {/* ── Providers ── */}
        {active === 'providers' && <ProvidersSection api={api} />}
        {/* ── Availability ── */}
        {active === 'availability' && <AvailabilitySection api={api} />}
        {/* ── Blackouts ── */}
        {active === 'blackouts' && <BlackoutsSection api={api} />}
        {/* ── Guide ── */}
        {active === 'guide' && <GuideSection />}

        {/* ── Settings sections ── */}
        {['whatsapp','payment','whatsapp_api','google','email','business','hours'].includes(active) && settings && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h2 style={{ color: '#fff', fontSize: '1.3rem' }}>{NAV_ITEMS.find(n => n.id === active)?.label}</h2>
              <button onClick={saveSettings} disabled={saving}
                style={{ padding: '10px 24px', background: '#0077cc', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>

            {active === 'whatsapp' && settings && <WhatsAppWidgetSection s={settings} setS={setSets} />}
            {active === 'payment'  && settings && <PaymentSection s={settings} setS={setSets} />}
            {active === 'whatsapp_api' && settings && <WhatsAppApiSection s={settings} setS={setSets} />}
            {active === 'google'   && settings && <GoogleSection s={settings} setS={setSets} api={api} />}
            {active === 'email'    && settings && <EmailSection s={settings} setS={setSets} />}
            {active === 'business' && settings && <BusinessSection s={settings} setS={setSets} />}
            {active === 'hours'    && settings && <HoursSection s={settings} setS={setSets} />}
          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-topbar { display: flex !important; }
          .admin-sidebar { transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'} !important; top: 0 !important; }
          .admin-overlay { display: block !important; }
          .admin-main { margin-left: 0 !important; padding: 16px 16px 60px !important; padding-top: 72px !important; }
          .admin-main table { font-size: 0.78rem; }
          .admin-main td, .admin-main th { padding: 8px 6px !important; }
          .admin-bookings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ── Bookings section ──────────────────────────────────────────────────────────
function BookingsSection({ api }) {
  const [bookings, setBookings] = useState([])
  const [filter,   setFilter]   = useState('')
  const [selected, setSelected] = useState(null)
  const [detail,   setDetail]   = useState(null)

  const load = useCallback(() => {
    const qs = filter ? `?status=${filter}` : ''
    api.get(`/api/bookings/admin${qs}`).then(d => setBookings(d.bookings || []))
  }, [api, filter])

  useEffect(() => { load() }, [load])

  const openDetail = async id => {
    const d = await api.get(`/api/bookings/admin/${id}`)
    setDetail(d)
    setSelected(id)
  }

  const updateStatus = async (id, status) => {
    await api.put(`/api/bookings/admin/${id}`, { status })
    load()
    if (detail?._id === id) openDetail(id)
  }

  const markDepositPaid = async id => {
    await api.put(`/api/bookings/admin/${id}`, { depositPaid: true, depositPaidAt: new Date(), status: 'pending_confirmation' })
    load()
    if (detail?._id === id) openDetail(id)
  }

  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: 20, fontSize: '1.3rem' }}>Bookings</h2>
      <Tip>Filter by "Pending Confirmation" to see bookings that need your attention. Bank transfer bookings auto-escalate after 24 hours if the deposit isn't confirmed.</Tip>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'pending_deposit', 'pending_confirmation', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: filter === s ? '#0077cc' : 'rgba(255,255,255,0.08)', color: filter === s ? '#fff' : 'rgba(255,255,255,0.6)' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="admin-bookings-grid" style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 360px' : '1fr', gap: 20 }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bookings.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)', padding: 20 }}>No bookings found.</p>}
          {bookings.map(b => (
            <Card key={b._id} style={{ cursor: 'pointer', border: selected === b._id ? '1px solid #0077cc' : '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => selected === b._id ? setSelected(null) : openDetail(b._id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{b.serviceTitle || b.service?.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{b.clientName} · {b.bookingDate} at {b.startTime}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: 4 }}>{b.clientPhone} · {b.clientEmail}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: statusBg(b.status), color: statusColour(b.status) }}>
                    {b.status?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  {b.depositPaid && <span style={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: 600 }}>✓ Deposit paid</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Detail panel */}
        {detail && (
          <Card style={{ position: 'sticky', top: 20, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <strong style={{ color: '#fff' }}>Booking Detail</strong>
              <button onClick={() => { setSelected(null); setDetail(null) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            {[
              ['Service',    detail.serviceTitle || detail.service?.title],
              ['Date',       detail.bookingDate],
              ['Time',       `${detail.startTime} – ${detail.endTime}`],
              ['Client',     detail.clientName],
              ['Email',      detail.clientEmail],
              ['Phone',      detail.clientPhone],
              ['Address',    detail.clientAddress],
              ['Notes',      detail.clientNotes],
              ['Payment',    detail.paymentMethod],
              ['Deposit',    detail.depositPaid ? `£${detail.depositAmount} ✓ paid` : `£${detail.depositAmount} ✗ unpaid`],
              ['Remaining',  `£${detail.remainingAmount}`],
              ['Cal event',  detail.googleEventId || '—'],
            ].map(([k, v]) => v && (
              <div key={k} style={{ marginBottom: 10, display: 'flex', gap: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', width: 80, flexShrink: 0 }}>{k}</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', wordBreak: 'break-all' }}>{v}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 16, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!detail.depositPaid && detail.paymentMethod === 'bank_transfer' && (
                <button onClick={() => markDepositPaid(detail._id)} style={{ padding: '9px', background: '#155724', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  ✓ Mark Deposit Received
                </button>
              )}
              {detail.status === 'pending_confirmation' && (
                <button onClick={() => updateStatus(detail._id, 'confirmed')} style={{ padding: '9px', background: '#0077cc', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  ✓ Confirm Booking
                </button>
              )}
              {detail.status === 'confirmed' && (
                <button onClick={() => updateStatus(detail._id, 'completed')} style={{ padding: '9px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  Mark Completed
                </button>
              )}
              {!['cancelled','completed'].includes(detail.status) && (
                <button onClick={() => { if (confirm('Cancel this booking?')) updateStatus(detail._id, 'cancelled') }} style={{ padding: '9px', background: 'rgba(192,57,43,0.15)', color: '#ff6b6b', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  Cancel Booking
                </button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// ── Quote Requests ────────────────────────────────────────────────────────────
function QuotesSection({ api }) {
  const [quotes, setQuotes] = useState([])
  const load = () => api.get('/api/contact/admin/quotes').then(setQuotes)
  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    await api.put(`/api/contact/admin/quotes/${id}`, { status })
    load()
  }

  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: 20, fontSize: '1.3rem' }}>Commercial Quote Requests</h2>
      <Tip>Quote requests come from the commercial quote form on the website. Try to respond within 24 hours. Mark as "Contacted" once you've reached out, then "Close" when done.</Tip>
      {quotes.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)' }}>No quote requests yet.</p>}
      {quotes.map(q => (
        <Card key={q._id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{q.name} — {q.premisesType || 'Enquiry'}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 4 }}>{q.email} · {q.phone}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{q.businessLocation} · Preferred: {q.preferredDate || '—'}</div>
              {q.requirements && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginTop: 6, fontStyle: 'italic' }}>"{q.requirements.slice(0,120)}{q.requirements.length > 120 ? '…' : ''}"</div>}
              {q.images?.length > 0 && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: 6 }}>{q.images.length} image(s) attached</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: q.status === 'new' ? '#fff3cd' : q.status === 'contacted' ? '#d4edda' : '#e8f5e9', color: q.status === 'new' ? '#856404' : '#155724' }}>
                {q.status?.toUpperCase()}
              </span>
              {q.status === 'new' && (
                <button onClick={() => updateStatus(q._id, 'contacted')} style={{ padding: '5px 10px', background: '#0077cc', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Mark Contacted</button>
              )}
              {q.status === 'contacted' && (
                <button onClick={() => updateStatus(q._id, 'closed')} style={{ padding: '5px 10px', background: '#155724', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Close</button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── Services section ──────────────────────────────────────────────────────────
function ServicesSection({ api }) {
  const [services, setServices] = useState([])
  const [form, setForm]         = useState(null)

  const load = () => api.get('/api/services/admin/all').then(setServices)
  useEffect(() => { load() }, [])

  const blank = { title: '', slug: '', description: '', duration: 60, bufferTime: 0, price: 0, depositMode: 'percent', depositPercent: 10, depositFixed: 0, paymentMethod: 'bank_transfer', category: 'other', active: true }

  const save = async () => {
    if (form._id) await api.put(`/api/services/admin/${form._id}`, form)
    else await api.post('/api/services/admin', form)
    setForm(null); load()
  }

  const del = async id => {
    if (!confirm('Delete this service?')) return
    await api.del(`/api/services/admin/${id}`)
    load()
  }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target?.value ?? e }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#fff', fontSize: '1.3rem' }}>Services</h2>
        <button onClick={() => setForm(blank)} style={{ padding: '8px 18px', background: '#0077cc', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>+ Add Service</button>
      </div>
      <Tip>The slug is the URL identifier (e.g. "oven-cleaning" creates the booking page at /book/oven-cleaning). Buffer time adds a gap after each booking for travel or cleanup. Don't change slugs once customers have bookmarked them.</Tip>

      {services.map(s => (
        <Card key={s._id} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#fff', fontWeight: 600 }}>{s.title}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginLeft: 12 }}>{s.duration}min · £{s.price} · {s.paymentMethod} · {s.active ? '✓ Active' : '✗ Inactive'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setForm({ ...s })} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Edit</button>
            <button onClick={() => del(s._id)} style={{ padding: '6px 14px', background: 'rgba(192,57,43,0.15)', color: '#ff6b6b', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Delete</button>
          </div>
        </Card>
      ))}

      {form && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ color: '#fff' }}>{form._id ? 'Edit Service' : 'New Service'}</h3>
              <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>
            <Field label="Title"><Input value={form.title} onChange={set('title')} /></Field>
            <Field label="Slug (URL key)" helper="e.g. oven-cleaning"><Input value={form.slug} onChange={set('slug')} /></Field>
            <Field label="Description"><textarea value={form.description || ''} onChange={set('description')} style={{ ...inp, resize: 'vertical', minHeight: 72 }} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Duration (mins)"><Input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: +e.target.value }))} /></Field>
              <Field label="Buffer (mins)"><Input type="number" value={form.bufferTime} onChange={e => setForm(p => ({ ...p, bufferTime: +e.target.value }))} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Price (£)"><Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: +e.target.value }))} /></Field>
              <Field label="Category"><Select value={form.category} onChange={set('category')}><option value="oven">Oven</option><option value="carpet_upholstery">Carpet/Upholstery</option><option value="other">Other</option></Select></Field>
            </div>
            <Field label="Deposit Mode">
              <Select value={form.depositMode} onChange={set('depositMode')}>
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="none">No Deposit</option>
              </Select>
            </Field>
            {form.depositMode === 'percent' && <Field label="Deposit %"><Input type="number" value={form.depositPercent} onChange={e => setForm(p => ({ ...p, depositPercent: +e.target.value }))} /></Field>}
            {form.depositMode === 'fixed'   && <Field label="Deposit £"><Input type="number" value={form.depositFixed} onChange={e => setForm(p => ({ ...p, depositFixed: +e.target.value }))} /></Field>}
            <Field label="Payment Method">
              <Select value={form.paymentMethod} onChange={set('paymentMethod')}>
                <option value="stripe">Stripe (card)</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="none">None</option>
              </Select>
            </Field>
            <Toggle checked={form.active} onChange={v => setForm(p => ({ ...p, active: v }))} label="Service Active" />
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={save} style={{ flex: 1, padding: '11px', background: '#0077cc', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Save</button>
              <button onClick={() => setForm(null)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Providers section ─────────────────────────────────────────────────────────
function ProvidersSection({ api }) {
  const [providers, setProviders] = useState([])
  const [services,  setServices]  = useState([])
  const [form, setForm]           = useState(null)

  const load = () => {
    api.get('/api/providers/admin').then(setProviders)
    api.get('/api/services/admin/all').then(setServices)
  }
  useEffect(() => { load() }, [])

  const blank = { name: '', email: '', password: '', phone: '', bio: '', services: [], active: true }

  const save = async () => {
    if (form._id) await api.put(`/api/providers/admin/${form._id}`, form)
    else await api.post('/api/providers/admin', form)
    setForm(null); load()
  }

  const del = async id => {
    if (!confirm('Delete this provider?')) return
    await api.del(`/api/providers/admin/${id}`)
    load()
  }

  const toggleService = id => {
    setForm(p => {
      const arr = p.services.map(s => s._id || s)
      return { ...p, services: arr.includes(id) ? arr.filter(s => s !== id) : [...arr, id] }
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#fff', fontSize: '1.3rem' }}>Providers / Staff</h2>
        <button onClick={() => setForm(blank)} style={{ padding: '8px 18px', background: '#0077cc', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>+ Add Provider</button>
      </div>
      <Tip>Each provider needs at least one service assigned and availability set up, otherwise no time slots will appear on the booking page. Leave the password blank when editing to keep the existing password.</Tip>

      {providers.map(p => (
        <Card key={p._id} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#fff', fontWeight: 600 }}>{p.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginLeft: 12 }}>{p.email}</span>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: 4 }}>
              Services: {p.services?.map(s => s.title).join(', ') || 'None'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setForm({ ...p, password: '' })} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Edit</button>
            <button onClick={() => del(p._id)} style={{ padding: '6px 14px', background: 'rgba(192,57,43,0.15)', color: '#ff6b6b', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Delete</button>
          </div>
        </Card>
      ))}

      {form && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ color: '#fff' }}>{form._id ? 'Edit Provider' : 'New Provider'}</h3>
              <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>
            <Field label="Name"><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></Field>
            <Field label="Password" helper={form._id ? 'Leave blank to keep existing' : ''}>
              <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </Field>
            <Field label="Phone"><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></Field>
            <Field label="Assigned Services">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {services.map(s => {
                  const assigned = (form.services || []).map(x => x._id || x).includes(s._id)
                  return (
                    <Toggle key={s._id} checked={assigned} onChange={() => toggleService(s._id)} label={s.title} />
                  )
                })}
              </div>
            </Field>
            <Toggle checked={form.active} onChange={v => setForm(p => ({ ...p, active: v }))} label="Active" />
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={save} style={{ flex: 1, padding: '11px', background: '#0077cc', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Save</button>
              <button onClick={() => setForm(null)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Availability section ──────────────────────────────────────────────────────
function AvailabilitySection({ api }) {
  const [providers,  setProviders]  = useState([])
  const [selected,   setSelected]   = useState('')
  const [rules,      setRules]      = useState([])
  const [saving,     setSaving]     = useState(null)

  useEffect(() => { api.get('/api/providers/admin').then(d => { setProviders(d); if (d[0]) setSelected(d[0]._id) }) }, [])

  useEffect(() => {
    if (!selected) return
    api.get(`/api/availability/admin/${selected}`).then(setRules)
  }, [selected])

  const weekRules = DAYS.map(day => {
    const dow = { sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6 }[day]
    return rules.find(r => r.dayOfWeek === dow && !r.overrideDate) || { dayOfWeek: dow, startTime: '09:00', endTime: '17:00', isAvailable: false }
  })

  const saveDay = async (dow, data) => {
    setSaving(dow)
    await api.put(`/api/availability/admin/${selected}/day/${dow}`, data)
    api.get(`/api/availability/admin/${selected}`).then(setRules)
    setSaving(null)
  }

  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: 20, fontSize: '1.3rem' }}>Availability</h2>
      <Tip>This controls which days and times appear on the booking calendar. Changes save automatically. The booking system offers fixed start times (9:00, 9:30, 12:00, 12:30) — only times that fall within these hours will be shown.</Tip>
      {providers.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)' }}>Add a provider first.</p>}

      {providers.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <Select value={selected} onChange={e => setSelected(e.target.value)} style={{ maxWidth: 280 }}>
            {providers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </Select>
        </div>
      )}

      {selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {weekRules.map((rule, i) => {
            const day = DAYS[i]
            const dow = rule.dayOfWeek
            return (
              <Card key={day} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ width: 80, color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{DAY_LABELS[day]}</div>
                <Toggle checked={rule.isAvailable} onChange={v => saveDay(dow, { ...rule, isAvailable: v })} />
                {rule.isAvailable && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>From</span>
                      <input type="time" value={rule.startTime} onChange={e => saveDay(dow, { ...rule, startTime: e.target.value })}
                        style={{ ...inp, width: 110 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>To</span>
                      <input type="time" value={rule.endTime} onChange={e => saveDay(dow, { ...rule, endTime: e.target.value })}
                        style={{ ...inp, width: 110 }} />
                    </div>
                  </>
                )}
                {saving === dow && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Saving…</span>}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Blackout Dates ────────────────────────────────────────────────────────────
function BlackoutsSection({ api }) {
  const [blackouts, setBlackouts] = useState([])
  const [newDate,   setNewDate]   = useState('')
  const [newReason, setNewReason] = useState('')

  const load = () => api.get('/api/blackouts').then(setBlackouts)
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!newDate) return
    await api.post('/api/blackouts/admin', { date: newDate, reason: newReason })
    setNewDate(''); setNewReason(''); load()
  }

  const del = async id => {
    await api.del(`/api/blackouts/admin/${id}`)
    load()
  }

  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: 20, fontSize: '1.3rem' }}>Blackout Dates</h2>
      <Tip>Blackout dates block all bookings across all providers. Use these for bank holidays, company holidays, or any days you're closed. Customers will see these dates greyed out on the calendar.</Tip>
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle>Add Blackout Date</SectionTitle>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Field label="Date" helper="This date will be blocked on the booking calendar">
            <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ width: 180 }} />
          </Field>
          <Field label="Reason (optional)">
            <Input value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="e.g. Bank holiday" style={{ width: 240 }} />
          </Field>
          <button onClick={add} style={{ padding: '10px 20px', background: '#0077cc', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, marginBottom: 20 }}>Add</button>
        </div>
      </Card>

      {blackouts.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)' }}>No blackout dates set.</p>}
      {blackouts.sort((a,b) => a.date.localeCompare(b.date)).map(b => (
        <Card key={b._id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff' }}>{b.date} {b.reason && <span style={{ color: 'rgba(255,255,255,0.4)' }}>— {b.reason}</span>}</span>
          <button onClick={() => del(b._id)} style={{ padding: '5px 12px', background: 'rgba(192,57,43,0.15)', color: '#ff6b6b', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
        </Card>
      ))}
    </div>
  )
}

// ── Settings sub-sections ─────────────────────────────────────────────────────
function WhatsAppWidgetSection({ s, setS }) {
  const wa = s.whatsapp || {}
  const set = (k, v) => setS(p => ({ ...p, whatsapp: { ...p.whatsapp, [k]: v } }))
  return (
    <Card>
      <SectionTitle>WhatsApp Chat Button</SectionTitle>
      <Tip>This controls the floating chat button on the website. The number format must be country code + number with no spaces or + sign (e.g. 447455552220). The button uses your Opening Hours to show different messages during and outside business hours.</Tip>
      <Field label="Enable WhatsApp Button"><Toggle checked={wa.enabled} onChange={v => set('enabled', v)} label="Show WhatsApp button on website" /></Field>
      <Field label="WhatsApp Number" helper="Include country code, no +, no spaces. e.g. 447455552220">
        <Input value={wa.number} onChange={e => set('number', e.target.value)} placeholder="447455552220" />
      </Field>
      <Field label="Default Message (within hours)">
        <textarea value={wa.prefilledMessage || ''} onChange={e => set('prefilledMessage', e.target.value)} style={{ ...inp, resize: 'vertical', minHeight: 72 }} />
      </Field>
      <Field label="Out of Hours Message">
        <textarea value={wa.outOfHoursMessage || ''} onChange={e => set('outOfHoursMessage', e.target.value)} style={{ ...inp, resize: 'vertical', minHeight: 72 }} />
      </Field>
      <Field label="Tooltip Text"><Input value={wa.tooltipText} onChange={e => set('tooltipText', e.target.value)} /></Field>
      <Field label="Button Position">
        <Select value={wa.position} onChange={e => set('position', e.target.value)}>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
        </Select>
      </Field>
      <Field label="Show Outside Business Hours"><Toggle checked={wa.showOutsideHours} onChange={v => set('showOutsideHours', v)} label="Show button even when outside business hours" /></Field>
    </Card>
  )
}

function PaymentSection({ s, setS }) {
  const stripe = s.stripe || {}
  const bank   = s.bankTransfer || {}
  const setStripe = (k, v) => setS(p => ({ ...p, stripe: { ...p.stripe, [k]: v } }))
  const setBank   = (k, v) => setS(p => ({ ...p, bankTransfer: { ...p.bankTransfer, [k]: v } }))
  return (
    <div>
      <Tip>Most small service businesses find bank transfer simpler — no fees and full control. Use Stripe if you want instant automated payment confirmation. Each service can be set individually to use Stripe, Bank Transfer, or no payment.</Tip>
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle>Stripe (Card Payments)</SectionTitle>
        <Field label="Enable Stripe"><Toggle checked={stripe.enabled} onChange={v => setStripe('enabled', v)} label="Accept card payments via Stripe" /></Field>
        <Field label="Publishable Key"><Input value={stripe.publishableKey} onChange={e => setStripe('publishableKey', e.target.value)} placeholder="pk_live_…" /></Field>
        <Field label="Secret Key"><Input type="password" value={stripe.secretKey} onChange={e => setStripe('secretKey', e.target.value)} placeholder="sk_live_…" /></Field>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>Set individual service payment methods to "Stripe" to use card payments for that service.</p>
      </Card>
      <Card>
        <SectionTitle>Bank Transfer Details</SectionTitle>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: 16 }}>Shown to customers after booking when payment method is "Bank Transfer".</p>
        <Field label="Account Name"><Input value={bank.accountName} onChange={e => setBank('accountName', e.target.value)} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Sort Code"><Input value={bank.sortCode} onChange={e => setBank('sortCode', e.target.value)} placeholder="00-00-00" /></Field>
          <Field label="Account Number"><Input value={bank.accountNumber} onChange={e => setBank('accountNumber', e.target.value)} /></Field>
        </div>
        <Field label="Payment Instructions">
          <textarea value={bank.instructions || ''} onChange={e => setBank('instructions', e.target.value)} style={{ ...inp, resize: 'vertical', minHeight: 72 }} />
        </Field>
      </Card>
    </div>
  )
}

function WhatsAppApiSection({ s, setS }) {
  const cfg = s.whatsappApi || {}
  const set = (k, v) => setS(p => ({ ...p, whatsappApi: { ...p.whatsappApi, [k]: v } }))
  return (
    <Card>
      <SectionTitle>WhatsApp Business API (Reminders)</SectionTitle>
      <Tip>This sends automatic WhatsApp reminders at 9am the day before each confirmed booking. Twilio is easier to set up for testing; Meta is better for production. Only confirmed bookings receive reminders — make sure you confirm bookings promptly.</Tip>
      <Field label="Enable WhatsApp Reminders"><Toggle checked={cfg.enabled} onChange={v => set('enabled', v)} label="Send WhatsApp appointment reminders via API" /></Field>
      <Field label="Provider">
        <Select value={cfg.provider} onChange={e => set('provider', e.target.value)}>
          <option value="twilio">Twilio</option>
          <option value="meta">Meta (WhatsApp Business Platform)</option>
        </Select>
      </Field>
      {cfg.provider === 'twilio' && (
        <>
          <Field label="Account SID"><Input value={cfg.accountSid} onChange={e => set('accountSid', e.target.value)} /></Field>
          <Field label="Auth Token"><Input type="password" value={cfg.authToken} onChange={e => set('authToken', e.target.value)} /></Field>
          <Field label="From Number" helper="e.g. whatsapp:+14155238886"><Input value={cfg.fromNumber} onChange={e => set('fromNumber', e.target.value)} /></Field>
        </>
      )}
      {cfg.provider === 'meta' && (
        <>
          <Field label="Phone Number ID"><Input value={cfg.fromNumber} onChange={e => set('fromNumber', e.target.value)} /></Field>
          <Field label="Access Token"><Input type="password" value={cfg.accessToken} onChange={e => set('accessToken', e.target.value)} /></Field>
        </>
      )}
    </Card>
  )
}

function GoogleSection({ s, setS, api }) {
  const cfg = s.google || {}
  const set = (k, v) => setS(p => ({ ...p, google: { ...p.google, [k]: v } }))
  const [providers, setProviders] = useState([])
  const [authUrl,   setAuthUrl]   = useState('')

  useEffect(() => {
    api.get('/api/providers/admin').then(setProviders)
  }, [])

  const connectGoogle = async (providerId) => {
    const d = await api.get(`/api/google/auth-url/${providerId}`)
    if (d.url) window.open(d.url, '_blank', 'width=500,height=600')
    else alert(d.error || 'Failed to get auth URL')
  }

  const disconnect = async (providerId) => {
    await api.del(`/api/google/disconnect/${providerId}`)
    api.get('/api/providers/admin').then(setProviders)
  }

  return (
    <div>
      <Tip>When enabled, confirming a booking creates a calendar event with the client's details. Cancelling removes it. You'll need a Google Cloud project with the Calendar API enabled and OAuth 2.0 credentials. Each provider connects their own calendar below.</Tip>
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle>Google Calendar Configuration</SectionTitle>
        <Field label="Enable Google Calendar"><Toggle checked={cfg.enabled} onChange={v => set('enabled', v)} label="Create calendar events when bookings are confirmed" /></Field>
        <Field label="OAuth Client ID"><Input value={cfg.clientId} onChange={e => set('clientId', e.target.value)} /></Field>
        <Field label="OAuth Client Secret"><Input type="password" value={cfg.clientSecret} onChange={e => set('clientSecret', e.target.value)} /></Field>
        <Field label="Redirect URI" helper={`${window.location.origin}/api/google/callback`}>
          <Input value={cfg.redirectUri} onChange={e => set('redirectUri', e.target.value)} placeholder={`${window.location.origin}/api/google/callback`} />
        </Field>
      </Card>

      {providers.length > 0 && (
        <Card>
          <SectionTitle>Provider Google Calendar Connections</SectionTitle>
          {providers.map(p => (
            <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ color: '#fff', fontWeight: 600 }}>{p.name}</span>
                {p.googleRefreshToken
                  ? <span style={{ color: '#2e7d32', fontSize: '0.8rem', marginLeft: 10 }}>✓ Connected</span>
                  : <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginLeft: 10 }}>Not connected</span>}
              </div>
              {p.googleRefreshToken
                ? <button onClick={() => disconnect(p._id)} style={{ padding: '6px 14px', background: 'rgba(192,57,43,0.15)', color: '#ff6b6b', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Disconnect</button>
                : <button onClick={() => connectGoogle(p._id)} style={{ padding: '6px 14px', background: '#0077cc', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }} disabled={!cfg.enabled}>Connect Google Calendar</button>}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

function EmailSection({ s, setS }) {
  const cfg = s.email || {}
  const set = (k, v) => setS(p => ({ ...p, email: { ...p.email, [k]: v } }))
  return (
    <Card>
      <SectionTitle>Email Configuration</SectionTitle>
      <Tip>For Gmail, use an App Password (not your regular password). Enable 2-Step Verification in your Google Account, then go to Security &gt; App Passwords to generate one. The Admin Email receives booking alerts; the Quote Email receives commercial quote requests.</Tip>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="From Name"><Input value={cfg.fromName} onChange={e => set('fromName', e.target.value)} /></Field>
        <Field label="From Address"><Input type="email" value={cfg.fromAddress} onChange={e => set('fromAddress', e.target.value)} /></Field>
        <Field label="Admin Email (receives bookings)"><Input type="email" value={cfg.adminEmail} onChange={e => set('adminEmail', e.target.value)} /></Field>
        <Field label="Quote Email (receives quote requests)"><Input type="email" value={cfg.quoteEmail} onChange={e => set('quoteEmail', e.target.value)} /></Field>
        <Field label="SMTP Host"><Input value={cfg.smtpHost || ''} onChange={e => set('smtpHost', e.target.value)} placeholder="smtp.gmail.com" /></Field>
        <Field label="SMTP Port"><Input type="number" value={cfg.smtpPort} onChange={e => set('smtpPort', +e.target.value)} /></Field>
        <Field label="SMTP Username"><Input value={cfg.smtpUser || ''} onChange={e => set('smtpUser', e.target.value)} /></Field>
        <Field label="SMTP Password"><Input type="password" value={cfg.smtpPass || ''} onChange={e => set('smtpPass', e.target.value)} /></Field>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', marginTop: 8 }}>If SMTP is not configured, the server will fall back to the Gmail credentials in the .env file.</p>
    </Card>
  )
}

function BusinessSection({ s, setS }) {
  const cfg = s.business || {}
  const set = (k, v) => setS(p => ({ ...p, business: { ...p.business, [k]: v } }))
  return (
    <Card>
      <SectionTitle>Business Information</SectionTitle>
      <Field label="Business Name"><Input value={cfg.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Email"><Input type="email" value={cfg.email} onChange={e => set('email', e.target.value)} /></Field>
      <Field label="Phone"><Input value={cfg.phone} onChange={e => set('phone', e.target.value)} /></Field>
      <Field label="Address"><Input value={cfg.address || ''} onChange={e => set('address', e.target.value)} /></Field>
      <Field label="Facebook URL"><Input value={cfg.facebook || ''} onChange={e => set('facebook', e.target.value)} /></Field>
    </Card>
  )
}

// ── Help & Guide ─────────────────────────────────────────────────────────────
function GuideSection() {
  const section = (title, content) => (
    <Card style={{ marginBottom: 16 }}>
      <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 12 }}>{title}</h3>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: 1.8 }}>{content}</div>
    </Card>
  )

  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: 8, fontSize: '1.3rem' }}>Help & Guide</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontSize: '0.9rem' }}>Everything you need to know about managing your booking system.</p>

      {section('Getting Started Checklist', (
        <div>
          <p style={{ marginBottom: 12 }}>Follow these steps to get your booking system up and running:</p>
          <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong style={{ color: '#fff' }}>Change the default admin password</strong> — update it in the database for security.</li>
            <li><strong style={{ color: '#fff' }}>Add your services</strong> — go to Services and create each bookable service with the correct duration, price and deposit settings.</li>
            <li><strong style={{ color: '#fff' }}>Add at least one provider</strong> — go to Providers, create a staff member and assign your services to them.</li>
            <li><strong style={{ color: '#fff' }}>Set up availability</strong> — go to Availability and set working hours for your provider. Without this, no time slots will appear.</li>
            <li><strong style={{ color: '#fff' }}>Configure email</strong> — go to Email Settings and set up SMTP so booking confirmations and alerts are sent.</li>
            <li><strong style={{ color: '#fff' }}>Add bank transfer details</strong> — go to Payment and enter your bank details (if using bank transfer for deposits).</li>
            <li><strong style={{ color: '#fff' }}>Set business info and hours</strong> — go to Business Info and Opening Hours.</li>
            <li><strong style={{ color: '#fff' }}>Add blackout dates</strong> — block any upcoming bank holidays or closures.</li>
          </ol>
        </div>
      ))}

      {section('How the Booking Flow Works', (
        <div>
          <p style={{ marginBottom: 12 }}>Here's what happens when a customer makes a booking:</p>
          <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Customer visits the booking page, selects a date and time slot, and fills in their details.</li>
            <li><strong style={{ color: '#fff' }}>Stripe:</strong> Customer pays the deposit by card immediately. It's marked as paid automatically.</li>
            <li><strong style={{ color: '#fff' }}>Bank Transfer:</strong> Customer sees your bank details and transfers the deposit manually.</li>
            <li>You receive an email notification and the booking appears here under <strong style={{ color: '#4db8ff' }}>Bookings</strong>.</li>
            <li>For bank transfers, click <strong style={{ color: '#fff' }}>"Mark Deposit Received"</strong> once payment arrives, then <strong style={{ color: '#fff' }}>"Confirm Booking"</strong>.</li>
            <li>Confirmation emails are sent automatically. A Google Calendar event is created if connected.</li>
            <li>The day before the appointment, a WhatsApp reminder is sent at 9am (if configured).</li>
            <li>After the job, mark the booking as <strong style={{ color: '#fff' }}>"Completed"</strong>.</li>
          </ol>
        </div>
      ))}

      {section('Daily Workflow', (
        <div>
          <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Check <strong style={{ color: '#4db8ff' }}>Bookings</strong> — filter by "Pending Confirmation" to see what needs your attention.</li>
            <li>Check <strong style={{ color: '#4db8ff' }}>Quote Requests</strong> — filter by "New" and respond within 24 hours.</li>
            <li>Mark completed jobs as "Completed" to keep everything tidy.</li>
          </ol>
          <Tip>Bank transfer bookings that stay in "Pending Deposit" for over 24 hours are automatically escalated to "Pending Confirmation" with a note — so you can follow up directly.</Tip>
        </div>
      ))}

      {section('Booking Time Slots', (
        <div>
          <p style={{ marginBottom: 8 }}>The system uses <strong style={{ color: '#fff' }}>fixed start times: 9:00, 9:30, 12:00, and 12:30</strong>.</p>
          <p style={{ marginBottom: 8 }}>When a customer selects a date, only slots that fit the service duration within the provider's hours and don't overlap existing bookings are shown.</p>
          <p>For example, if a 150-minute service is booked at 9:00, the 9:30 slot becomes unavailable (they overlap). This means a <strong style={{ color: '#fff' }}>maximum of 2 bookings per day</strong> — one morning, one afternoon.</p>
        </div>
      ))}

      {section('Services Setup', (
        <div>
          <p style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Slug</strong> — the URL identifier. "oven-cleaning" creates the page at /book/oven-cleaning. Don't change slugs once customers have bookmarked them.</p>
          <p style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Duration</strong> — how long the service takes in minutes.</p>
          <p style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Buffer Time</strong> — gap after each booking before the next slot is available. Use this for travel or cleanup time.</p>
          <p style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Deposit Mode</strong> — Percentage (e.g. 10% of the price), Fixed amount (e.g. £20), or None.</p>
          <p><strong style={{ color: '#fff' }}>Payment Method</strong> — Stripe (card), Bank Transfer, or None. Set per service.</p>
        </div>
      ))}

      {section('Payment Setup', (
        <div>
          <p style={{ fontWeight: 600, color: '#fff', marginBottom: 8 }}>Stripe (Card Payments)</p>
          <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            <li>Get your API keys from the <strong style={{ color: '#fff' }}>Stripe Dashboard</strong> → Developers → API Keys.</li>
            <li>Enter Publishable Key and Secret Key in <strong style={{ color: '#4db8ff' }}>Payment</strong> settings.</li>
            <li>Set up a webhook in Stripe: endpoint URL is <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>https://yourdomain.com/api/bookings/stripe-webhook</code>, event: payment_intent.succeeded.</li>
            <li>Add the webhook signing secret to your server .env file as STRIPE_WEBHOOK_SECRET.</li>
          </ol>
          <p style={{ fontWeight: 600, color: '#fff', marginBottom: 8 }}>Bank Transfer</p>
          <p>Enter your account name, sort code, account number and payment instructions. These are shown to customers after booking. You manually mark deposits as received in the Bookings section.</p>
        </div>
      ))}

      {section('Google Calendar Setup', (
        <div>
          <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Create a project in <strong style={{ color: '#fff' }}>Google Cloud Console</strong>.</li>
            <li>Enable the <strong style={{ color: '#fff' }}>Google Calendar API</strong>.</li>
            <li>Create <strong style={{ color: '#fff' }}>OAuth 2.0 credentials</strong> (Web application type).</li>
            <li>Add the redirect URI shown in the Google Calendar settings section.</li>
            <li>Enter Client ID, Client Secret, and Redirect URI in <strong style={{ color: '#4db8ff' }}>Google Calendar</strong> settings, then save.</li>
            <li>Click <strong style={{ color: '#fff' }}>"Connect Google Calendar"</strong> for each provider and authorise in the popup.</li>
          </ol>
          <Tip>Each provider connects their own Google Calendar. Calendar events include the service name, client name, address and notes.</Tip>
        </div>
      ))}

      {section('Email Setup', (
        <div>
          <p style={{ marginBottom: 8 }}>Emails are sent for: booking confirmations, booking alerts (to you), confirmed notifications, quote confirmations, and quote alerts.</p>
          <p style={{ marginBottom: 8 }}>For <strong style={{ color: '#fff' }}>Gmail</strong>: use an App Password, not your regular password. Enable 2-Step Verification first, then go to Google Account → Security → App Passwords.</p>
          <p>If SMTP settings aren't configured, the system falls back to the Gmail credentials in the server .env file.</p>
        </div>
      ))}

      {section('WhatsApp Reminders', (
        <div>
          <p style={{ marginBottom: 8 }}>A background job runs at <strong style={{ color: '#fff' }}>9:00am every morning</strong> and sends a WhatsApp reminder to all confirmed bookings for the following day.</p>
          <p style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Twilio</strong> — easier to set up. Enter Account SID, Auth Token, and WhatsApp-enabled number from your Twilio Console.</p>
          <p><strong style={{ color: '#fff' }}>Meta</strong> — better for production. Enter your Phone Number ID and Access Token from Meta Business Platform.</p>
        </div>
      ))}

      {section('Troubleshooting', (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <strong style={{ color: '#ff6b6b' }}>No time slots showing?</strong>
            <p>Check that: (1) a provider exists and is active, (2) the provider is assigned to that service, (3) availability is set for that day of the week, (4) the service duration fits within the provider's hours.</p>
          </div>
          <div>
            <strong style={{ color: '#ff6b6b' }}>Emails not sending?</strong>
            <p>Verify SMTP settings in Email Settings. For Gmail, you must use an App Password with 2-Step Verification enabled. Check your spam folder.</p>
          </div>
          <div>
            <strong style={{ color: '#ff6b6b' }}>Google Calendar not creating events?</strong>
            <p>Make sure Google Calendar is enabled in settings AND the provider has connected their calendar (green "Connected" badge in Google Calendar section).</p>
          </div>
          <div>
            <strong style={{ color: '#ff6b6b' }}>WhatsApp reminders not sending?</strong>
            <p>Check that WhatsApp API is enabled, credentials are correct, and the booking status is "Confirmed" (not just "Pending"). Reminders only send for confirmed bookings.</p>
          </div>
          <div>
            <strong style={{ color: '#ff6b6b' }}>Booking stuck on "Pending Deposit"?</strong>
            <p>For bank transfer bookings, you need to manually click "Mark Deposit Received". After 24 hours, the system auto-escalates it with an admin note so you can follow up.</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function HoursSection({ s, setS }) {
  const hours = s.hours || {}
  const setDay = (day, k, v) => setS(p => ({ ...p, hours: { ...p.hours, [day]: { ...p.hours?.[day], [k]: v } } }))
  return (
    <Card>
      <SectionTitle>Business Opening Hours</SectionTitle>
      <Tip>These hours control the WhatsApp widget's in/out-of-hours messages only. Booking availability is managed separately in the Availability section.</Tip>
      {DAYS.map(day => {
        const h = hours[day] || { open: false, from: '09:00', to: '17:00' }
        return (
          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 90, color: '#fff', fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{day}</div>
            <Toggle checked={h.open} onChange={v => setDay(day, 'open', v)} />
            {h.open && (
              <>
                <input type="time" value={h.from} onChange={e => setDay(day, 'from', e.target.value)} style={{ ...inp, width: 110 }} />
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>–</span>
                <input type="time" value={h.to} onChange={e => setDay(day, 'to', e.target.value)} style={{ ...inp, width: 110 }} />
              </>
            )}
          </div>
        )
      })}
    </Card>
  )
}
