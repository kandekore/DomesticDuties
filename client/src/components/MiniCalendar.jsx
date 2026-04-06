import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function MiniCalendar({ value, onChange, blackouts = [], availableDates, onMonthChange }) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(); d.setUTCDate(d.getUTCDate() + 1); return d
  })

  const year  = viewDate.getUTCFullYear()
  const month = viewDate.getUTCMonth()
  const firstDay    = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const monthName   = viewDate.toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const monthKey    = `${year}-${String(month + 1).padStart(2, '0')}`

  useEffect(() => { onMonthChange?.(monthKey) }, [monthKey]) // eslint-disable-line

  const dateStr = d => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const isDisabled = d => {
    const ds  = dateStr(d)
    const dt  = new Date(Date.UTC(year, month, d))
    if (dt <= today) return true
    if (blackouts.includes(ds)) return true
    if (availableDates !== null && !availableDates.has(ds)) return true
    return false
  }

  const changeMonth = delta => {
    setViewDate(d => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 1)))
  }

  return (
    <div style={{ userSelect: 'none' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => changeMonth(-1)} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', color: '#666', borderRadius: 'var(--radius)' }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem' }}>{monthName}</span>
        <button onClick={() => changeMonth(1)} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', color: '#666', borderRadius: 'var(--radius)' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#aaa', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d   = i + 1
          const ds  = dateStr(d)
          const dis = isDisabled(d)
          const sel = value === ds
          const avail = availableDates !== null && availableDates.has(ds)
          return (
            <button
              key={d}
              onClick={() => !dis && onChange(ds)}
              disabled={dis}
              style={{
                aspectRatio: '1',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: '0.85rem',
                fontWeight: sel ? 700 : dis ? 400 : 600,
                cursor: dis ? 'not-allowed' : 'pointer',
                position: 'relative',
                background: sel ? 'var(--primary)' : 'transparent',
                color: sel ? '#fff' : dis ? '#ccc' : 'var(--heading)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!dis && !sel) e.currentTarget.style.background = '#f0f8ff' }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}
            >
              {d}
              {!sel && !dis && avail && (
                <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
