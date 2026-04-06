import { Link } from 'react-router-dom'
import { Shield, Clock, Award, Users, CheckCircle, ChevronRight } from 'lucide-react'

const INDUSTRIES = [
  'Retail Shops', 'Pubs & Restaurants', 'Factories & Warehouses',
  'Schools & Educational Facilities', 'Car Showrooms', 'Office Spaces',
  'Council Offices', 'Salons', 'Libraries', 'Churches',
]

const SERVICES = [
  { icon: '🔥', title: 'Oven Cleaning',            desc: 'Professional oven deep-clean for commercial kitchens. Single ovens from £65, doubles from £85, Rangemasters from £125.', link: '/book/oven-cleaning' },
  { icon: '🧹', title: 'Carpet & Upholstery',       desc: 'Revitalise flooring and soft furnishings. Starting from £50. One booking slot available per day.', link: '/book/carpet-upholstery' },
  { icon: '💨', title: 'Steam Cleaning',            desc: 'Deep tile and hard surface steam cleaning that removes grime and bacteria.', link: '/our-services' },
  { icon: '🏢', title: 'Commercial Cleaning',       desc: 'Tailored packages for retail, offices, factories and more. Bronze from £20/ph, Silver £22.50, Gold £25.', link: '/commercial-quote' },
  { icon: '🪟', title: 'Window Cleaning',           desc: 'Crystal-clear results for all premises types, inside and out.', link: '/our-services' },
  { icon: '💧', title: 'Pressure Washing',          desc: 'Restore outdoor spaces — pavements, car parks, building facades.', link: '/our-services' },
]

const STATS = [
  { value: '15+', label: 'Years Trading' },
  { value: '100%', label: 'Uniformed Team' },
  { value: 'Fully', label: 'Insured' },
  { value: '3', label: 'Counties Covered' },
]

const IMAGES = [
  '/assets/images/20260121_103048.jpg',
  '/assets/images/20251106_114603.jpg',
  '/assets/images/20251106_113751.jpg',
  '/assets/images/office.jpg',
  '/assets/images/20251023_094804.jpg',
  '/assets/images/20250929_135742.jpg',
]

export default function Home() {
  return (
    <main style={{ paddingTop: 'var(--header-h)' }}>
      {/* SEO */}
      <title>Commercial Cleaning Services | Domestic Duties Commercial Ltd.</title>

      {/* Hero */}
      <section className="hero">
        <img src="/assets/images/wes.jpg" alt="" className="hero-bg-img" />
        <div className="container">
          <div className="hero-content">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,119,204,0.2)', border: '1px solid rgba(0,119,204,0.4)', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0077cc', display: 'block' }} />
              <span style={{ color: '#4db8ff', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.06em' }}>15+ YEARS OF TRUSTED CLEANING</span>
            </div>
            <h1>Spotless Spaces,<br />Every Time</h1>
            <p>Expert commercial cleaning tailored to your industry's unique needs. Warwickshire, Worcestershire, Gloucestershire & beyond.</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/commercial-quote" className="btn btn-accent">Get Your Free Quote</Link>
              <Link to="/our-services" className="btn btn-outline-white">View Services</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--trim)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '28px 0' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '0 16px', borderRight: '1px solid var(--trim)' }}>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
                <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:640px){.stats-grid{grid-template-columns:1fr 1fr!important}}`}</style>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            <h2 className="section-title">Comprehensive Cleaning Solutions</h2>
            <p className="section-sub">Everything your business needs under one roof — book online for our specialist services.</p>
          </div>
          <div className="grid-3" style={{ marginBottom: 40 }}>
            {SERVICES.map(s => (
              <div key={s.title} className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>{s.title}</h3>
                <p style={{ fontSize: '0.92rem', color: '#666', flex: 1 }}>{s.desc}</p>
                <Link to={s.link} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>
                  Learn more <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Why choose us */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 64 }}>
            <div>
              <h2 className="section-title">Why Choose Domestic Duties?</h2>
              <p style={{ color: '#666', marginBottom: 32, lineHeight: 1.8 }}>
                With over 15 years of experience, we bring a wealth of expertise and trustworthiness to our clients. Our team is entirely uniformed, ensuring professionalism and easy identification on site.
              </p>
              {[
                { icon: Shield, text: 'Fully insured — complete peace of mind' },
                { icon: Users, text: 'Trained, uniformed professional team' },
                { icon: Clock, text: 'Flexible scheduling to minimise disruption' },
                { icon: Award, text: 'Competitive pricing without compromising quality' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color="#fff" />
                  </div>
                  <span style={{ fontWeight: 500 }}>{text}</span>
                </div>
              ))}
              <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
                <Link to="/overview" className="btn btn-primary">About Us</Link>
                <Link to="/commercial-quote" className="btn btn-outline">Get a Quote</Link>
              </div>
            </div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '4/5' }}>
              <img src={IMAGES[3]} alt="Professional cleaning team" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Industries We Serve</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>We adapt our services to the unique needs of every sector.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 40 }}>
            {INDUSTRIES.map(ind => (
              <span key={ind} style={{ padding: '8px 20px', background: '#fff', border: '2px solid var(--trim)', borderRadius: 20, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Book online CTAs */}
      <section className="section section-dark">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', marginBottom: 12 }}>Book Your Service Online</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Fast, easy online booking for our specialist services.</p>
          </div>
          <div className="grid-3">
            {[
              { title: 'Oven Cleaning', desc: 'From £65 for a single oven. 10% deposit to secure your slot.', link: '/book/oven-cleaning', cta: 'Book Oven Cleaning' },
              { title: 'Carpet & Upholstery', desc: 'Starting from £50. One slot available per day — book early.', link: '/book/carpet-upholstery', cta: 'Book Carpet Clean' },
              { title: 'Commercial Quote', desc: 'Offices, retail, factories & more. Upload photos for an accurate quote.', link: '/commercial-quote', cta: 'Request a Quote' },
            ].map(s => (
              <div key={s.title} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center' }}>
                <h3 style={{ color: '#fff', marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 24, fontSize: '0.92rem' }}>{s.desc}</p>
                <Link to={s.link} className="btn btn-accent">{s.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / social proof */}
      <section className="section section-light">
        <div className="container" style={{ maxWidth: 800, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⭐⭐⭐⭐⭐</div>
          <blockquote style={{ fontSize: '1.15rem', fontStyle: 'italic', color: '#444', lineHeight: 1.8, marginBottom: 24 }}>
            "Domestic Duties Commercial Ltd. has transformed our office space. Their attention to detail and commitment to quality are unmatched. Highly recommend!"
          </blockquote>
          <cite style={{ fontWeight: 600, color: 'var(--accent)' }}>— Sarah L., Office Manager</cite>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: 'var(--accent)', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: 16 }}>Ready to Experience a Spotless Environment?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 32 }}>Call us on 07455 552220 or request a free quote online.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:07455552220" className="btn btn-outline-white">Call 07455 552220</a>
            <Link to="/commercial-quote" className="btn btn-primary">Get Your Free Quote</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
