import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import MiniCalendar from '../components/MiniCalendar'
import { CheckCircle, ArrowLeft, CreditCard, Building2, Clock, Calendar } from 'lucide-react'

// ── Stripe checkout sub-form ──────────────────────────────────────────────────
function StripeCheckout({ clientSecret, stripeKey, onSuccess }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const pay = async e => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')
    const { error: err } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={pay}>
      <PaymentElement />
      {error && <p style={{ color: '#c0392b', marginTop: 12, fontSize: '0.9rem' }}>{error}</p>}
      <button type="submit" className="btn btn-accent" disabled={loading || !stripe} style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
        <CreditCard size={16} /> {loading ? 'Processing…' : 'Pay Deposit Now'}
      </button>
    </form>
  )
}

// ── Main booking page ─────────────────────────────────────────────────────────
const STEP_SELECT_DATE = 1
const STEP_ENTER_DETAILS = 2
const STEP_PAYMENT = 3
const STEP_DONE = 4

export default function BookingPage() {
  const { serviceSlug } = useParams()

  const [service,  setService]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  // Availability
  const [blackouts,      setBlackouts]      = useState([])
  const [availableDates, setAvailableDates] = useState(null)
  const [slots,          setSlots]          = useState([])
  const [loadingSlots,   setLoadingSlots]   = useState(false)

  // Selections
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  // Form
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' })
  const [formError, setFormError] = useState('')

  // Step
  const [step, setStep] = useState(STEP_SELECT_DATE)

  // Payment result
  const [bookingResult, setBookingResult] = useState(null)  // { bookingId, paymentMethod, depositAmount, bankTransfer, booking, stripeClientSecret }
  const [stripePromise, setStripePromise] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Load service
  useEffect(() => {
    fetch(`/api/services/${serviceSlug}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setService(d); setLoading(false) })
      .catch(() => { setError('Service not found'); setLoading(false) })
  }, [serviceSlug])

  // Load blackouts
  useEffect(() => {
    fetch('/api/blackouts')
      .then(r => r.json())
      .then(d => setBlackouts(d.map(b => b.date)))
      .catch(() => {})
  }, [])

  // Fetch available dates when month changes
  const handleMonthChange = useCallback(async (yearMonth) => {
    if (!service) return
    setAvailableDates(null)
    try {
      const r = await fetch(`/api/slots/${serviceSlug}/month/${yearMonth}`)
      const dates = await r.json()
      setAvailableDates(new Set(dates))
    } catch {
      setAvailableDates(new Set())
    }
  }, [service, serviceSlug])

  // Fetch time slots when date selected
  useEffect(() => {
    if (!selectedDate || !service) return
    setSlots([])
    setSelectedTime(null)
    setLoadingSlots(true)
    fetch(`/api/slots/${serviceSlug}/date/${selectedDate}`)
      .then(r => r.json())
      .then(d => setSlots(d))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, service, serviceSlug])

  const updateForm = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const submitBooking = async () => {
    if (!form.name || !form.email || !form.phone) { setFormError('Please fill in all required fields.'); return }
    setSubmitting(true)
    setFormError('')
    try {
      const r = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceSlug,
          bookingDate: selectedDate,
          startTime: selectedTime,
          clientName: form.name,
          clientEmail: form.email,
          clientPhone: form.phone,
          clientAddress: form.address,
          clientNotes: form.notes,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Booking failed')
      setBookingResult(data)

      if (data.paymentMethod === 'stripe' && data.stripeClientSecret) {
        // Load Stripe publishable key
        const settings = await fetch('/api/settings').then(r => r.json())
        if (settings?.stripe?.publishableKey) {
          setStripePromise(loadStripe(settings.stripe.publishableKey))
        }
        setStep(STEP_PAYMENT)
      } else {
        setStep(STEP_DONE)
      }
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = p => `£${(p / 100).toFixed(2)}`

  if (loading) return <div style={{ paddingTop: 'calc(var(--header-h) + 60px)', textAlign: 'center', color: '#888' }}>Loading…</div>
  if (error)   return (
    <div style={{ paddingTop: 'calc(var(--header-h) + 60px)', textAlign: 'center' }}>
      <p style={{ color: '#c0392b', marginBottom: 20 }}>{error}</p>
      <Link to="/our-services" className="btn btn-outline">Back to Services</Link>
    </div>
  )

  const depositDisplay = service && (
    service.depositMode === 'percent'
      ? `${service.depositPercent}% deposit`
      : service.depositMode === 'fixed'
        ? `£${service.depositFixed} deposit`
        : 'No deposit required'
  )

  return (
    <main style={{ paddingTop: 'var(--header-h)', background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Back link */}
        <Link to="/our-services" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#666', fontSize: '0.88rem', marginBottom: 32, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Services
        </Link>

        {/* Progress */}
        {step < STEP_DONE && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 40, maxWidth: 520 }}>
            {['Choose Date & Time', 'Your Details', 'Payment'].map((label, i) => {
              const s = i + 1
              const active  = step === s
              const done    = step > s
              return (
                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {i > 0 && <div style={{ position: 'absolute', top: 14, left: 0, right: '50%', height: 2, background: done || active ? 'var(--accent)' : 'var(--trim)' }} />}
                  {i < 2 && <div style={{ position: 'absolute', top: 14, left: '50%', right: 0, height: 2, background: done ? 'var(--accent)' : 'var(--trim)' }} />}
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: active ? 'var(--accent)' : done ? 'var(--accent)' : '#fff', border: `2px solid ${active || done ? 'var(--accent)' : 'var(--trim)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, fontSize: '0.8rem', fontWeight: 700, color: active || done ? '#fff' : '#aaa' }}>
                    {done ? '✓' : s}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: active ? 'var(--accent)' : '#888', marginTop: 6, textAlign: 'center', fontWeight: active ? 700 : 400 }}>{label}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="booking-layout" style={{ display: 'grid', gridTemplateColumns: step === STEP_DONE ? '1fr' : '1fr 340px', gap: 32, alignItems: 'flex-start' }}>
          {/* ── STEP 1: Date & Time ── */}
          {step === STEP_SELECT_DATE && (
            <div>
              <div className="card" style={{ padding: 32, marginBottom: 24 }}>
                <h2 style={{ marginBottom: 8, fontSize: '1.4rem' }}>Select a Date</h2>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 24 }}>
                  Dates with a blue dot have available slots. Greyed-out dates are unavailable.
                </p>
                <MiniCalendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  blackouts={blackouts}
                  availableDates={availableDates}
                  onMonthChange={handleMonthChange}
                />
              </div>

              {selectedDate && (
                <div className="card" style={{ padding: 32 }}>
                  <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} /> Available Times for {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  {loadingSlots ? (
                    <p style={{ color: '#aaa' }}>Loading slots…</p>
                  ) : slots.length === 0 ? (
                    <p style={{ color: '#aaa' }}>No available slots on this date. Please choose another day.</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {slots.map(t => (
                        <button key={t} onClick={() => setSelectedTime(t)}
                          style={{ padding: '10px 20px', borderRadius: 'var(--radius)', border: '2px solid', borderColor: selectedTime === t ? 'var(--accent)' : 'var(--trim)', background: selectedTime === t ? 'var(--accent)' : '#fff', color: selectedTime === t ? '#fff' : 'var(--text)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedTime && (
                    <button onClick={() => setStep(STEP_ENTER_DETAILS)} className="btn btn-accent" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}>
                      Continue with {selectedTime} on {selectedDate}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Customer Details ── */}
          {step === STEP_ENTER_DETAILS && (
            <div className="card" style={{ padding: 32 }}>
              <button onClick={() => setStep(STEP_SELECT_DATE)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: 20, fontSize: '0.88rem' }}>
                <ArrowLeft size={14} /> Change date/time
              </button>
              <h2 style={{ marginBottom: 24, fontSize: '1.4rem' }}>Your Details</h2>

              <div className="form-field">
                <label>Full Name *</label>
                <input className="form-input" required value={form.name} onChange={updateForm('name')} placeholder="Your full name" />
              </div>
              <div className="form-field">
                <label>Email Address *</label>
                <input type="email" className="form-input" required value={form.email} onChange={updateForm('email')} placeholder="your@email.com" />
              </div>
              <div className="form-field">
                <label>Phone / WhatsApp *</label>
                <input className="form-input" required value={form.phone} onChange={updateForm('phone')} placeholder="07xxx xxxxxx" />
              </div>
              <div className="form-field">
                <label>Address <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none' }}>(where we'll be coming)</span></label>
                <input className="form-input" value={form.address} onChange={updateForm('address')} placeholder="Full address" />
              </div>
              <div className="form-field">
                <label>Notes / Special Requirements</label>
                <textarea className="form-input" rows={3} value={form.notes} onChange={updateForm('notes')} placeholder="Anything we should know…" style={{ resize: 'vertical' }} />
              </div>

              {formError && <p style={{ color: '#c0392b', marginBottom: 12, fontSize: '0.9rem' }}>{formError}</p>}

              <button onClick={submitBooking} className="btn btn-accent" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
                {submitting ? 'Submitting…' : 'Confirm Booking →'}
              </button>
            </div>
          )}

          {/* ── STEP 3: Payment (stripe or bank) ── */}
          {step === STEP_PAYMENT && bookingResult && (
            <div className="card" style={{ padding: 32 }}>
              {bookingResult.paymentMethod === 'stripe' && bookingResult.stripeClientSecret && stripePromise ? (
                <>
                  <h2 style={{ marginBottom: 8 }}>Pay Your Deposit</h2>
                  <p style={{ color: '#666', marginBottom: 24, fontSize: '0.9rem' }}>
                    A deposit of <strong>{bookingResult.depositAmount ? formatPrice(bookingResult.depositAmount * 100) : '…'}</strong> is required to secure your booking.
                  </p>
                  <Elements stripe={stripePromise} options={{ clientSecret: bookingResult.stripeClientSecret }}>
                    <StripeCheckout
                      clientSecret={bookingResult.stripeClientSecret}
                      onSuccess={() => setStep(STEP_DONE)}
                    />
                  </Elements>
                </>
              ) : (
                // Bank transfer
                <>
                  <h2 style={{ marginBottom: 8 }}>Pay Your Deposit by Bank Transfer</h2>
                  <p style={{ color: '#666', marginBottom: 24, fontSize: '0.9rem' }}>
                    Please transfer your deposit of <strong>£{bookingResult.depositAmount?.toFixed(2)}</strong> using the details below to secure your appointment.
                  </p>
                  {bookingResult.bankTransfer && (
                    <div style={{ background: '#f9f9f9', border: '1px solid var(--trim)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <Building2 size={20} style={{ color: 'var(--accent)' }} /> <strong>Bank Transfer Details</strong>
                      </div>
                      {[
                        ['Account Name',   bookingResult.bankTransfer.accountName],
                        ['Sort Code',      bookingResult.bankTransfer.sortCode],
                        ['Account Number', bookingResult.bankTransfer.accountNumber],
                        ['Reference',      bookingResult.bookingId?.slice(-8).toUpperCase()],
                      ].map(([k, v]) => v && (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--trim)', fontSize: '0.92rem' }}>
                          <span style={{ color: '#666' }}>{k}</span>
                          <strong style={{ fontFamily: 'monospace' }}>{v}</strong>
                        </div>
                      ))}
                      <p style={{ marginTop: 16, fontSize: '0.85rem', color: '#888' }}>{bookingResult.bankTransfer.instructions}</p>
                    </div>
                  )}
                  <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 'var(--radius)', padding: 14, marginBottom: 20, fontSize: '0.88rem', color: '#856404' }}>
                    ⚠️ Your booking will be confirmed once we receive your deposit. We'll contact you within 24 hours to confirm.
                  </div>
                  <button onClick={() => setStep(STEP_DONE)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    I've Sent the Transfer →
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === STEP_DONE && bookingResult && (
            <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d4edda', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={36} style={{ color: '#155724' }} />
              </div>
              <h2 style={{ marginBottom: 12 }}>Booking Received!</h2>
              <p style={{ color: '#555', marginBottom: 32, lineHeight: 1.8 }}>
                Thank you, <strong>{bookingResult.booking?.clientName}</strong>. We've received your booking for <strong>{bookingResult.booking?.serviceTitle}</strong> on <strong>{bookingResult.booking?.bookingDate}</strong> at <strong>{bookingResult.booking?.startTime}</strong>.
                {bookingResult.paymentMethod === 'bank_transfer' && ' Once we confirm your deposit has been received, we\'ll confirm your appointment.'}
                {bookingResult.paymentMethod === 'stripe' && ' Your deposit has been taken and we\'ll be in touch shortly to confirm.'}
              </p>
              <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: 32 }}>
                A confirmation has been sent to <strong>{bookingResult.booking?.clientName}</strong>. You'll receive a WhatsApp reminder the day before your appointment.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/" className="btn btn-primary">Back to Home</Link>
                <a href="tel:07455552220" className="btn btn-outline">Questions? Call Us</a>
              </div>
            </div>
          )}

          {/* ── Sidebar summary (steps 1-3) ── */}
          {step < STEP_DONE && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>Booking Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 2 }}>Service</div>
                    <div style={{ fontWeight: 600 }}>{service?.title}</div>
                  </div>
                  {selectedDate && (
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 2 }}>Date</div>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} style={{ color: 'var(--accent)' }} />
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
                      </div>
                    </div>
                  )}
                  {selectedTime && (
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 2 }}>Time</div>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} style={{ color: 'var(--accent)' }} />{selectedTime}
                      </div>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid var(--trim)', paddingTop: 14 }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 4 }}>Starting price</div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent)' }}>
                      £{service?.price?.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#888', marginTop: 4 }}>{depositDisplay} required today</div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 20, background: '#f0f8ff', border: '1px solid #b3d9ff' }}>
                <p style={{ fontSize: '0.85rem', color: '#0055a5', lineHeight: 1.7 }}>
                  <strong>📋 How it works:</strong> Select your date and time, enter your details, pay the deposit to secure your slot. The remaining balance is due on the day of service.
                </p>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <p style={{ fontSize: '0.82rem', color: '#888', lineHeight: 1.7 }}>
                  Questions? Call or WhatsApp us on <a href="tel:07455552220" style={{ color: 'var(--accent)', fontWeight: 600 }}>07455 552220</a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .booking-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
