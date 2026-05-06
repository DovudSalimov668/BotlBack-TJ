# BotlBack TJ 🍾♻️

**QR-on-pack consumer loyalty + recycling behavior change app for Coca-Cola İçecek Tajikistan.**

Scan when buying (+10 pts). Scan again when recycling (+20 pts). Redeem for Alif Mobi credit.
Brand managers see real-time analytics: recycling rates by region, SKU performance, campaign ROI.

---

## One-Command Setup

### Prerequisites
- Python 3.11+, Node 18+, PostgreSQL 15+ running

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit DB credentials if needed

python manage.py migrate
python manage.py seed_demo    # seeds 2000 bottles, 150 users, 3500 scans
python manage.py runserver
```

Backend runs at **http://localhost:8000**
Django admin at **http://localhost:8000/admin/**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### Test on real phone (same WiFi)

```bash
cd frontend && npm run dev -- --host
# Visit http://192.168.x.x:5173 on phone
```

---

## Demo Accounts

| Role | Credentials |
|------|-------------|
| Admin (brand dashboard) | phone: `admin` / password: `Botlback2026!` |
| Demo consumer | phone: `+992900000001` / OTP: `1234` |

**Magic QR codes (print these for live demo):**
- `BTL-DEMO-0001` — Coca-Cola 0.5L, ready to scan (+10 pts)
- `BTL-DEMO-0002` — Fanta 0.5L, ready to scan (+10 pts)
- `RP-DEMO-001` — Mehrgon Bazaar recycling point (+20 pts)

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | Django 5 + DRF + simplejwt |
| Database | PostgreSQL 15 |
| Frontend | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS + ShadCN UI |
| Charts | Recharts |
| Maps | Leaflet + react-leaflet |
| State | TanStack Query v5 + Zustand |
| i18n | react-i18next (RU + TG) |
| Animations | Framer Motion |

---

## Key API Endpoints

```
POST /api/auth/register/          Phone + name → JWT
POST /api/auth/login/             Phone + OTP (1234 in DEBUG) → JWT
GET  /api/bottles/verify/:qr/     Check bottle status
POST /api/bottles/scan/           Scan purchase → +10 pts
POST /api/bottles/recycle/        Recycle → +20 pts
GET  /api/recycling/points/       All recycling points
GET  /api/rewards/prizes/         Available prizes
POST /api/rewards/redeem/         Redeem prize
GET  /api/analytics/overview/     KPI summary (admin)
GET  /api/analytics/timeseries/   Time series data (admin)
GET  /api/analytics/map/          Geographic heatmap data (admin)
GET  /api/analytics/regions/      Per-region breakdown (admin)
```

---

## Project Structure

```
botlback-tj/
├── backend/
│   ├── apps/
│   │   ├── users/      Custom User model (phone-based auth)
│   │   ├── bottles/    SKU, Bottle, seed_demo command
│   │   ├── scans/      Scan events (purchase + recycle)
│   │   ├── recycling/  RecyclingPoint locations
│   │   ├── rewards/    Prize + Redemption
│   │   └── analytics/  Dashboard aggregations, Campaign
│   └── botlback/       Django project settings
└── frontend/
    └── src/
        ├── pages/      All routes (consumer + admin dashboard)
        ├── api/        TanStack Query hooks
        ├── components/ Shared UI components
        ├── store/      Zustand auth store
        └── locales/    ru.json + tg.json translations
```

---

## CCI Tajikistan Context

- **Legal entity:** Coca-Cola Nushokihoi Tojikiston LLC (CCI)
- **Plant:** Pr. Jami / Nizhnii Lachob 2/1, Dushanbe — 55,000 m²
- **GM:** Burak Ateş
- **Volume:** ~80M bottles/year through 8,000+ sales points
- **Target:** 90-day pilot, 100,000 bottles, Nowruz 2027

---

*Built for the Coca-Cola Dushanbe Hackathon 2026. See DEMO_SCRIPT.md for the 2-minute pitch.*
