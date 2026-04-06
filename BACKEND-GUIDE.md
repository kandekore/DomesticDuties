# Domestic Duties — Backend & Admin Portal Guide

This guide covers everything you need to set up, configure and manage the Domestic Duties Commercial Ltd. booking system.

---

## Table of Contents

1. [Server Setup](#server-setup)
2. [Environment Variables](#environment-variables)
3. [Admin Portal Overview](#admin-portal-overview)
4. [Managing Bookings](#managing-bookings)
5. [Managing Services](#managing-services)
6. [Managing Providers (Staff)](#managing-providers-staff)
7. [Availability & Scheduling](#availability--scheduling)
8. [Blackout Dates](#blackout-dates)
9. [Payment Configuration](#payment-configuration)
10. [Email Setup](#email-setup)
11. [Google Calendar Integration](#google-calendar-integration)
12. [WhatsApp Widget](#whatsapp-widget)
13. [WhatsApp Reminders (API)](#whatsapp-reminders-api)
14. [Business Info & Opening Hours](#business-info--opening-hours)
15. [Booking Flow (How It All Works)](#booking-flow-how-it-all-works)
16. [Tips & Best Practices](#tips--best-practices)
17. [Troubleshooting](#troubleshooting)

---

## Server Setup

### Requirements
- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation
```bash
cd server
cp .env.example .env    # then edit with your values
npm install
npm run dev             # development with auto-reload
npm start               # production
```

The server runs on **http://localhost:3001** by default.

### Client (Frontend)
```bash
cd client
npm install
npm run dev
```

Runs on **http://localhost:5173**. The Vite dev proxy forwards `/api` requests to the server.

---

## Environment Variables

Edit `server/.env` with the following:

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/domestic-duties` |
| `JWT_SECRET` | Secret key for admin/provider auth tokens. Use a long random string | `a7f3k9...` |
| `PORT` | Server port | `3001` |
| `CLIENT_URL` | Frontend URL (used in emails) | `http://localhost:5173` |
| `ADMIN_URL` | Admin panel URL (used in emails) | `http://localhost:5173` |
| `ADMIN_EMAIL` | Default admin login email (first run only) | `admin@domesticduties.co.uk` |
| `ADMIN_PASSWORD` | Default admin login password (first run only) | `changeme123` |
| `GMAIL_USER` | Fallback Gmail address if SMTP not configured | `you@gmail.com` |
| `GMAIL_PASS` | Gmail App Password (not your Google password) | `abcd efgh ijkl mnop` |
| `STRIPE_WEBHOOK_SECRET` | From your Stripe dashboard webhook settings | `whsec_...` |

> **Important:** Change `ADMIN_PASSWORD` immediately after first login. The seed credentials are only used to create the initial admin account.

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail". Use that 16-character code as `GMAIL_PASS`.

---

## Admin Portal Overview

Access the admin panel at: **http://localhost:5173/admin**

Log in with the credentials from your `.env` file (or whatever you changed them to).

The sidebar contains all management sections:

| Section | What It Does |
|---|---|
| **Bookings** | View, confirm, cancel and complete customer bookings |
| **Quote Requests** | Review commercial cleaning enquiries submitted via the quote form |
| **Services** | Create and edit bookable services (oven cleaning, carpet cleaning, etc.) |
| **Providers** | Manage your team members and assign services to them |
| **Availability** | Set working hours for each provider (which days, what times) |
| **Blackout Dates** | Block specific dates so no bookings can be made (holidays, etc.) |
| **WhatsApp Widget** | Configure the floating WhatsApp chat button on the website |
| **Payment** | Set up Stripe card payments or bank transfer details |
| **WhatsApp API** | Configure automated WhatsApp reminders via Twilio or Meta |
| **Google Calendar** | Connect provider calendars so bookings appear automatically |
| **Email Settings** | SMTP configuration and notification email addresses |
| **Business Info** | Company name, phone, address, social links |
| **Opening Hours** | Business hours (controls WhatsApp widget in/out of hours messages) |

---

## Managing Bookings

### Viewing Bookings
- Use the filter buttons at the top to view bookings by status
- Click any booking to open the detail panel on the right

### Booking Statuses

| Status | Meaning |
|---|---|
| **Pending Deposit** | Booking created, waiting for deposit payment |
| **Pending Confirmation** | Deposit received (or auto-escalated), waiting for you to confirm |
| **Confirmed** | You've confirmed the booking — customer has been notified |
| **Completed** | Service has been delivered |
| **Cancelled** | Booking was cancelled |

### Actions You Can Take
- **Mark Deposit Received** — For bank transfer bookings, click this once the customer has paid. Moves the booking to "Pending Confirmation"
- **Confirm Booking** — Sends the customer a confirmation email and creates a Google Calendar event (if connected). Moves to "Confirmed"
- **Mark Completed** — After the job is done. Moves to "Completed"
- **Cancel** — Cancels the booking, removes the Google Calendar event, and notifies the customer

### Auto-Escalation
If a bank transfer booking stays in "Pending Deposit" for over 24 hours, it automatically moves to "Pending Confirmation" with a note. This is so you don't lose bookings if a customer forgets to mention they've paid — you can follow up directly.

> **Tip:** Check the Bookings section daily. Filter by "Pending Confirmation" to see what needs your attention.

---

## Managing Services

Each bookable service has the following settings:

| Field | Description |
|---|---|
| **Title** | Display name (e.g. "Oven Cleaning") |
| **Slug** | URL identifier (e.g. `oven-cleaning` → booking page is `/book/oven-cleaning`) |
| **Duration** | How long the service takes in minutes |
| **Buffer Time** | Gap after each booking before the next slot is available (in minutes) |
| **Price** | Cost in pounds (£) |
| **Category** | Used for grouping — `oven`, `carpet_upholstery`, or `other` |
| **Deposit Mode** | `Percent` (e.g. 10%), `Fixed` (e.g. £20), or `None` |
| **Payment Method** | `Stripe` (card), `Bank Transfer`, or `None` |
| **Active** | Toggle to show/hide the service on the website |

> **Tip:** The slug must be unique and URL-friendly (lowercase, hyphens, no spaces). Once customers have bookmarked the booking link, avoid changing the slug.

> **Tip:** Buffer time prevents back-to-back bookings. If your team needs 30 minutes to travel between jobs, set buffer to 30.

---

## Managing Providers (Staff)

Providers are the people who carry out the work. Each provider:

- Has their own login credentials (email + password)
- Can be assigned multiple services
- Has their own availability schedule
- Can have their own Google Calendar connected

### Adding a Provider
1. Go to **Providers** → click **Add Provider**
2. Enter name, email, password, phone
3. Tick the services they can perform
4. Save

> **Tip:** You must assign at least one service to a provider and set up their availability, otherwise no time slots will appear on the booking page.

> **Tip:** When editing a provider, leave the password field blank to keep their existing password.

---

## Availability & Scheduling

Availability controls which time slots appear on the booking calendar.

### Setting Weekly Hours
1. Go to **Availability**
2. Select a provider from the dropdown
3. For each day of the week, set:
   - **Available** toggle (on/off)
   - **Start time** and **End time**
4. Changes save automatically

### How Slots Are Generated
The system uses **fixed start times**: **9:00, 9:30, 12:00, and 12:30**.

When a customer selects a date, the system checks:
1. Is the provider available on that day?
2. Does the service duration fit within the provider's hours?
3. Does the slot conflict with an existing booking (including buffer time)?

If a booking is made at 9:00 for a 150-minute service, the 9:30 slot becomes unavailable (since it overlaps). This means a maximum of **2 bookings per day** — one in the morning window and one in the afternoon window.

> **Tip:** If no time slots are appearing for a service, check that: (1) a provider is assigned to that service, (2) that provider has availability set for the day, and (3) the service duration + buffer fits within the provider's hours.

---

## Blackout Dates

Blackout dates block all bookings across all providers for specific days.

### Adding a Blackout
1. Go to **Blackout Dates**
2. Select a date and optionally add a reason (e.g. "Bank Holiday", "Company Holiday")
3. Click **Add**

Blackout dates appear greyed out on the customer booking calendar.

> **Tip:** Add all bank holidays and planned closures in advance so customers can't accidentally book those days.

---

## Payment Configuration

### Stripe (Card Payments)
1. Go to **Payment** in the admin panel
2. Toggle **Stripe Enabled**
3. Enter your **Publishable Key** and **Secret Key** from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
4. Set `STRIPE_WEBHOOK_SECRET` in your `.env` file

**Setting up the Stripe Webhook:**
1. In Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://yourdomain.com/api/bookings/stripe-webhook`
3. Select event: `payment_intent.succeeded`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET` in `.env`

### Bank Transfer
1. Go to **Payment**
2. Fill in: Account Name, Sort Code, Account Number
3. Add any payment instructions (shown to customer after booking)
4. Add a reference format (e.g. "DD-" followed by booking ID)

When a customer chooses bank transfer, they see these details after booking. You then manually mark the deposit as received in the Bookings section.

> **Tip:** Most small service businesses find bank transfer simpler — no Stripe fees and you have full control. Use Stripe if you want instant automated payment confirmation.

---

## Email Setup

The system sends emails for:
- New booking confirmations (to customer)
- New booking alerts (to you)
- Booking confirmed notifications (to customer)
- Quote request confirmations (to customer)
- Quote alerts (to you)

### Configuring SMTP
1. Go to **Email Settings**
2. Fill in:
   - **From Name** — appears as the sender name
   - **From Address** — the "from" email address
   - **Admin Email** — receives new booking notifications
   - **Quote Email** — receives quote request notifications
   - **SMTP Host** — e.g. `smtp.gmail.com`
   - **SMTP Port** — usually `587` for TLS
   - **SMTP User** — your email login
   - **SMTP Password** — your email password or app password

If SMTP is not configured, the system falls back to the Gmail credentials in your `.env` file.

> **Tip:** For Gmail, use an App Password (not your regular password). Enable 2-Step Verification first, then generate an App Password at: Google Account → Security → App Passwords.

> **Tip:** Set the Admin Email and Quote Email to wherever you want to receive notifications. They can be different addresses.

---

## Google Calendar Integration

When enabled, confirmed bookings automatically create events in your provider's Google Calendar.

### Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use existing)
3. Enable the **Google Calendar API**
4. Go to Credentials → Create OAuth 2.0 Client ID (Web application)
5. Add your redirect URI: `https://yourdomain.com/api/google/callback` (or `http://localhost:3001/api/google/callback` for development)
6. Copy the Client ID and Client Secret

### In the Admin Panel
1. Go to **Google Calendar**
2. Enter Client ID, Client Secret, and Redirect URI
3. Toggle **Enabled**
4. Save changes
5. For each provider, click **Connect Google Calendar**
6. A popup will open — sign in with the Google account that owns the calendar
7. Authorise access

Once connected, confirming a booking creates a calendar event with the service name, client name, address and notes. Cancelling a booking removes the event.

> **Tip:** Each provider can connect their own Google Calendar. The calendar event is created in whichever provider is assigned to the booking.

---

## WhatsApp Widget

The floating WhatsApp button lets website visitors message you directly.

### Configuration
1. Go to **WhatsApp Widget**
2. Toggle **Enabled**
3. Set your WhatsApp number (format: country code + number, no +, e.g. `447455552220`)
4. Customise:
   - **Prefilled Message** — pre-written message for the customer (during business hours)
   - **Out of Hours Message** — shown when business is closed
   - **Tooltip Text** — hover text on the button
   - **Position** — bottom-right or bottom-left
   - **Show Outside Hours** — whether the button appears at all outside business hours

> **Tip:** The widget uses the Opening Hours section to determine if you're currently open. Make sure your hours are set correctly.

---

## WhatsApp Reminders (API)

Automated WhatsApp messages sent to customers the day before their booking.

A background job runs at **09:00 every morning** and sends reminders for all confirmed bookings scheduled for the following day.

### Twilio Setup
1. Create a [Twilio](https://www.twilio.com) account
2. Set up a WhatsApp sender (Twilio Sandbox or approved number)
3. In admin panel → **WhatsApp API**:
   - Provider: Twilio
   - Account SID and Auth Token (from Twilio Console)
   - From Number: `whatsapp:+14155238886` (sandbox) or your approved number

### Meta (WhatsApp Business Platform) Setup
1. Set up via [Meta Business Platform](https://business.facebook.com)
2. In admin panel → **WhatsApp API**:
   - Provider: Meta
   - Phone Number ID (from Meta dashboard)
   - Access Token (permanent token from Meta)

> **Tip:** Twilio is easier to set up for testing. Meta is better for production with higher volumes and approved templates.

> **Tip:** Reminders are only sent for bookings with status "Confirmed". Make sure you confirm bookings promptly so customers receive their reminders.

---

## Business Info & Opening Hours

### Business Info
Go to **Business Info** to set:
- Business name (appears in emails and footers)
- Email, phone, address
- Facebook URL

### Opening Hours
Go to **Opening Hours** to set which days you're open and your hours. This is used by the WhatsApp widget to show different messages during and outside business hours.

> **Tip:** Opening hours here are for the WhatsApp widget only. Booking availability is controlled separately in the Availability section.

---

## Booking Flow (How It All Works)

Here's what happens end-to-end when a customer makes a booking:

### 1. Customer Books Online
- Visits `/book/oven-cleaning` (or other service slug)
- Selects an available date from the calendar
- Picks a time slot (9:00, 9:30, 12:00, or 12:30)
- Fills in their details (name, email, phone, address, notes)
- Submits the booking

### 2. Payment
- **Stripe:** Customer pays the deposit by card immediately. The system automatically marks the deposit as paid.
- **Bank Transfer:** Customer sees your bank details and transfers the deposit manually.

### 3. You Receive a Notification
- An email arrives at your admin email with the booking details
- The booking appears in the admin panel under **Bookings**

### 4. You Process the Booking
- **If Stripe:** Deposit is already confirmed → booking is "Pending Confirmation" → click **Confirm**
- **If Bank Transfer:** Wait for payment to arrive → click **Mark Deposit Received** → then **Confirm**

### 5. Customer Gets Confirmed
- Confirmation email sent automatically
- Google Calendar event created (if connected)

### 6. Day Before the Appointment
- WhatsApp reminder sent at 09:00 (if WhatsApp API configured)

### 7. After the Job
- Mark the booking as **Completed** in the admin panel

---

## Tips & Best Practices

### Getting Started Checklist
1. Change the default admin password
2. Add your services with correct durations, prices and deposit settings
3. Add at least one provider and assign services to them
4. Set up availability for your provider(s) — without this, no slots appear
5. Configure email settings so notifications work
6. Add bank transfer details (if using bank transfer for payments)
7. Set your business info and opening hours
8. Add any upcoming blackout dates (bank holidays, etc.)

### Daily Workflow
1. Check **Bookings** filtered by "Pending Confirmation" — these need your attention
2. Check **Quote Requests** filtered by "New" — respond within 24 hours
3. Mark completed jobs as "Completed" to keep things tidy

### Common Pitfalls
- **No time slots showing?** Check that a provider exists, is assigned to the service, and has availability set for that day of the week
- **Emails not sending?** Verify SMTP settings. For Gmail, you must use an App Password with 2FA enabled
- **Google Calendar not creating events?** Make sure Google is enabled in settings AND the provider has connected their calendar
- **WhatsApp reminders not sending?** Check that WhatsApp API is enabled, credentials are correct, and the booking status is "Confirmed" (not just "Pending")
- **Booking stuck on "Pending Deposit"?** For bank transfer bookings, you need to manually mark the deposit received. After 24 hours, the system auto-escalates it with a note

### Security
- Never share your `.env` file or commit it to git
- Use strong, unique values for `JWT_SECRET`
- Change the default admin password immediately
- If your `.env` was ever exposed, rotate all secrets (JWT, Stripe keys, SMTP password, etc.)

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Can't log in to admin | Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. The seed only runs on first startup — if you changed the password in the DB, use that instead |
| Server won't start | Check `MONGO_URI` is correct and MongoDB is running |
| Emails not arriving | Check spam folder. Verify SMTP settings in admin panel. For Gmail, use an App Password |
| Stripe payments failing | Check Stripe keys are correct. Ensure webhook secret matches. Check Stripe dashboard for error details |
| Calendar events not appearing | Verify Google Calendar is enabled, credentials are entered, and the provider has connected their account |
| Booking calendar shows no dates | Ensure at least one provider is active, assigned to the service, and has availability rules set |
| WhatsApp widget not showing | Check it's enabled in settings and the number format is correct (no + prefix, e.g. `447455552220`) |
