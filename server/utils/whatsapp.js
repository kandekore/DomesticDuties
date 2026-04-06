import Settings from '../models/Settings.js'

// Send a WhatsApp message via Twilio or Meta Business API
export async function sendWhatsApp(to, message) {
  const s = await Settings.findOne({ singleton: 'main' })
  const cfg = s?.whatsappApi
  if (!cfg?.enabled) return

  const phone = to.replace(/\D/g, '')
  const e164 = phone.startsWith('44') ? `+${phone}` : phone.startsWith('0') ? `+44${phone.slice(1)}` : `+${phone}`

  if (cfg.provider === 'twilio') {
    const { default: twilio } = await import('twilio')
    const client = twilio(cfg.accountSid, cfg.authToken)
    await client.messages.create({
      from: cfg.fromNumber,
      to: `whatsapp:${e164}`,
      body: message,
    })
  } else if (cfg.provider === 'meta') {
    await fetch(`https://graph.facebook.com/v18.0/${cfg.fromNumber}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: e164.replace('+', ''),
        type: 'text',
        text: { body: message },
      }),
    })
  }
}

export async function sendBookingReminder(booking) {
  const msg = `Hi ${booking.clientName}, this is a reminder that your ${booking.serviceTitle} appointment with Domestic Duties Commercial Ltd. is tomorrow (${booking.bookingDate}) at ${booking.startTime}. Please ensure someone is available. Questions? Reply to this message. Thank you!`
  await sendWhatsApp(booking.clientPhone, msg)
}
