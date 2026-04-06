import Availability from '../models/Availability.js'
import Booking from '../models/Booking.js'
import BlackoutDate from '../models/BlackoutDate.js'

// Generate HH:MM slots for a provider on a given YYYY-MM-DD
export async function getSlotsForDate(providerId, serviceId, date, duration, bufferTime) {
  // Check blackout
  const blackout = await BlackoutDate.findOne({ date })
  if (blackout) return []

  const dayOfWeek = new Date(date + 'T12:00:00Z').getUTCDay()

  // Check override first, then recurring
  let rule = await Availability.findOne({ provider: providerId, overrideDate: date })
  if (!rule) {
    rule = await Availability.findOne({ provider: providerId, dayOfWeek, overrideDate: null })
  }
  if (!rule || !rule.isAvailable) return []

  const [sh, sm] = rule.startTime.split(':').map(Number)
  const [eh, em] = rule.endTime.split(':').map(Number)
  const startMins = sh * 60 + sm
  const endMins   = eh * 60 + em
  // Fixed start times: morning (9:00, 9:30) and afternoon (12:00, 12:30)
  const fixedStartTimes = [9 * 60, 9 * 60 + 30, 12 * 60, 12 * 60 + 30]

  // Get existing bookings for this provider on this date (non-cancelled)
  const existing = await Booking.find({
    provider: providerId,
    bookingDate: date,
    status: { $nin: ['cancelled'] },
  })

  const busyRanges = existing.map(b => {
    const [bh, bm] = b.startTime.split(':').map(Number)
    const [eh2, em2] = b.endTime.split(':').map(Number)
    return { start: bh * 60 + bm, end: eh2 * 60 + em2 + bufferTime }
  })

  const slots = []
  for (const t of fixedStartTimes) {
    if (t < startMins || t + duration > endMins) continue
    const slotEnd = t + duration
    const conflict = busyRanges.some(r => t < r.end && slotEnd > r.start)
    if (!conflict) {
      const hh = String(Math.floor(t / 60)).padStart(2, '0')
      const mm = String(t % 60).padStart(2, '0')
      slots.push(`${hh}:${mm}`)
    }
  }
  return slots
}

// Get all available dates in a YYYY-MM month for a provider/service
export async function getAvailableDatesForMonth(providerId, duration, bufferTime, yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()

  const blackouts = await BlackoutDate.find({
    date: { $gte: `${yearMonth}-01`, $lte: `${yearMonth}-${String(daysInMonth).padStart(2,'0')}` }
  })
  const blackoutSet = new Set(blackouts.map(b => b.date))

  const today = new Date(); today.setUTCHours(0,0,0,0)
  const available = []

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${yearMonth}-${String(d).padStart(2,'0')}`
    const dt = new Date(dateStr + 'T12:00:00Z')
    if (dt <= today) continue
    if (blackoutSet.has(dateStr)) continue
    const slots = await getSlotsForDate(providerId, null, dateStr, duration, bufferTime)
    if (slots.length > 0) available.push(dateStr)
  }
  return available
}
