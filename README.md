# BotlBack TJ

**QR-on-pack consumer loyalty + recycling behavior change app for Coca-Cola İçecek Tajikistan.**

Scan when buying (+10 pts). Scan again when recycling (+20 pts). Redeem for Alif Mobi credit.
Brand managers see real-time analytics: recycling rates by region, SKU performance, campaign ROI.

---

## Business Problem

Tajikistan produces ~80 million PET bottles per year (CCI data). Less than 5% are recycled.
BotlBack closes the loop: buy → earn points → recycle → earn more → redeem prizes.
The double-incentive (purchase *and* recycle) is the core mechanic. A user who only buys gets
fewer points than one who also returns bottles — nudging behavior change without mandates.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│  Mobile (React PWA)         Desktop (same PWA)         │
│  Consumer flow              Admin dashboard            │
└──────────────┬──────────────────────────────┬──────────┘
               │  REST + JWT                  │
┌──────────────▼──────────────────────────────▼──────────┐
│               Django REST Framework API                 │
│  /api/auth/   /api/bottles/   /api/analytics/ …        │
└──────────────────────────┬─────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    └─────────────┘
```

**Why Django + React (not Next.js, not Firebase)?**
- Django gives instant admin panel, ORM migrations, and management commands (`seed_demo`) —
  critical for a hackathon demo that needs convincing data in minutes.
- React SPA means the admin dashboard and consumer app share one codebase and one build,
  served by the same Vite dev server or any static host.
- PostgreSQL because the analytics queries (window functions, GROUP BY region+day) need real SQL.

---

## Project Structure

```
botlback-tj/
├── backend/
│   ├── apps/
│   │   ├── users/      Custom User model — phone-based auth, no username
│   │   ├── bottles/    SKU catalogue + Bottle QR registry
│   │   ├── scans/      Scan events: purchase (+10) and recycle (+20)
│   │   ├── recycling/  RecyclingPoint locations shown on the map
│   │   ├── rewards/    Prize catalogue + Redemption records
│   │   └── analytics/  Aggregation views for the admin dashboard
│   └── botlback/       Django settings, URL conf, WSGI
└── frontend/
    └── src/
        ├── api/        TanStack Query hooks — one file per domain (auth, bottles, rewards…)
        ├── components/ Shared UI (AnimatedBottle, CocaColaShowcase, NumberRoll…)
        ├── lib/        Pure utilities: axios client, i18n setup, productImages, regions
        ├── pages/      Route components
        │   ├── admin/  Brand manager dashboard (6 pages)
        │   └── …       Consumer app (scan, wallet, rewards, map, impact, leaderboard…)
        ├── store/      Zustand auth store (JWT + user object)
        └── locales/    ru.json + tg.json translation strings
```

---

## Consumer App Flow

```
Landing → Register/Login → Scan QR (purchase +10 pts) → Wallet
                                ↓
                     Find recycling point on Map
                                ↓
                     Scan QR at point (recycle +20 pts)
                                ↓
                     Rewards → Redeem for Alif Mobi credit
```

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page — hero, how-it-works, social proof |
| `/login` | Phone + OTP auth (OTP = `1234` in dev) |
| `/scan` | Camera + manual QR input. State machine: `idle → has_rp/need_rp → processing` |
| `/scan/result` | Animated points counter, streak badge, achievement unlocks |
| `/wallet` | Balance, tier progress, activity feed, CTAs |
| `/rewards` | Prize grid — flip cards to redeem |
| `/impact` | Personal eco stats: CO₂, trees, phone charges |
| `/map` | Leaflet map of all recycling points with bottom-sheet list |
| `/leaderboard` | Regional + all-time ranking table |
| `/profile` | Language, region, logout |

### QR Scan State Machine (`ScanPage.tsx`)

```
idle
 ├─ scans a bottle QR   → need_rp   (ask user to go to a recycling point)
 ├─ scans a recycle QR  → has_rp    (ask user to bring a bottle)
 └─ when both bottle+point known → processing → POST /api/bottles/recycle/
```

Purchase scan (bottle QR alone) is handled via `POST /api/bottles/scan/` immediately.

---

## Admin Dashboard Flow

Brand managers log in as `is_staff=True` users. The `/admin/*` routes render `AdminLayout`.

| Route | Purpose |
|-------|---------|
| `/admin` | Overview KPIs — bottles, recycled, CO₂, active users |
| `/admin/scorecard` | Pilot ROI: recycling rate %, cost-per-recycle, ROI calculation |
| `/admin/geographic` | Map + bar chart — recycling by region |
| `/admin/timeseries` | Area chart — daily scans over time |
| `/admin/campaigns` | Create/manage marketing campaigns with budgets |
| `/admin/outlets` | CRUD for recycling point locations |
| `/admin/qrcodes` | Printable QR sheets for demo (bottles + recycling points) |
| `/admin/prizes` | Prize catalogue management |
| `/admin/redemptions` | Redemption history |
| `/admin/users` | User list with point adjustment |

---

## Backend Models

### `users.User`
Phone-based auth (no username). Stores streak, referral code, region, language.
`total_points` is a computed property: `SUM(scan points) - SUM(redemption points_spent)`.

### `bottles.SKU` + `bottles.Bottle`
SKU = product definition (brand, volume, package type).
Bottle = physical unit with unique QR. `is_scanned` / `is_recycled` flags prevent double-counting.

### `scans.Scan`
One row per event. `scan_type` ∈ {`purchase`, `recycle`, `referral_bonus`, `admin_adjustment`}.
`points_awarded` stored denormalized so analytics don't need to re-derive points rules.
Indexed on `(scan_type, created_at)` and `(user, scan_type)` for dashboard queries.

### `rewards.Prize` + `rewards.Redemption`
Prize has `points_cost` and `stock_quantity` (-1 = unlimited).
Redemption subtracts from user balance at claim time (checked in the view).

### `analytics` (views, no extra models)
Aggregation over `scans.Scan`. Returns JSON consumed by Recharts on the frontend.

---

## Key Design Decisions

### Phone auth + magic OTP
No email, no password managers. Tajik users are mobile-first; phone + OTP mirrors
local payment apps (Alif, Imon). OTP is hardcoded to `1234` in `DEBUG=True` for demo.

### JWT in localStorage (not cookies)
The app is served from a different origin than the API in dev. Cookies need `SameSite`
config and CORS headers; JWT in localStorage is simpler for a hackathon scope.

### TanStack Query for all server state
No Redux. Query + Zustand covers 100% of state needs:
- `useAuthStore` (Zustand) = JWT token + user profile (persisted to localStorage)
- Everything else = TanStack Query (server state, caching, invalidation)

### Framer Motion for every transition
The app is a hackathon demo — judges need to feel the quality immediately.
Page transitions, number rolls, confetti on scan success, flip cards in rewards —
all use Framer Motion. Performance cost is acceptable for a demo device.

### `ConsumerLayout` chrome hiding
Map and Scan pages need 100% viewport height (no header, no bottom nav).
`hideChrome = pathname.startsWith('/scan') || pathname === '/map'`
Both pages provide their own safe-area-aware header.

### Shared constants in `lib/regions.ts`
Region colors, names, and chart palette were duplicated across 6+ files.
Extracted to one source of truth — any color change now requires editing one line.

### Real product photos in `/public/products/`
JPEGs sourced from Open Food Facts (open-source product database, CC-BY-SA).
Wrapped in `rounded-xl overflow-hidden bg-white` containers — looks intentional
and doesn't require transparent PNG cutouts.

---

## Setup

### Prerequisites
- Python 3.11+, Node 18+, PostgreSQL 15+ running locally

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit DB_NAME / DB_USER / DB_PASSWORD

python manage.py migrate
python manage.py seed_demo    # seeds 150 users, 2000 bottles, 3500 scans
python manage.py runserver
```

Backend → **http://localhost:8000**
Django admin → **http://localhost:8000/admin/**

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Frontend → **https://localhost:5173** (self-signed SSL for camera access)

### Test on a real phone (same WiFi)

```bash
cd frontend && npm run dev -- --host
# then open https://192.168.x.x:5173 on your phone
# accept the self-signed cert warning
```

---

## Demo Accounts

| Role | Credentials |
|------|-------------|
| Admin (brand dashboard) | phone: `admin` / password: `Botlback2026!` |
| Demo consumer | phone: `+992900000001` / OTP: `1234` |

### Demo QR Codes (print or scan from screen)

| Code | Action |
|------|--------|
| `BTL-DEMO-0001` | Coca-Cola 0.5L — purchase scan (+10 pts) |
| `BTL-DEMO-0002` | Fanta 0.5L — purchase scan (+10 pts) |
| `BTL-DEMO-0003` | Sprite 1L — purchase scan (+10 pts) |
| `RP-DEMO-001` | Mehrgon Bazaar recycling point (+20 pts) |
| `RP-DS-002` | Dushanbe City recycling point (+20 pts) |

---

## API Reference

```
POST /api/auth/register/          name + phone → JWT tokens
POST /api/auth/login/             phone + OTP (1234) → JWT tokens
GET  /api/auth/me/                current user profile + points
PATCH /api/auth/profile/          update region, language

GET  /api/bottles/verify/:qr/     check bottle status before scanning
POST /api/bottles/scan/           register purchase → +10 pts
POST /api/bottles/recycle/        register recycle → +20 pts

GET  /api/recycling/points/       all recycling point locations

GET  /api/rewards/prizes/         prize catalogue
POST /api/rewards/redeem/         redeem prize (deducts points)

GET  /api/analytics/overview/     KPI summary (admin only)
GET  /api/analytics/timeseries/   daily scan counts (admin)
GET  /api/analytics/map/          geographic heatmap data (admin)
GET  /api/analytics/regions/      per-region breakdown (admin)
GET  /api/analytics/skus/         SKU performance (admin)
GET  /api/analytics/community/    aggregated community stats (public)
```

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Backend | Django 5 + DRF + simplejwt | Battle-tested, fast admin, seed commands |
| Database | PostgreSQL 15 | Analytics SQL (window functions, GROUP BY) |
| Frontend | Vite + React 18 + TypeScript | Fast HMR, strict types catch bugs early |
| Styling | Tailwind CSS | Rapid iteration, design tokens in config |
| Charts | Recharts | Composable, works with Framer Motion |
| Maps | Leaflet + react-leaflet | Offline-capable, lightweight vs Google Maps |
| Server state | TanStack Query v5 | Caching, background refetch, no Redux |
| Auth state | Zustand | Tiny, no boilerplate, persisted to localStorage |
| Animations | Framer Motion | Page transitions, number rolls, confetti |
| i18n | react-i18next | RU + TG with JSON files, no extra build step |
| Camera | html5-qrcode (low-level) | Full control over viewport — no injected UI |

---

*Built for the Coca-Cola İçecek Dushanbe Hackathon 2026.*
*See `DEMO_SCRIPT.md` for the 2-minute pitch flow.*
