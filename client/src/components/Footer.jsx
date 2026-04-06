import { Link } from 'react-router-dom'
import { Phone, Mail } from 'lucide-react'

const NAV = [
  { label: 'For Your Business', to: '/' },
  { label: 'About Us',          to: '/overview' },
  { label: 'What We Offer',     to: '/our-services' },
  { label: 'Pricing',           to: '/pricing' },
  { label: 'Contact',           to: '/contact-us' },
]

const SERVICES = [
  { label: 'Oven Cleaning', to: '/book/oven-cleaning' },
  { label: 'Carpet & Upholstery', to: '/book/carpet-upholstery' },
  { label: 'Commercial Quote', to: '/commercial-quote' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{ background: '#0d0d0d', color: 'rgba(255,255,255,0.7)', marginTop: 'auto' }}>
      <div className="container" style={{ padding: '60px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <img
              src="/assets/brand/logowhite300px.png"
              alt="Domestic Duties Commercial Ltd."
              style={{ height: 44, width: 'auto', objectFit: 'contain', marginBottom: 16 }}
            />
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.55)', marginBottom: 20 }}>
              "Choose Right. Choose Us." — Expert commercial cleaning across Warwickshire, Worcestershire & Gloucestershire.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>
                f
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Pages</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NAV.map(n => (
                <li key={n.to}><Link to={n.to} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                >{n.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Book Online</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SERVICES.map(s => (
                <li key={s.to}><Link to={s.to} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                >{s.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="tel:07455552220" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.7)', fontSize: '0.92rem', textDecoration: 'none' }}>
                <Phone size={15} /> 07455 552220
              </a>
              <a href="mailto:domesticdutiescommercial46@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.7)', fontSize: '0.92rem', textDecoration: 'none' }}>
                <Mail size={15} /> domesticdutiescommercial46@gmail.com
              </a>
            </div>
            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Service Areas</p>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>Warwickshire · Worcestershire · Gloucestershire · Birmingham</p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>
          <span>© {year} Domestic Duties Commercial Ltd. All rights reserved.</span>
          <span>15+ Years of Trusted Commercial Cleaning</span>
        </div>
      </div>
    </footer>
  )
}
