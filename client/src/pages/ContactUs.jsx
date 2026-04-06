import { useState } from 'react'
import { Phone, Mail, MessageCircle, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'ok' | 'error'

  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setStatus('sending')
    try {
      const r = await fetch('/api/contact/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) throw new Error()
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main style={{ paddingTop: 'var(--header-h)' }}>
      <title>Contact Us – Domestic Duties Commercial Ltd.</title>

      {/* Hero */}
      <section className="hero">
        <img src="/assets/images/20250925_164726.jpg" alt="" className="hero-bg-img" />
        <div className="container">
          <div className="hero-content">
            <h1>Get in Touch<br />With Us Today</h1>
            <p>Reach out for customised cleaning solutions tailored to your business needs. We're here to help.</p>
          </div>
        </div>
      </section>

      {/* Contact options */}
      <section className="section section-light">
        <div className="container">
          <div className="grid-3" style={{ marginBottom: 64 }}>
            {[
              {
                icon: Phone, title: 'Call or WhatsApp',
                content: <a href="tel:07455552220" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>07455 552220</a>,
                sub: 'Mon–Fri 9am–5pm',
                wa: true,
              },
              {
                icon: Mail, title: 'Email Us',
                content: <a href="mailto:domesticdutiescommercial46@gmail.com" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none', wordBreak: 'break-all' }}>domesticdutiescommercial46@gmail.com</a>,
                sub: 'We reply within 24 hours',
              },
              {
                icon: MessageCircle, title: 'Facebook',
                content: <span style={{ color: '#555', fontSize: '0.92rem' }}>Find us on Facebook</span>,
                sub: 'Message us directly',
              },
            ].map(({ icon: Icon, title, content, sub, wa }) => (
              <div key={title} className="card" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Icon size={22} color="#fff" />
                </div>
                <h3 style={{ marginBottom: 10 }}>{title}</h3>
                <div style={{ marginBottom: 8 }}>{content}</div>
                <p style={{ fontSize: '0.82rem', color: '#888' }}>{sub}</p>
                {wa && (
                  <a href="https://wa.me/447455552220?text=Hi%2C%20I'd%20like%20to%20enquire%20about%20your%20cleaning%20services." target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#25D366', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Chat on WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Contact form + booking CTA */}
          <div className="grid-2" style={{ gap: 48, alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ marginBottom: 8 }}>Send Us a Message</h2>
              <p style={{ color: '#666', marginBottom: 28 }}>Fill in the form and we'll get back to you within 24 hours.</p>

              {status === 'ok' ? (
                <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 'var(--radius)', padding: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckCircle size={22} style={{ color: '#155724', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontWeight: 600, color: '#155724', marginBottom: 4 }}>Message sent!</p>
                    <p style={{ fontSize: '0.9rem', color: '#155724' }}>Thank you for reaching out. We'll be in touch within 24 hours.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <div className="form-field">
                    <label>Full Name *</label>
                    <input className="form-input" required value={form.name} onChange={update('name')} placeholder="Your name" />
                  </div>
                  <div className="form-field">
                    <label>Email Address *</label>
                    <input type="email" className="form-input" required value={form.email} onChange={update('email')} placeholder="your@email.com" />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input className="form-input" value={form.phone} onChange={update('phone')} placeholder="07xxx xxxxxx" />
                  </div>
                  <div className="form-field">
                    <label>Message *</label>
                    <textarea className="form-input" required rows={5} value={form.message} onChange={update('message')} placeholder="Tell us about your cleaning requirements…" style={{ resize: 'vertical' }} />
                  </div>
                  {status === 'error' && (
                    <p style={{ color: '#c0392b', marginBottom: 12, fontSize: '0.9rem' }}>Something went wrong. Please call us directly on 07455 552220.</p>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={status === 'sending'} style={{ width: '100%', justifyContent: 'center' }}>
                    {status === 'sending' ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2>Or Book Directly Online</h2>
              <p style={{ color: '#666' }}>For our specialist services, you can book online with just a few clicks — including a secure deposit.</p>
              {[
                { title: 'Oven Cleaning', desc: 'From £65', link: '/book/oven-cleaning' },
                { title: 'Carpet & Upholstery', desc: 'From £50', link: '/book/carpet-upholstery' },
                { title: 'Commercial Cleaning Quote', desc: 'Upload photos, get a quote', link: '/commercial-quote' },
              ].map(s => (
                <Link key={s.title} to={s.link} className="card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--heading)', marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>{s.desc}</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="section section-dark">
        <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
          <h2 style={{ color: '#fff', marginBottom: 16 }}>Our Commitment to You</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.85, marginBottom: 32 }}>
            We understand that every business has unique cleaning requirements. Our commitment is to deliver reliable, high-quality cleaning services that exceed your expectations. Contact us today to discuss how we can support your business in maintaining a clean and welcoming environment.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:07455552220" className="btn btn-accent">Call Us Now</a>
            <Link to="/our-services" className="btn btn-outline-white">View All Services</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
