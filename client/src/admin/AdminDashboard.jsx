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
]

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate   = useNavigate()
  const token      = localStorage.getItem('dd_admin_token')
  const api        = useApi(token)

  const [active,   setActive]   = useState('bookings')
  const [settings, setSettings] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0d0d', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarW, flexShrink: 0, background: '#111', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, overflow: 'auto' }}>
        <div style={{ padding: '24px 20px 16px' }}>
          <img src="/assets/brand/DDLogo[01]_220710_184744.jpg" alt="Logo" style={{ height: 36, filter: 'brightness(0) invert(1)', marginBottom: 4 }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: 6 }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '8px 12px' }}>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => setActive(n.id)}
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
      <main style={{ marginLeft: sidebarW, flex: 1, padding: '32px 32px 60px', overflowY: 'auto' }}>
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'pending_deposit', 'pending_confirmation', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: filter === s ? '#0077cc' : 'rgba(255,255,255,0.08)', color: filter === s ? '#fff' : 'rgba(255,255,255,0.6)' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 360px' : '1fr', gap: 20 }}>
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

function HoursSection({ s, setS }) {
  const hours = s.hours || {}
  const setDay = (day, k, v) => setS(p => ({ ...p, hours: { ...p.hours, [day]: { ...p.hours?.[day], [k]: v } } }))
  return (
    <Card>
      <SectionTitle>Business Opening Hours</SectionTitle>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: 20 }}>Used to control whether the WhatsApp button shows the "in hours" or "out of hours" message.</p>
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
