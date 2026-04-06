# Domestic Duties Commercial Ltd. — Website & Booking System

## Stack
- **Client**: React (Vite) + React Router + Stripe.js
- **Server**: Node.js + Express + MongoDB (Mongoose)
- **Integrations**: Stripe, Google Calendar API, WhatsApp Business API (Twilio or Meta)

---

## Quick Start

### 1. Server setup
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Gmail credentials etc.
npm run dev
```

### 2. Client setup
```bash
cd client
npm run dev
```

Client runs on **http://localhost:5173**, server on **http://localhost:3001**.  
The Vite dev proxy forwards all `/api` requests to the server automatically.

---

## Admin Panel
Navigate to **http://localhost:5173/admin**

**Default credentials** (set via `.env`):
- Email: `admin@domesticduties.co.uk`
- Password: `changeme123`

**Change these immediately** after first login via a password reset or by updating the Admin document in MongoDB.

### Admin sections
| Section | Purpose |
|---|---|
| Bookings | View, confirm, cancel, mark deposit received |
| Quote Requests | View commercial cleaning quote submissions |
| Services | Add/edit bookable services (oven, carpet etc.) |
| Providers / Staff | Manage team members and their assigned services |
| Availability | Set weekly working hours per provider |
| Blackout Dates | Block specific dates across all bookings |
| WhatsApp Widget | Configure the floating chat button |
| Payment | Stripe keys + bank transfer details |
| WhatsApp API | Twilio or Meta credentials for reminders |
| Google Calendar | OAuth setup + connect per provider |
| Email Settings | SMTP config, admin/quote email addresses |
| Business Info | Name, phone, address, social links |
| Opening Hours | Business hours (used for WhatsApp widget) |

---

## Booking Flow
1. Customer selects a service → picks available date → picks time slot
2. Enters name, email, phone, address, notes
3. Pays deposit:
   - **Stripe**: card payment taken immediately
   - **Bank transfer**: bank details shown, admin manually confirms receipt
4. Admin reviews in dashboard → marks deposit received (if bank transfer) → confirms booking
5. Google Calendar event created on confirmation
6. Customer receives WhatsApp reminder the day before

---

## Seeding Services
After first start, add your services via the admin panel:

**Oven Cleaning:**
- Slug: `oven-cleaning`
- Duration: 120 min, Buffer: 30 min
- Price: £65 (single), create separate services per type as needed
- Deposit: 10% (percent mode)
- Payment: Bank Transfer or Stripe

**Carpet & Upholstery:**
- Slug: `carpet-upholstery`
- Duration: 240 min, Buffer: 30 min
- Price: £50
- Deposit: 10%
- Payment: Bank Transfer or Stripe

Then assign these services to your providers in the Providers section.

---

## Google Calendar Setup
1. Create a project in Google Cloud Console
2. Enable the Calendar API
3. Create OAuth 2.0 credentials (Web application)
4. Add `http://localhost:3001/api/google/callback` (dev) and your production URL as redirect URIs
5. Enter Client ID, Secret and Redirect URI in Admin → Google Calendar
6. Click "Connect Google Calendar" for each provider — authenticate in the popup

---

## WhatsApp Reminders
A cron job runs at 09:00 every morning and sends a WhatsApp reminder to any confirmed bookings for the following day.

Configure in Admin → WhatsApp API:
- **Twilio**: Enter Account SID, Auth Token, and your WhatsApp-enabled Twilio number
- **Meta**: Enter your Phone Number ID and Access Token from Meta Business Platform

---

## Deployment Notes
- Set `CLIENT_URL` and `ADMIN_URL` in server `.env` to your production domain
- Run `npm run build` in `/client` and serve the `dist/` folder statically (or use a reverse proxy)
- Set `STRIPE_WEBHOOK_SECRET` to the secret from your Stripe webhook endpoint
- Ensure MongoDB is accessible from your server
