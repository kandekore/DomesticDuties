import { Link } from 'react-router-dom'

const SERVICES = [
  {
    id: 'oven',
    icon: '🔥',
    title: 'Oven Cleaning',
    desc: 'Essential for restaurants, cafes and commercial kitchens. Our professional oven cleaning service ensures hygiene standards are met and kitchen safety is maintained. We clean every component — racks, doors, hob and hood.',
    images: ['/assets/images/ovenbefore.jpg', '/assets/images/ovenafter.jpg'],
    link: '/book/oven-cleaning',
    cta: 'Book Oven Cleaning',
    pricing: 'From £65 (single), £85 (double), £125 (Rangemaster)',
  },
  {
    id: 'carpet',
    icon: '🧹',
    title: 'Carpet & Upholstery Cleaning',
    desc: 'Revitalise your soft furnishings and create a welcoming environment for clients and staff. Our specialist carpet and upholstery cleaning extends the life of your flooring and furniture while removing deep-seated dirt and allergens.',
    images: ['/assets/images/stairs.jpg', '/assets/images/sofa.jpg'],
    link: '/book/carpet-upholstery',
    cta: 'Book Carpet Clean',
    pricing: 'From £50 — enquire for sizing and sofa/chair options',
  },
  {
    id: 'steam',
    icon: '💨',
    title: 'Steam Cleaning',
    desc: 'Perfect for tiles and other hard surfaces, our steam cleaning service delivers a deep clean that removes grime and bacteria without harmful chemicals. Ideal for kitchens, bathrooms and production areas.',
    images: ['/assets/images/20250806_125145.jpg', '/assets/images/20250813_102302.jpg'],
    link: '/commercial-quote',
    cta: 'Request a Quote',
    pricing: 'Enquire for pricing',
  },
  {
    id: 'commercial',
    icon: '🏢',
    title: 'Commercial Contract Cleaning',
    desc: 'Our core commercial cleaning service provides tailored, regular cleaning for offices, retail spaces, showrooms, factories, schools and more. Choose from our Bronze, Silver or Gold packages — the more hours, the better the rate.',
    images: ['/assets/images/20250824_192016.jpg', '/assets/images/20250824_192221.jpg'],
    link: '/commercial-quote',
    cta: 'Get a Quote',
    pricing: 'Bronze £20/ph · Silver £22.50/ph · Gold £25/ph',
  },
  {
    id: 'window',
    icon: '🪟',
    title: 'Window Cleaning',
    desc: 'Keep your premises looking professional from the outside in. Our window cleaning service covers all commercial premises, from retail frontages to multi-storey office blocks.',
    images: ['/assets/images/20250710_171004.jpg', '/assets/images/20250929_135742.jpg'],
    link: '/commercial-quote',
    cta: 'Request a Quote',
    pricing: 'Enquire for pricing',
  },
  {
    id: 'pressure',
    icon: '💧',
    title: 'Pressure Washing',
    desc: 'Restore outdoor spaces, car parks, loading bays and building facades. Our pressure washing service removes stubborn dirt, grime and staining, restoring surfaces to their original appearance.',
    images: ['/assets/images/20250925_113114.jpg', '/assets/images/20250925_164726.jpg'],
    link: '/commercial-quote',
    cta: 'Request a Quote',
    pricing: 'Enquire for pricing',
  },
]

export default function OurServices() {
  return (
    <main style={{ paddingTop: 'var(--header-h)' }}>
      <title>Our Services – Domestic Duties Commercial Ltd.</title>

      {/* Hero */}
      <section className="hero" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <img src="/assets/images/sofas.jpg" alt="" className="hero-bg-img" />
        <div className="container">
          <div className="hero-content">
            <h1>Expert Commercial<br />Cleaning Solutions</h1>
            <p>Tailored cleaning services for every industry, ensuring pristine environments. Book our specialist services online or request a quote.</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/book/oven-cleaning" className="btn btn-accent">Book Oven Cleaning</Link>
              <Link to="/commercial-quote" className="btn btn-outline-white">Request a Quote</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services list */}
      {SERVICES.map((s, i) => (
        <section key={s.id} className={`section ${i % 2 === 0 ? '' : 'section-light'}`}>
          <div className="container">
            <div className="grid-2" style={{ alignItems: 'center', gap: 64, direction: i % 2 === 0 ? 'ltr' : 'ltr' }}>
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{s.icon}</div>
                <h2 className="section-title">{s.title}</h2>
                <p style={{ color: '#555', lineHeight: 1.85, marginBottom: 20 }}>{s.desc}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0f8ff', border: '1px solid #b3d9ff', borderRadius: 'var(--radius)', padding: '8px 16px', marginBottom: 28 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700 }}>💷 {s.pricing}</span>
                </div>
                <br />
                <Link to={s.link} className="btn btn-accent">{s.cta}</Link>
              </div>
              <div style={{ order: i % 2 === 0 ? 1 : 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {s.images.map((img, j) => (
                  <div key={j} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '3/4', marginTop: j === 1 ? 32 : 0 }}>
                    {s.id === 'oven' && (
                      <div style={{ background: j === 0 ? '#e74c3c' : '#27ae60', color: '#fff', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', padding: '5px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {j === 0 ? 'Before' : 'After'}
                      </div>
                    )}
                    <img src={img} alt={s.id === 'oven' ? (j === 0 ? 'Before cleaning' : 'After cleaning') : s.title} style={{ width: '100%', height: '100%', objectFit: s.id === 'oven' ? 'contain' : 'cover', background: s.id === 'oven' ? '#f5f5f5' : undefined }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Why us */}
      <section className="section section-dark">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ color: '#fff' }}>Why Choose Domestic Duties Commercial Ltd?</h2>
          </div>
          <div className="grid-4">
            {[
              ['15+ Years', 'Unmatched experience across all commercial sectors'],
              ['Fully Insured', 'Complete peace of mind on every job'],
              ['Uniformed Team', 'Professional, identifiable on-site presence'],
              ['Tailored Packages', 'We build a schedule that fits your business'],
            ].map(([t, d]) => (
              <div key={t} style={{ textAlign: 'center', padding: '24px 16px' }}>
                <h3 style={{ color: '#fff', marginBottom: 10 }}>{t}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.7 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--accent)', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: 16 }}>Request Your Free Quote Today</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 32 }}>Ready to experience a spotless and inviting business environment? Contact us today.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/commercial-quote" className="btn btn-primary">Get a Commercial Quote</Link>
            <Link to="/pricing" className="btn btn-outline-white">View Pricing</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
