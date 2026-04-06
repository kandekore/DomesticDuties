import { useState, useEffect } from 'react'

function isWithinHours(hours) {
  if (!hours) return true
  const now = new Date()
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const today = days[now.getDay()]
  const h = hours[today]
  if (!h || !h.open) return false
  const [fH, fM] = h.from.split(':').map(Number)
  const [tH, tM] = h.to.split(':').map(Number)
  const nowMins = now.getHours() * 60 + now.getMinutes()
  return nowMins >= fH * 60 + fM && nowMins <= tH * 60 + tM
}

export default function WhatsAppButton({ settings }) {
  const [visible, setVisible]     = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(t)
  }, [])

  if (!settings?.whatsapp?.enabled) return null

  const { number, prefilledMessage, outOfHoursMessage, tooltipText, position, showOutsideHours } = settings.whatsapp
  const withinHours = isWithinHours(settings.hours)
  if (!withinHours && !showOutsideHours) return null

  const message = !withinHours && outOfHoursMessage ? outOfHoursMessage : prefilledMessage
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message || '')}`
  const isRight = position !== 'bottom-left'

  return (
    <>
      <style>{`
        .wa-btn {
          position: fixed;
          bottom: 28px;
          ${isRight ? 'right: 28px;' : 'left: 28px;'}
          z-index: 200;
          width: 60px; height: 60px;
          border-radius: 50%;
          background: #25D366;
          box-shadow: 0 4px 20px rgba(37,211,102,0.4);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.4s ease;
          opacity: ${visible ? 1 : 0};
          transform: ${visible ? 'scale(1)' : 'scale(0.7)'};
          border: none;
          animation: wa-pulse 3s ease-in-out infinite;
        }
        .wa-btn:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(37,211,102,0.55); animation: none; }
        .wa-tooltip {
          position: fixed;
          bottom: 98px;
          ${isRight ? 'right: 28px;' : 'left: 28px;'}
          background: #1a1a1a;
          color: #fff;
          padding: 10px 16px;
          border-radius: var(--radius);
          font-size: 0.85rem; font-weight: 500;
          white-space: nowrap;
          box-shadow: var(--shadow);
          pointer-events: none;
          z-index: 200;
        }
        .wa-tooltip::after {
          content: '';
          position: absolute; top: 100%;
          ${isRight ? 'right: 20px;' : 'left: 20px;'}
          border: 6px solid transparent;
          border-top-color: #1a1a1a;
        }
        @keyframes wa-pulse {
          0%,100% { box-shadow: 0 4px 20px rgba(37,211,102,0.4); }
          50%      { box-shadow: 0 4px 32px rgba(37,211,102,0.7); }
        }
      `}</style>

      {showTooltip && tooltipText && <div className="wa-tooltip">{tooltipText}</div>}

      <a href={href} target="_blank" rel="noopener noreferrer"
        className="wa-btn" aria-label="Chat on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  )
}
