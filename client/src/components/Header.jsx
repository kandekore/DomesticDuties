import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'

const NAV = [
  { label: 'For Your Business', to: '/' },
  { label: 'About Us',          to: '/overview' },
  { label: 'What We Offer',     to: '/our-services' },
  { label: 'Pricing',           to: '/pricing' },
  { label: 'Contact',           to: '/contact-us' },
]

export default function Header() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--header-h)',
      background: scrolled ? 'rgba(0,0,0,0.97)' : '#000',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/assets/brand/logowhite300px.png"
            alt="Domestic Duties Commercial Ltd."
            style={{ height: 48, width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              style={({ isActive }) => ({
                padding: '8px 14px',
                borderRadius: 'var(--radius)',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.72)',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                transition: 'color 0.2s, background 0.2s',
                textDecoration: 'none',
              })}
            >{n.label}</NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="tel:07455552220" className="btn btn-outline-white" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            <Phone size={15} /> Call Us
          </a>
          <Link to="/contact-us" className="btn btn-accent" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Get a Quote
          </Link>
          <button
            onClick={() => setOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none', padding: 4 }}
            aria-label="Menu"
            className="hamburger-btn"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position: 'absolute', top: 'var(--header-h)', left: 0, right: 0,
          background: '#0d0d0d',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'block', padding: '12px 16px',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-heading)', fontWeight: 600,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
              })}
            >{n.label}</NavLink>
          ))}
          <Link to="/contact-us" className="btn btn-accent" style={{ marginTop: 12, justifyContent: 'center' }} onClick={() => setOpen(false)}>
            Get a Free Quote
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </header>
  )
}
