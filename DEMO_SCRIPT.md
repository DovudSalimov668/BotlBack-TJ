# BotlBack TJ — 2-Minute Demo Script

## Pre-Demo Checklist (do before going on stage)

- [ ] Backend running: `python manage.py runserver` (port 8000)
- [ ] Frontend running: `npm run dev -- --host` (port 5173)
- [ ] Phone on same WiFi, opened to http://192.168.x.x:5173
- [ ] Logged into demo account: +992900000001 / OTP 1234
- [ ] Admin tab open: http://localhost:5173/admin → admin / Botlback2026!
- [ ] QR codes printed: BTL-DEMO-0001, BTL-DEMO-0002, RP-DEMO-001
- [ ] Projector resolution: 1920×1080 ✓

---

## Script

### [0:00–0:20] THE HOOK

> "Coca-Cola has committed to recycling 75% of all bottles by 2035.
> In Tajikistan, they currently collect ZERO data on what actually gets recycled.
> Zero. No tracking. No measurement. No proof.
> Today, I fix that."

*[Click: show BotlBack landing screen on projector]*

---

### [0:20–0:40] THE PRECEDENT

> "In November 2022, Team Dori won THIS hackathon with a recycling behavior-change app.
> Same judges. Same proven category. Same need.
> BotlBack takes their insight and connects it to real, physical bottles — at scale."

---

### [0:40–1:20] THE LIVE DEMO

*[Hold up phone with BotlBack open. Hold up printed QR: BTL-DEMO-0001]*

> "Every Coca-Cola bottle gets a unique QR code. Consumer scans it when they buy—"

*[Scan BTL-DEMO-0001 on phone → confetti animation fires → "+10 очков!"]*

> "—ten points, instantly. Now they walk to this recycling drop point—"

*[Scan RP-DEMO-001]*

> "—twenty MORE points. 'You saved 0.082 kg of CO₂.'"

*[Switch to laptop — show /admin dashboard on projector]*

> "And right now, the CCI Tajikistan team sees this:"
> - "2,341 bottles tracked today"
> - "Recycling peaks at 6:47 PM — exactly Iftar"
> - "Sughd region: 40% behind Dushanbe. That's RC Cola territory."
> "Now you know. For the first time, ever."

*[Click to Geographic page — heatmap of Tajikistan]*
> "Dushanbe glows. Khujand barely registers. That's your field rep deployment map."

---

### [1:20–1:45] THE BUSINESS CASE

> "CCI ships 80 million bottles per year through 8,000+ Tajik sales points.
>
> BotlBack delivers three things CCI cannot buy anywhere else right now:
>
> **One:** Real World Without Waste MRV data — measurement, reporting, verification.
> The data you need for your 2035 sustainability targets.
>
> **Two:** A consumer loyalty database. Right now CCI Tajikistan has 12,000 Instagram followers.
> BotlBack builds a first-party database of verified buyers.
>
> **Three:** Regional behavior intelligence. Which districts are recycling? Which need a rep?
>
> Cost per bottle tracked: less than one US cent."

---

### [1:45–2:00] THE ASK

> "I'm not asking for a full rollout.
>
> I'm asking for a **90-day pilot**.
> **100,000 bottles.** Nowruz 2027.
> One champion inside CCI Tajikistan.
>
> That's all I need."

*[Show final slide: big QR code → judges scan → opens BotlBack live]*

> "Scan this now. You just became a BotlBack user."

---

## Backup: If Demo Fails

1. Open pre-recorded screen recording: `/demo/backup-demo.mp4`
2. Narrate over it: "Let me show you the recorded version—"
3. Keep energy up; the data story is the pitch, not the live scan

## Backup QR codes

If BTL-DEMO-0001 already scanned (409 error):
→ Use BTL-DEMO-0002 (Fanta — also pre-seeded, never scanned)

If camera doesn't work on stage:
→ Type QR code manually in debug mode via Django admin → Scan form

---

## Key Numbers to Remember

| Stat | Value |
|------|-------|
| Bottles per year (CCI TJ) | ~80 million |
| Sales points | 8,000+ |
| Current digital footprint | 12K Instagram followers |
| CO₂ per bottle recycled | 0.082 kg |
| Points: purchase | +10 |
| Points: recycle | +20 |
| Cost per bottle tracked | <$0.001 |
| Pilot ask | 100K bottles, 90 days |
| Launch target | Nowruz 2027 (March 21) |
