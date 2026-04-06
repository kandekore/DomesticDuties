import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'

import Home            from './pages/Home'
import Overview        from './pages/Overview'
import OurServices     from './pages/OurServices'
import Pricing         from './pages/Pricing'
import ContactUs       from './pages/ContactUs'
import CommercialQuote from './pages/CommercialQuote'
import BookingPage     from './pages/BookingPage'

import AdminLogin     from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'

function Layout() {
  const settings  = useSettings()
  const { pathname } = useLocation()
  const isAdmin   = pathname.startsWith('/admin')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin"       element={<AdminDashboard />} />
        <Route path="/admin/*"     element={<AdminDashboard />} />
      </Routes>
    )
  }

  return (
    <>
      <Header />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/"                  element={<Home />} />
          <Route path="/overview"          element={<Overview />} />
          <Route path="/our-services"      element={<OurServices />} />
          <Route path="/pricing"           element={<Pricing />} />
          <Route path="/contact-us"        element={<ContactUs />} />
          <Route path="/commercial-quote"  element={<CommercialQuote />} />
          <Route path="/book/:serviceSlug" element={<BookingPage />} />
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
      <WhatsAppButton settings={settings} />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <Layout />
      </SettingsProvider>
    </BrowserRouter>
  )
}
