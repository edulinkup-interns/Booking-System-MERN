# 📅 BookEase — Advanced MERN Booking System

A full-stack appointment scheduling platform built with MongoDB, Express.js, React, and Node.js (MERN stack), featuring React Calendar for date selection, Nodemailer for automated email notifications, and comprehensive booking management.

---

## 🚀 Features

### Client Features
- 🔐 JWT-based authentication with refresh tokens
- 📅 Interactive React Calendar with real-time availability
- ⏰ Time slot selection with buffer time management
- 📧 Automated email confirmations via Nodemailer
- 🔔 24-hour and 1-hour appointment reminders
- 🔄 Reschedule and cancel appointments
- ⭐ Post-appointment ratings and reviews
- 🔁 Recurring appointment support (daily/weekly/biweekly/monthly)
- 📋 Waitlist management
- 🔔 In-app notification center

### Provider Features
- 🏢 Business profile creation with multi-step setup
- 📆 Weekly availability schedule management
- 🚫 Date blocking for holidays/vacations
- ⚙️ Buffer time, lead time, and advance booking limits
- 📊 Analytics dashboard with charts (Recharts)
- 💼 Service catalog management
- 📋 Appointment management (confirm/cancel/complete)

### Technical Features
- 🛡️ Helmet.js security headers
- 🚦 Rate limiting to prevent abuse
- 📝 Winston structured logging
- ⏲️ node-cron for automated reminders
- 💳 Stripe payment integration (optional)
- 🔍 Conflict detection with buffer time logic
- 📊 MongoDB aggregation for analytics

---

## 🗂️ Project Structure

```
booking-system/
├── server/                   # Express.js backend
│   ├── models/               # Mongoose schemas
│   │   ├── User.js           # Auth + JWT generation
│   │   ├── Provider.js       # Business profiles + availability
│   │   ├── Service.js        # Service catalog
│   │   ├── Appointment.js    # Booking management
│   │   ├── Waitlist.js       # Waitlist entries
│   │   └── Notification.js   # In-app notifications
│   ├── routes/               # API endpoints
│   │   ├── auth.js           # Register/login/refresh/reset
│   │   ├── appointments.js   # CRUD + book/cancel/reschedule
│   │   ├── availability.js   # Time slot generation
│   │   ├── providers.js      # Provider management
│   │   ├── services.js       # Service management
│   │   ├── analytics.js      # Dashboard metrics
│   │   ├── notifications.js  # Notification center
│   │   ├── waitlist.js       # Waitlist management
│   │   └── payments.js       # Stripe integration
│   ├── middleware/
│   │   └── auth.js           # JWT protection + RBAC
│   ├── utils/
│   │   ├── emailService.js   # Nodemailer templates
│   │   ├── reminderService.js # Automated reminder cron
│   │   ├── logger.js         # Winston logger
│   │   └── cleanup.js        # Token/waitlist cleanup
│   └── index.js              # Server entry + cron setup
│
└── client/                   # React frontend
    └── src/
        ├── context/
        │   ├── AuthContext.js         # Global auth state
        │   └── NotificationContext.js # Notification polling
        ├── pages/
        │   ├── auth/                  # Login/Register/Reset
        │   ├── provider/              # Provider portal pages
        │   ├── BookingPage.js         # React Calendar + slot selection
        │   ├── AppointmentsPage.js    # Booking history
        │   └── ...
        ├── components/
        │   ├── Layout.js              # Navbar + outlet
        │   └── common/LoadingSpinner.js
        └── utils/api.js               # Axios + token refresh
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for Nodemailer)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd booking-system

# Install all dependencies
npm install
npm run install-all
```

### 2. Configure Server

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/booking-system
JWT_SECRET=your_32_char_secret_here
JWT_REFRESH_SECRET=another_32_char_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password  # Gmail App Password
CLIENT_URL=http://localhost:3000
```

### 3. Configure Client

```bash
cd client
cp .env.example .env
```

`.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run Development

```bash
# From root directory
npm run dev
```

Server: http://localhost:5000  
Client: http://localhost:3000

---

## 📧 Email Setup (Nodemailer)

1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Create an app password for "Mail"
4. Use that password as `EMAIL_PASS` in `.env`

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/auth/me` | Get current user |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments/:id` | Get details |
| PATCH | `/api/appointments/:id/cancel` | Cancel |
| PATCH | `/api/appointments/:id/reschedule` | Reschedule |
| PATCH | `/api/appointments/:id/complete` | Mark complete |
| POST | `/api/appointments/:id/rate` | Submit review |

### Availability
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/availability/:providerId?date=&serviceId=` | Daily slots |
| GET | `/api/availability/:providerId/monthly?month=&year=` | Available dates |

### Providers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers` | List providers |
| POST | `/api/providers` | Create profile |
| PUT | `/api/providers/:id` | Update profile |
| PATCH | `/api/providers/:id/availability` | Update schedule |
| POST | `/api/providers/:id/block-date` | Block a date |

---

## 🕐 Cron Jobs

| Schedule | Job |
|----------|-----|
| Every hour | Send 24h and 1h appointment reminders |
| Every 30 min | Auto-mark no-show appointments |
| Daily midnight | Cleanup expired tokens and waitlist entries |

---

## 🚀 Deployment

### Backend (Render/Railway)

1. Push to GitHub
2. Create new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `node index.js`
5. Add all environment variables

### Frontend (Vercel)

1. Connect GitHub repo
2. Set root directory: `client`
3. Add: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

---

## 🔒 Security

- JWT access tokens (7 day) + refresh tokens (30 day)
- Password hashing with bcryptjs (salt rounds: 12)
- Account lockout after 5 failed login attempts
- Rate limiting: 100 req/15min global, 10 req/15min for auth
- Helmet.js security headers
- Input validation with express-validator
- CORS configured for specific origins

---

## 📊 Availability Algorithm

1. Fetch provider's weekly schedule for the requested day
2. Check if date is in blocked dates list
3. Generate time slots from start to end time with `serviceDuration + bufferTime` intervals
4. For each slot, check conflicts against existing bookings (with buffer)
5. Filter out slots within `minimumBookingLeadTime`
6. Return available/unavailable slots

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, React Calendar |
| State | Context API + hooks |
| Charts | Recharts |
| Styling | Inline CSS (no dependencies) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (access + refresh tokens) |
| Email | Nodemailer |
| Scheduling | node-cron |
| Logging | Winston |
| Security | Helmet, express-rate-limit, bcryptjs |
| Payments | Stripe (optional) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📄 License

MIT License — free to use for educational and commercial purposes.
