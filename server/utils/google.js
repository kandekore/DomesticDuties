import { google } from 'googleapis'

function getOAuthClient(settings) {
  const cfg = settings?.google
  if (!cfg?.clientId || !cfg?.clientSecret) return null
  return new google.auth.OAuth2(cfg.clientId, cfg.clientSecret, cfg.redirectUri)
}

export function getAuthUrl(settings) {
  const client = getOAuthClient(settings)
  if (!client) return null
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  })
}

export async function exchangeCode(code, settings) {
  const client = getOAuthClient(settings)
  if (!client) throw new Error('Google OAuth not configured')
  const { tokens } = await client.getToken(code)
  return tokens
}

export async function createGoogleCalendarEvent(booking, settings) {
  const { Provider } = await import('../models/Provider.js')
  const provider = await Provider.findById(booking.provider?._id || booking.provider)
  if (!provider?.googleRefreshToken) return null

  const client = getOAuthClient(settings)
  if (!client) return null

  client.setCredentials({ refresh_token: provider.googleRefreshToken })
  const calendar = google.calendar({ version: 'v3', auth: client })

  const startDT = `${booking.bookingDate}T${booking.startTime}:00`
  const endDT   = `${booking.bookingDate}T${booking.endTime}:00`

  const event = await calendar.events.insert({
    calendarId: provider.googleCalendarId || 'primary',
    requestBody: {
      summary: `${booking.serviceTitle} – ${booking.clientName}`,
      description: `Client: ${booking.clientName}\nPhone: ${booking.clientPhone}\nEmail: ${booking.clientEmail}\n${booking.clientAddress ? 'Address: ' + booking.clientAddress : ''}\n${booking.clientNotes ? 'Notes: ' + booking.clientNotes : ''}`,
      start: { dateTime: startDT, timeZone: 'Europe/London' },
      end:   { dateTime: endDT,   timeZone: 'Europe/London' },
    },
  })
  return event.data.id
}

export async function deleteGoogleCalendarEvent(booking, settings) {
  if (!booking.googleEventId) return
  const { Provider } = await import('../models/Provider.js')
  const provider = await Provider.findById(booking.provider?._id || booking.provider)
  if (!provider?.googleRefreshToken) return

  const client = getOAuthClient(settings)
  if (!client) return

  client.setCredentials({ refresh_token: provider.googleRefreshToken })
  const calendar = google.calendar({ version: 'v3', auth: client })
  await calendar.events.delete({
    calendarId: provider.googleCalendarId || 'primary',
    eventId: booking.googleEventId,
  })
}
