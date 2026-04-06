import mongoose from 'mongoose'

const dayHoursSchema = new mongoose.Schema({
  open: { type: Boolean, default: false },
  from: { type: String, default: '09:00' },
  to:   { type: String, default: '17:00' },
}, { _id: false })

const settingsSchema = new mongoose.Schema({
  singleton: { type: String, default: 'main', unique: true },

  // Business
  business: {
    name:    { type: String, default: 'Domestic Duties Commercial Ltd.' },
    email:   { type: String, default: 'domesticdutiescommercial46@gmail.com' },
    phone:   { type: String, default: '07455 552220' },
    address: String,
    facebook: String,
  },

  // Opening hours (for WhatsApp widget display)
  hours: {
    monday:    { type: dayHoursSchema, default: () => ({ open: true,  from: '09:00', to: '17:00' }) },
    tuesday:   { type: dayHoursSchema, default: () => ({ open: true,  from: '09:00', to: '17:00' }) },
    wednesday: { type: dayHoursSchema, default: () => ({ open: true,  from: '09:00', to: '17:00' }) },
    thursday:  { type: dayHoursSchema, default: () => ({ open: true,  from: '09:00', to: '17:00' }) },
    friday:    { type: dayHoursSchema, default: () => ({ open: true,  from: '09:00', to: '17:00' }) },
    saturday:  { type: dayHoursSchema, default: () => ({ open: false, from: '09:00', to: '13:00' }) },
    sunday:    { type: dayHoursSchema, default: () => ({ open: false, from: '09:00', to: '13:00' }) },
  },

  // WhatsApp widget
  whatsapp: {
    enabled:          { type: Boolean, default: false },
    number:           { type: String, default: '447455552220' },
    prefilledMessage: { type: String, default: 'Hi, I\'d like to enquire about your cleaning services.' },
    outOfHoursMessage:{ type: String, default: 'Hi, I\'d like to make an enquiry. Please get back to me when available.' },
    tooltipText:      { type: String, default: 'Chat with us on WhatsApp' },
    position:         { type: String, enum: ['bottom-right', 'bottom-left'], default: 'bottom-right' },
    showOutsideHours: { type: Boolean, default: true },
  },

  // WhatsApp Business API (for reminders)
  whatsappApi: {
    enabled:     { type: Boolean, default: false },
    provider:    { type: String, enum: ['twilio', 'meta'], default: 'twilio' },
    accountSid:  String,
    authToken:   String,
    fromNumber:  String,  // Twilio: whatsapp:+14155238886  Meta: phone number ID
    accessToken: String,  // Meta only
  },

  // Stripe
  stripe: {
    enabled:       { type: Boolean, default: false },
    publishableKey: String,
    secretKey:     String,
  },

  // Bank transfer details (shown to customer after booking)
  bankTransfer: {
    accountName:   { type: String, default: '' },
    sortCode:      { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    reference:     { type: String, default: 'Booking ref' },
    instructions:  { type: String, default: 'Please use your booking reference as the payment reference.' },
  },

  // Email
  email: {
    fromName:    { type: String, default: 'Domestic Duties Commercial Ltd.' },
    fromAddress: { type: String, default: 'domesticdutiescommercial46@gmail.com' },
    smtpHost:    String,
    smtpPort:    { type: Number, default: 587 },
    smtpUser:    String,
    smtpPass:    String,
    adminEmail:  { type: String, default: 'domesticdutiescommercial46@gmail.com' },
    quoteEmail:  { type: String, default: 'domesticdutiescommercial46@gmail.com' },
  },

  // Google Calendar
  google: {
    enabled:      { type: Boolean, default: false },
    clientId:     String,
    clientSecret: String,
    redirectUri:  String,
  },

  // Admin auth
  adminPassword: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema)
