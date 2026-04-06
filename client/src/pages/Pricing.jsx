import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

const COMMERCIAL_TIERS = [
  {
    name: 'Bronze', rate: '£20/ph', colour: '#cd7f32',
    desc: 'Perfect for smaller premises or getting started with a regular clean.',
    features: ['Regular scheduled cleaning', 'Trained & uniformed staff', 'Flexible scheduling', 'Standard cleaning products', 'Contact us for package details'],
  },
  {
    name: 'Silver', rate: '£22.50/ph', colour: '#aaa9ad', popular: true,
    desc: 'Our most popular option — great value with an enhanced service level.',
    features: ['Everything in Bronze', 'Enhanced cleaning specification', 'Priority scheduling', 'Dedicated account contact', 'Contact us for package details'],
  },
  {
    name: 'Gold', rate: '£25/ph', colour: '#d4af37',
    desc: 'Our premium offering for businesses that demand the highest standards.',
    features: ['Everything in Silver', 'Premium cleaning products', 'Deep-clean components included', 'Monthly review meetings', 'Contact us for package details'],
  },
]

const SPECIALIST = [
  { service: 'Single Oven', price: '£65', link: '/book/oven-cleaning' },
  { service: 'Double Oven', price: '£85', link: '/book/oven-cleaning' },
  { service: 'Rangemaster', price: '£125', link: '/book/oven-cleaning' },
  { service: 'Hob & Hood Clean', price: 'Enquire', link: '/contact-us' },
  { service: 'Carpet & Upholstery (from)', price: '£50', link: '/book/carpet-upholstery' },
  { service: 'Additional rooms / sofas / chairs', price: 'Enquire', link: '/contact-us' },
  { service: 'Steam Cleaning', price: 'Enquire', link: '/commercial-quote' },
  { service: 'Window Cleaning', price: 'Enquire', link: '/commercial-quote' },
  { service: 'Pressure Washing', price: 'Enquire', link: '/commercial-quote' },
]

export default function Pricing() {
  return (
    <main style={{ paddingTop: 'var(--header-h)' }}>
      <title>Pricing – Domestic Duties Commercial Ltd.</title>

      {/* Hero */}
      <section className="hero">
        <img src="/assets/images/20250807_165751.jpg" alt="" className="hero-bg-img" />
        <div className="container">
          <div className="hero-content">
            <h1>Transparent Pricing,<br />Superior Value</h1>
            <p>Competitive, straightforward pricing with no hidden fees. The more hours you have, the better the rate.</p>
            <Link to="/commercial-quote" className="btn btn-accent">Get Your Free Quote</Link>
          </div>
        </div>
      </section>

      {/* Commercial packages */}
      <section className="section section-light">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Commercial Cleaning Packages</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              All packages are tailored to your specific requirements. The more hours you book, the more competitive the rate. Enquire for full details.
            </p>
          </div>
          <div className="grid-3">
            {COMMERCIAL_TIERS.map(t => (
              <div key={t.name} className="card" style={{ padding: '36px 28px', position: 'relative', border: t.popular ? `2px solid ${t.colour}` : '1px solid var(--trim)' }}>
                {t.popular && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: t.colour, color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: t.colour, marginBottom: 20 }} />
                <h3 style={{ fontSize: '1.4rem', marginBottom: 8 }}>{t.name}</h3>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: t.colour, marginBottom: 8 }}>{t.rate}</div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 24, minHeight: 48 }}>{t.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {t.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.88rem' }}>
                      <Check size={15} style={{ color: t.colour, flexShrink: 0, marginTop: 2 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/commercial-quote" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', borderColor: t.colour, color: t.colour }}>
                  Enquire Now
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 24, color: '#888', fontSize: '0.88rem' }}>
            The more hours you book, the more competitive the rate becomes. <Link to="/contact-us">Contact us</Link> for a custom quote.
          </p>
        </div>
      </section>

      {/* Specialist pricing */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 className="section-title">Specialist Service Pricing</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Our bookable specialist services with fixed starting prices.</p>
          </div>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            {SPECIALIST.map((s, i) => (
              <div key={s.service} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: i % 2 === 0 ? '#fff' : '#f9f9f9', borderRadius: 'var(--radius)', marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{s.service}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent)' }}>{s.price}</span>
                  <Link to={s.link} style={{ fontSize: '0.82rem', color: '#666', textDecoration: 'none', borderBottom: '1px solid #ddd' }}>
                    {s.price === 'Enquire' ? 'Enquire' : 'Book'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why pricing works */}
      <section className="section section-dark">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 64 }}>
            <div>
              <h2 style={{ color: '#fff', marginBottom: 20 }}>Competitive & Transparent Pricing</h2>
              {[
                'No hidden fees or unexpected charges',
                'Detailed quotes provided before work starts',
                'Flexible packages tailored to your budget',
                'Pay only for the services you need',
                'Full insurance included in every price',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <Check size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.82)' }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-lg)', padding: '40px 32px' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📞</div>
                <h3 style={{ color: '#fff', marginBottom: 12 }}>Get a Personalised Quote</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 28, fontSize: '0.92rem' }}>
                  Every business is different. Call or WhatsApp us for a quote tailored to your premises, industry and cleaning needs.
                </p>
                <a href="tel:07455552220" className="btn btn-accent" style={{ marginBottom: 12, width: '100%', justifyContent: 'center' }}>
                  Call 07455 552220
                </a>
                <Link to="/commercial-quote" className="btn btn-outline-white" style={{ width: '100%', justifyContent: 'center' }}>
                  Request Online Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
