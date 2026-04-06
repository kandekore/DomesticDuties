import { createContext, useContext, useEffect, useState } from 'react'

const Ctx = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setSettings(d))
      .catch(() => {})
  }, [])

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>
}

export const useSettings = () => useContext(Ctx)
