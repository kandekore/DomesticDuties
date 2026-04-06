import { useState, useRef } from 'react'
import { CheckCircle, Upload, X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const PREMISES_TYPES = [
  'Office / Workspace', 'Retail Shop', 'Car Showroom', 'Restaurant / Pub',
  'Factory / Warehouse', 'School / College', 'Council Office', 'Salon / Spa',
  'Church', 'Library', 'Other',
]

export default function CommercialQuote() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    businessLocation: '', premisesType: '',
    preferredDate: '', requirements: '',
    preferredContact: 'email',
  })
  const [files,    setFiles]    = useState([])
  const [status,   setStatus]   = useState(null) // null | 'sending' | 'ok' | 'error'
  const [formErr,  setFormErr]  = useState('')
  const fileRef = useRef()

  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const addFiles = e => {
    const newFiles = Array.from(e.target.files || [])
    setFiles(prev => {
      const combined = [...prev, ...newFiles]
      if (combined.length > 5) { setFormErr('Maximum 5 images allowed.'); return prev }
      const totalSize = combined.reduce((a, f) => a + f.size, 0)
      if (totalSize > 20 * 1024 * 1024) { setFormErr('Total file size must not exceed 20MB.'); return prev }
      setFormErr('')
      return combined
    })
    e.target.value = ''
  }

  const removeFile = i => setFiles(p => p.filter((_, j) => j !== i))

  const submit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) { setFormErr('Please fill in all required fields.'); return }
    setStatus('sending')
    setFormErr('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      files.forEach(f => fd.append('images', f))

      const r = await fetch('/api/contact/quote', { method: 'POST', body: fd })
      if (!r.ok) throw new Error()
      setStatus('ok')
    } catch {
      setStatus('error')
      setFormErr('Something went wrong. Please call us directly on 07455 552220.')
    }
  }

  return (
    <main style={{ paddingTop: 'var(--header-h)' }}>
      <title>Commercial Cleaning Quote – Domestic Duties Commercial Ltd.</title>

      {/* Hero */}
      <section className="hero">
        <img src="/assets/images/20250816_105808.jpg" alt="" className="hero-bg-img" />
        <div className="container">
          <div className="hero-content">
            <h1>Request a Commercial<br />Cleaning Quote</h1>
            <p>Tell us about your premises and requirements. Upload photos for the most accurate quote. We respond within 24 hours.</p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section section-light">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'flex-start' }}>
            {status === 'ok' ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d4edda', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={36} style={{ color: '#155724' }} />
                </div>
                <h2 style={{ marginBottom: 12 }}>Quote Request Received!</h2>
                <p style={{ color: '#555', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.8 }}>
                  Thank you, <strong>{form.name}</strong>. We've received your quote request and will be in touch within 24 hours via {form.preferredContact === 'phone' ? 'phone' : 'email'}.
                </p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/" className="btn btn-primary">Back to Home</Link>
                  <a href="tel:07455552220" className="btn btn-outline">Call Us: 07455 552220</a>
                </div>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2 style={{ marginBottom: 8 }}>Your Details</h2>
                <p style={{ color: '#666', marginBottom: 28, fontSize: '0.92rem' }}>All fields marked * are required.</p>

                <div className="grid-2" style={{ gap: 20 }}>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label>Full Name *</label>
                    <input className="form-input" required value={form.name} onChange={update('name')} placeholder="Your full name" />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label>Email Address *</label>
                    <input type="email" className="form-input" required value={form.email} onChange={update('email')} placeholder="your@email.com" />
                  </div>
                </div>
                <div style={{ height: 20 }} />
                <div className="grid-2" style={{ gap: 20 }}>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label>Phone Number *</label>
                    <input className="form-input" required value={form.phone} onChange={update('phone')} placeholder="07xxx xxxxxx" />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label>Preferred Contact Method</label>
                    <select className="form-input" value={form.preferredContact} onChange={update('preferredContact')}>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                </div>

                <div style={{ height: 28 }} />
                <h3 style={{ marginBottom: 20, fontSize: '1.05rem' }}>Premises Details</h3>

                <div className="grid-2" style={{ gap: 20 }}>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label>Business Location</label>
                    <input className="form-input" value={form.businessLocation} onChange={update('businessLocation')} placeholder="Town / postcode" />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label>Type of Premises</label>
                    <select className="form-input" value={form.premisesType} onChange={update('premisesType')}>
                      <option value="">Select premises type…</option>
                      {PREMISES_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ height: 20 }} />
                <div className="form-field">
                  <label>Preferred Start Date</label>
                  <input type="date" className="form-input" value={form.preferredDate} onChange={update('preferredDate')} min={new Date().toISOString().slice(0, 10)} />
                </div>
                <div className="form-field">
                  <label>Specific Requirements or Comments</label>
                  <textarea className="form-input" rows={5} value={form.requirements} onChange={update('requirements')} placeholder="Describe your premises, frequency of cleaning needed, specific areas of concern, any existing contracts…" style={{ resize: 'vertical' }} />
                </div>

                {/* Image upload */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Upload Images <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none' }}>(up to 5 images, 20MB total — optional)</span>
                  </label>

                  {files.length < 5 && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      style={{ width: '100%', padding: '20px', border: '2px dashed var(--trim)', borderRadius: 'var(--radius)', background: '#fafafa', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#888', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--trim)'}
                    >
                      <Upload size={24} />
                      <span style={{ fontSize: '0.88rem' }}>Click to upload or drag & drop</span>
                      <span style={{ fontSize: '0.78rem', color: '#bbb' }}>JPG, PNG, PDF accepted</span>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf" multiple onChange={addFiles} style={{ display: 'none' }} />

                  {files.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px,1fr))', gap: 8, marginTop: 12 }}>
                      {files.map((f, i) => (
                        <div key={i} style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--trim)', background: '#f5f5f5' }}>
                          {f.type.startsWith('image') ? (
                            <img src={URL.createObjectURL(f)} alt={f.name} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', color: '#888', padding: 8, textAlign: 'center' }}>{f.name}</div>
                          )}
                          <button type="button" onClick={() => removeFile(i)}
                            style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {formErr && <p style={{ color: '#c0392b', marginBottom: 16, fontSize: '0.9rem' }}>{formErr}</p>}

                <button type="submit" className="btn btn-accent" disabled={status === 'sending'} style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '14px 28px' }}>
                  {status === 'sending' ? 'Sending…' : <><ArrowRight size={16} /> Send Quote Request</>}
                </button>
                <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 12, textAlign: 'center' }}>We'll respond within 24 hours. No obligation.</p>
              </form>
            )}

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ marginBottom: 16 }}>Why Request a Quote?</h3>
                {[
                  'No obligation — completely free',
                  'Tailored to your specific premises',
                  'Detailed breakdown of services and costs',
                  'Flexible scheduling options',
                  'Response within 24 hours',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '0.88rem' }}>{f}</span>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ marginBottom: 12 }}>Prefer to Talk?</h3>
                <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: 16, lineHeight: 1.7 }}>Call or WhatsApp us directly — we're happy to discuss your requirements over the phone.</p>
                <a href="tel:07455552220" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
                  Call 07455 552220
                </a>
                <a href="https://wa.me/447455552220" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px', background: '#25D366', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Us
                </a>
              </div>

              <div className="card" style={{ padding: 20, background: '#f0f8ff', border: '1px solid #b3d9ff' }}>
                <p style={{ fontSize: '0.85rem', color: '#0055a5', lineHeight: 1.7 }}>
                  <strong>💡 Tip:</strong> Upload photos of your premises for a more accurate quote. Images of the space, any problem areas, or current condition all help us give you a better price.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`@media(max-width:760px){ .quote-grid { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  )
}
