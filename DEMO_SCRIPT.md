# BotlBack TJ — Hackathon Demo Script
### Coca-Cola İçecek Tajikistan · 2026

---

## Before the Presentation (15 min before)

```bash
# 1. Start everything with one command
bash start-demo.sh

# 2. Open demo-access.png — put it on projector / second screen
# 3. Open two browser tabs:
#    Tab 1: https://localhost:5173          ← consumer app
#    Tab 2: https://localhost:5173/admin    ← brand dashboard
# 4. Log in Tab 1: phone +992900000001  OTP 1234
# 5. Log in Tab 2: username admin  password Botlback2026!
# 6. Laptop plugged in, phone on silent
```

---

## The Hook (30 seconds)

> "Tajikistan sells over 200 million plastic bottles per year.
> Less than 15% are recycled.
> The main reason is simple — there's no incentive.
>
> BotlBack gives every Coca-Cola buyer a reason to recycle:
> loyalty points they can spend on real rewards.
> And it gives Coca-Cola real-time data to prove it's working."

---

## Live Demo (7 minutes)

### Scene 1 — Consumer buys a bottle (1:30)

**On phone or laptop Tab 1:**

1. Show the home screen — "Clean, fast, works on any phone"
2. Tap **Scan** → camera opens with the animated red scanning frame
3. Tap **Enter code manually** → type `BTL-DEMO-0001` → Submit
4. Watch the **+10 points** counter animation and confetti explosion
5. Navigate to **Wallet** — show:
   - 257 points total (247 + 10)
   - Streak counter
   - Transaction history

> *"Every purchase is registered. The QR on each bottle is unique —
> once someone scans it, nobody else can claim those points."*

---

### Scene 2 — Consumer recycles (1:30)

1. Tap **Scan** again
2. Enter `BTL-DEMO-0001` → app detects it was already purchased
3. **Orange banner** appears: *"Ready to recycle — now scan the recycling bin QR"*
4. Enter `RP-DEMO-001`
5. Watch **+20 points** + green CO₂ badge appear

> *"The system requires both the bottle QR and the bin QR.
> This proves the bottle was physically deposited at an official recycling point.
> Can't fake it remotely."*

---

### Scene 3 — Rewards (1:00)

1. Tap **Rewards** tab
2. Show prize grid: Alif Mobi credit, Coca-Cola merch, partner discounts
3. Tap **Alif Mobi 5 сомони** (costs 150 pts, user has 277)
4. Tap **Redeem** → success modal

> *"Points become real money. Alif Mobi is the #1 mobile wallet in Tajikistan —
> this is a reward people actually want."*

---

### Scene 4 — Leaderboard (30 sec)

1. Open **Leaderboard** tab
2. Show anonymized names ("Aziz K.", "Farrukh T.") — *"privacy protected"*
3. Switch the region filter — show Dushanbe vs Sughd breakdown

> *"Social competition drives repeat behaviour.
> Top recyclers get featured and earn bonus points."*

---

### Scene 5 — Brand Dashboard (2:30)

**Switch to Tab 2 (admin at /admin)**

**Overview page:**
- 4 live KPI cards: bottles today, active users, recycling rate %, CO₂ saved
- Live feed on the right — real scans rolling in every 8 seconds
- *"This is what the Coca-Cola field team sees in real time"*

**Geographic page:**
- Full Tajikistan map with coloured heatmap bubbles
- Click **Dushanbe** filter pill — map focuses on capital
- Side panel: recycling rate per region with colour-coded badges
- Bar chart: *"Dushanbe at 65%, GBAO at 25% — these are the field team's targets"*

**Timeseries page:**
- Point to the spike at 18:30 — *"This is Iftar time. People recycle after breaking fast."*
- *"We can schedule push notifications at 18:20 for maximum conversion"*

**Campaigns page:**
- Show Nowruz 2026 card with progress ring at 34%
- Days remaining, ROI estimate, bottles tracked
- Click **Create campaign** → fill in a name → save — *"live in seconds"*

> *"One dashboard. Every bottle tracked from factory shelf to recycling bin.
> Per SKU, per region, per hour."*

---

### Scene 6 — Audience Tries It (1:00)

**Put demo-access.png on the projector (the WiFi QR)**

> *"Scan this QR, open the app on your phone, and try it yourself.
> Phone number: +992 900 000 001 — OTP is 1234.*
>
> *If you see an HTTPS warning, tap Advanced → Proceed.
> It's a local certificate — completely safe on this network."*

Walk around. Let people scan and earn points live.

---

## Closing (30 seconds)

> *"BotlBack is production-ready.
>
> We need three things for the 90-day pilot:
> Three recycling points in Dushanbe with QR stickers on the bins,
> 500 bottles with unique QR labels from the next batch,
> and two months.
>
> Our target: take Dushanbe recycling rate from 15% to 35%.
> That is 5 million fewer plastic bottles in landfills every year.
>
> Thank you."*

---

## Q&A Cheat Sheet

| Question | Answer |
|----------|--------|
| "What prevents fake QR codes?" | Every bottle QR is pre-registered in our database before the bottle leaves the factory. Unknown codes return 404. |
| "Can two people scan the same bottle for purchase?" | No — a database lock (`select_for_update`) ensures the first scan wins and the flag is set atomically. Identical to how concert tickets work. |
| "Can someone fake being at a recycling point?" | You need the physical bin's QR code. The bin's GPS coordinates are also stored and can trigger a location check. |
| "How do you print unique QRs on millions of bottles?" | Same process as under-cap promo codes — factory generates serials during bottling and loads them to the DB. Standard Coca-Cola practice globally. |
| "Does Coca-Cola already have a loyalty app?" | BotlBack exposes a REST API — it plugs into any existing app, or runs standalone as shown. |
| "GDPR / data compliance?" | Minimal data: phone number only. No name required. Location only recorded at scan time with user consent. |
| "Unit cost?" | QR printing: ~0.02 somoni per bottle. Reward cost: ~0.5 somoni per recycled bottle at current rates. Fully offset by PR value and consumer data. |
| "What if there's no internet at the recycling point?" | Points are queued locally in the app and synced when connectivity returns (PWA + service worker). |

---

## Demo Codes Reference

| Code | Type | Description |
|------|------|-------------|
| `BTL-DEMO-0001` | Bottle — Coca-Cola 0.5L | Use first to buy, then to recycle |
| `BTL-DEMO-0002` | Bottle — Fanta 0.5L | Fresh, not yet purchased |
| `BTL-DEMO-0003` | Bottle — Sprite 1L | Fresh |
| `BTL-DEMO-0004` | Bottle — Bonaqua 0.5L | Fresh |
| `BTL-DEMO-0005` | Bottle — Fuse Tea 0.5L | Fresh |
| `RP-DEMO-001` | Recycling point — Базар Мехргон | Main demo recycling bin |
| `RP-DS-002` | Recycling point — Душанбе Сити | Secondary bin |

**Full recycle demo sequence (manual mode):**
```
Enter: BTL-DEMO-0002  →  +10 pts (purchase)
Enter: BTL-DEMO-0002  →  orange banner appears
Enter: RP-DEMO-001    →  +20 pts (recycle) + CO₂ badge
```

---

## Backup Plan (if WiFi fails)

Everything runs 100% offline on the presenter's laptop:

1. Mirror laptop screen to projector
2. Use `https://localhost:5173` directly in browser
3. Camera scanning works on `localhost` without HTTPS warnings
4. All demo codes work with no internet
5. Admin dashboard is fully populated with seeded data

---

## Startup Reference

```bash
# Everything at once
bash start-demo.sh

# Manual steps
docker-compose up -d db
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 0.0.0.0:8000 &
cd ../frontend && npm run dev

# Regenerate WiFi QR only
python demo/wifi-qr.py

# Reset and re-seed fresh demo data
cd backend && python manage.py seed_demo --reset
```

---

## Network Architecture (why WiFi works)

```
Audience phone
  └─ https://192.168.X.X:5173  ←── Vite dev server (host: true)
       └─ /api/* proxy           ←── Vite proxies to localhost:8000
            └─ Django API        ←── Running on presenter's laptop
                 └─ PostgreSQL   ←── Docker container, local
```

The Vite proxy runs on the laptop, so all Django API calls use
`localhost:8000` regardless of which device the user is on.
No firewall rules needed. No port forwarding needed.
