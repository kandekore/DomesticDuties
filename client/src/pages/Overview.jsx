import { Link } from 'react-router-dom'

const TEAM_IMAGES = [
  '/assets/images/20250813_104723.jpg',
  '/assets/images/20250813_104721.jpg',
  '/assets/images/20250813_110619.jpg',
  '/assets/images/20250813_103101.jpg',
]

export default function Overview() {
  return (
    <main style={{ paddingTop: 'var(--header-h)' }}>
      <title>About Us – Domestic Duties Commercial Ltd.</title>

      {/* Hero */}
      <section className="hero">
        <img src="/assets/images/20250925_165036.jpg" alt="" className="hero-bg-img" />
        <div className="container">
          <div className="hero-content">
            <h1>Expert Cleaners,<br />Exceptional Results</h1>
            <p>Over 15 years of trusted cleaning services for diverse industries across Warwickshire, Worcestershire and beyond.</p>
            <Link to="/commercial-quote" className="btn btn-accent">Get Your Free Quote Today</Link>
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="section section-light">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 64 }}>
            <div>
              <h2 className="section-title">Our Story</h2>
              <p style={{ color: '#555', lineHeight: 1.85, marginBottom: 20 }}>
                Domestic Duties Commercial Ltd. started as a one-person residential cleaning business founded by Miranda Welsh. Over time, her husband Wesley Sinnott joined the business, bringing specialist training in oven and carpet/upholstery cleaning.
              </p>
              <p style={{ color: '#555', lineHeight: 1.85, marginBottom: 20 }}>
                What began as a solo venture has grown into a substantial commercial cleaning operation, trusted by businesses across Warwickshire and Worcestershire. We've built long-standing relationships with clients who rely on us day in, day out — and they haven't been disappointed.
              </p>
              <p style={{ color: '#555', lineHeight: 1.85 }}>
                Today we have a large, trained and uniformed team delivering consistent, high-quality results. We aim to keep growing and to keep improving — because our clients' businesses deserve the very best.
              </p>
            </div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <img src="/assets/images/20250925_165045.jpg" alt="Our team at work" style={{ width: '100%', objectFit: 'cover', aspectRatio: '4/3' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Our Unique Approach</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Reliability, professionalism and tailored solutions at every job.</p>
          </div>
          <div className="grid-4">
            {[
              { icon: '🎓', title: 'Fully Trained', desc: 'Every team member undergoes comprehensive training before stepping on site.' },
              { icon: '👔', title: '100% Uniformed', desc: 'Our team is always uniformed — professional, identifiable and trustworthy.' },
              { icon: '🛡️', title: 'Fully Insured', desc: 'Full company insurance gives our clients complete peace of mind.' },
              { icon: '🔧', title: 'Tailored Packages', desc: 'We design bespoke cleaning schedules to suit your industry and budget.' },
            ].map(v => (
              <div key={v.title} style={{ textAlign: 'center', padding: '32px 24px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--trim)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#666', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo grid */}
      <section className="section-sm" style={{ background: '#fff' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Our Work</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {TEAM_IMAGES.map((img, i) => (
              <div key={i} style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 'var(--radius)' }}>
                <img src={img} alt="Cleaning work" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="section section-dark">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: 16 }}>Where We Work</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
            Our primary service areas are Warwickshire, Worcestershire and Gloucestershire — though we are happy to travel further for the right client. Not sure if we cover your area? Get in touch to check.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {['Warwickshire', 'Worcestershire', 'Gloucestershire', 'Birmingham', '& surrounding areas'].map(a => (
              <span key={a} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, color: '#fff', fontSize: '0.88rem', fontWeight: 600 }}>{a}</span>
            ))}
          </div>
          <Link to="/contact-us" className="btn btn-accent">Check Your Area</Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--accent)', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: 16 }}>Ready to Transform Your Space?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 32 }}>Contact us today for a tailored cleaning package that fits your business.</p>
          <Link to="/commercial-quote" className="btn btn-primary">Get Your Free Quote</Link>
        </div>
      </section>
    </main>
  )
}
