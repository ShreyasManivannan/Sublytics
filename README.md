# 🛡️ SubGuard — AI-Powered Subscription Intelligence Platform

SubGuard is a full-stack SaaS platform that automatically tracks your subscriptions, analyzes recurring payments from email invoices, monitors renewal dates, and sends intelligent reminders before subscriptions expire.

![SubGuard](https://img.shields.io/badge/SubGuard-v1.0.0-3B82F6?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)

---

## ✨ Features

- **📊 Smart Dashboard** — Real-time KPI cards, expense charts, and subscription analytics
- **📧 Gmail Integration** — Auto-detect subscriptions from invoice emails
- **🤖 AI Extraction** — Automatically extract service name, amount, billing cycle, and renewal dates
- **🔔 Smart Notifications** — Email & SMS renewal reminders via Resend and Twilio
- **📈 Advanced Analytics** — Monthly/yearly spending trends, category breakdowns, cost projections
- **⚡ Autopay Tracking** — Know which subscriptions auto-renew
- **🔐 Secure Auth** — JWT authentication + Google OAuth

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS 4 | Styling |
| Zustand | State Management |
| Recharts | Charts & Analytics |
| Lucide React | Icons |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | API Framework |
| PostgreSQL | Database |
| JWT | Authentication |
| Passport | Google OAuth |
| node-cron | Scheduled Jobs |
| Resend | Email Notifications |
| Twilio | SMS Notifications |
| Google APIs | Gmail Integration |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/subguard.git
cd subguard
```

### 2. Setup Backend
```bash
cd server
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Setup Database
Run the SQL schema in `server/config/schema.sql` on your PostgreSQL database.

---

## 🔐 Environment Variables

### Server (.env)
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
RESEND_API_KEY=your-resend-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
FRONTEND_URL=http://localhost:5173
```

---

## 📁 Project Structure

```
subguard/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── api/             # Axios instance & API endpoints
│   │   ├── components/      # Reusable UI components
│   │   ├── layouts/         # Dashboard layout with sidebar
│   │   ├── pages/           # Login, Dashboard, Subscriptions, Analytics, Settings
│   │   ├── store/           # Zustand state stores
│   │   ├── App.jsx          # Router configuration
│   │   └── main.jsx         # Entry point
│   └── package.json
│
├── server/                  # Express Backend
│   ├── config/              # Database & schema
│   ├── controllers/         # Route handlers
│   ├── cron/                # Scheduled jobs
│   ├── middleware/          # JWT auth middleware
│   ├── routes/              # API route definitions
│   ├── services/            # Gmail, email, SMS, extraction
│   ├── utils/               # Helper functions
│   └── server.js            # Entry point
│
└── README.md
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | [Vercel](https://vercel.com) | `https://subguard.vercel.app` |
| Backend | [Render](https://render.com) | `https://subguard-api.onrender.com` |
| Database | [Neon](https://neon.tech) | PostgreSQL serverless |

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.

---

Built with ❤️ by Shreyas
