import nodemailer from 'nodemailer'
import Settings from '../models/Settings.js'

async function getTransporter() {
  const s = await Settings.findOne({ singleton: 'main' })
  const cfg = s?.email || {}
  if (cfg.smtpHost && cfg.smtpUser && cfg.smtpPass) {
    return nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort || 587,
      secure: (cfg.smtpPort || 587) === 465,
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
    })
  }
  // Fallback: Gmail with app password via env
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })
}

export async function sendMail({ to, subject, html, attachments }) {
  const s = await Settings.findOne({ singleton: 'main' })
  const cfg = s?.email || {}
  const from = `"${cfg.fromName || 'Domestic Duties'}" <${cfg.fromAddress || process.env.GMAIL_USER}>`
  const transport = await getTransporter()
  return transport.sendMail({ from, to, subject, html, attachments })
}

export async function sendBookingConfirmation(booking, settings) {
  const { clientName, clientEmail, serviceTitle, bookingDate, startTime, paymentMethod, depositAmount } = booking
  const bankCfg = settings?.bankTransfer || {}

  const depositSection = paymentMethod === 'stripe'
    ? `<p>Your <strong>£${(depositAmount / 100).toFixed(2)} deposit</strong> has been taken via card payment.</p>`
    : `
      <p>To confirm your booking a <strong>10% deposit of £${depositAmount?.toFixed ? depositAmount.toFixed(2) : depositAmount}</strong> is required by bank transfer.</p>
      <table cellpadding="6" style="border-collapse:collapse;margin-top:8px;">
        <tr><td><strong>Account Name:</strong></td><td>${bankCfg.accountName}</td></tr>
        <tr><td><strong>Sort Code:</strong></td><td>${bankCfg.sortCode}</td></tr>
        <tr><td><strong>Account Number:</strong></td><td>${bankCfg.accountNumber}</td></tr>
        <tr><td><strong>Reference:</strong></td><td>${booking.id || ''}</td></tr>
      </table>
      <p style="color:#555;">${bankCfg.instructions}</p>
    `

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#000">Booking Received – ${serviceTitle}</h2>
      <p>Hi ${clientName},</p>
      <p>Thank you for booking with <strong>Domestic Duties Commercial Ltd.</strong></p>
      <table cellpadding="6" style="border-collapse:collapse;margin:16px 0">
        <tr><td><strong>Service:</strong></td><td>${serviceTitle}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${bookingDate}</td></tr>
        <tr><td><strong>Time:</strong></td><td>${startTime}</td></tr>
      </table>
      ${depositSection}
      <p>We will confirm your appointment once the deposit is received. You'll receive a reminder the day before.</p>
      <p>Questions? Call or WhatsApp us on <strong>${settings?.business?.phone || '07455 552220'}</strong></p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
      <p style="color:#999;font-size:12px">Domestic Duties Commercial Ltd. &bull; Choose Right. Choose Us.</p>
    </div>
  `
  await sendMail({ to: clientEmail, subject: `Booking Received – ${serviceTitle} on ${bookingDate}`, html })
}

export async function sendBookingConfirmedEmail(booking, settings) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#000">Booking Confirmed ✓</h2>
      <p>Hi ${booking.clientName},</p>
      <p>Your booking has been <strong>confirmed</strong>.</p>
      <table cellpadding="6" style="border-collapse:collapse;margin:16px 0">
        <tr><td><strong>Service:</strong></td><td>${booking.serviceTitle}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${booking.bookingDate}</td></tr>
        <tr><td><strong>Time:</strong></td><td>${booking.startTime}</td></tr>
      </table>
      <p>Please ensure someone is available at the property on the day. Payment of the remaining balance is due on the day of service.</p>
      <p>Questions? Call us on <strong>${settings?.business?.phone || '07455 552220'}</strong></p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
      <p style="color:#999;font-size:12px">Domestic Duties Commercial Ltd.</p>
    </div>
  `
  await sendMail({ to: booking.clientEmail, subject: `Confirmed: ${booking.serviceTitle} on ${booking.bookingDate}`, html })
}

export async function sendAdminNewBooking(booking, settings) {
  const adminEmail = settings?.email?.adminEmail || process.env.GMAIL_USER
  const html = `
    <div style="font-family:sans-serif;max-width:600px">
      <h2>New Booking Request</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Service:</strong></td><td>${booking.serviceTitle}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${booking.bookingDate}</td></tr>
        <tr><td><strong>Time:</strong></td><td>${booking.startTime}</td></tr>
        <tr><td><strong>Client:</strong></td><td>${booking.clientName}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${booking.clientPhone}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${booking.clientEmail}</td></tr>
        <tr><td><strong>Payment:</strong></td><td>${booking.paymentMethod === 'stripe' ? 'Stripe deposit paid' : 'Bank transfer – awaiting deposit'}</td></tr>
      </table>
      <p><a href="${process.env.ADMIN_URL || 'http://localhost:5173'}/admin">View in Admin</a></p>
    </div>
  `
  await sendMail({ to: adminEmail, subject: `New Booking: ${booking.serviceTitle} – ${booking.clientName}`, html })
}

export async function sendQuoteToAdmin(quote, files, settings) {
  const adminEmail = settings?.email?.quoteEmail || process.env.GMAIL_USER
  const html = `
    <div style="font-family:sans-serif;max-width:600px">
      <h2>New Commercial Cleaning Quote Request</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Name:</strong></td><td>${quote.name}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${quote.email}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${quote.phone}</td></tr>
        <tr><td><strong>Location:</strong></td><td>${quote.businessLocation || '—'}</td></tr>
        <tr><td><strong>Premises Type:</strong></td><td>${quote.premisesType || '—'}</td></tr>
        <tr><td><strong>Preferred Date:</strong></td><td>${quote.preferredDate || '—'}</td></tr>
        <tr><td><strong>Contact Via:</strong></td><td>${quote.preferredContact}</td></tr>
        <tr><td><strong>Requirements:</strong></td><td>${quote.requirements || '—'}</td></tr>
      </table>
    </div>
  `
  const attachments = (files || []).map(f => ({
    filename: f.originalname,
    path: f.path,
  }))
  await sendMail({ to: adminEmail, subject: `Quote Request from ${quote.name}`, html, attachments })
}

export async function sendQuoteConfirmation(quote) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2>Quote Request Received</h2>
      <p>Hi ${quote.name},</p>
      <p>Thank you for your enquiry. We've received your quote request and will be in touch within 24 hours.</p>
      <p>Questions? Call us on <strong>07455 552220</strong> or WhatsApp the same number.</p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
      <p style="color:#999;font-size:12px">Domestic Duties Commercial Ltd. &bull; Choose Right. Choose Us.</p>
    </div>
  `
  await sendMail({ to: quote.email, subject: 'Quote Request Received – Domestic Duties Commercial Ltd.', html })
}
