#!/usr/bin/env bash
# BotlBack TJ — One-command demo starter
# Usage: bash start-demo.sh
set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo -e "${CYAN}"
echo "  ██████╗  ██████╗ ████████╗██╗     ██████╗  █████╗  ██████╗██╗  ██╗"
echo "  ██╔══██╗██╔═══██╗╚══██╔══╝██║     ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝"
echo "  ██████╔╝██║   ██║   ██║   ██║     ██████╔╝███████║██║     █████╔╝ "
echo "  ██╔══██╗██║   ██║   ██║   ██║     ██╔══██╗██╔══██║██║     ██╔═██╗ "
echo "  ██████╔╝╚██████╔╝   ██║   ███████╗██████╔╝██║  ██║╚██████╗██║  ██╗"
echo "  ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "  ${YELLOW}Hackathon Demo — Coca-Cola İçecek Tajikistan${NC}"
echo ""

# ── Step 1: PostgreSQL ─────────────────────────────────────────────────────
echo -e "${CYAN}[1/5] Starting PostgreSQL...${NC}"
docker-compose up -d db 2>/dev/null || docker compose up -d db
sleep 2
echo -e "${GREEN}      ✓ PostgreSQL ready${NC}"

# ── Step 2: Migrate ────────────────────────────────────────────────────────
echo -e "${CYAN}[2/5] Running migrations...${NC}"
cd "$ROOT/backend"
python manage.py migrate --no-input 2>&1 | grep -E "Apply|OK|No migrations" || true
echo -e "${GREEN}      ✓ Migrations done${NC}"

# ── Step 3: Seed demo data ─────────────────────────────────────────────────
echo -e "${CYAN}[3/5] Seeding demo data...${NC}"
python manage.py seed_demo 2>&1 | tail -6
echo -e "${GREEN}      ✓ Demo data ready${NC}"

# ── Step 4: Backend server ─────────────────────────────────────────────────
echo -e "${CYAN}[4/5] Starting Django API server...${NC}"
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
sleep 1
echo -e "${GREEN}      ✓ API: http://localhost:8000/api/${NC}"

# ── Step 5: Frontend ───────────────────────────────────────────────────────
echo -e "${CYAN}[5/5] Starting Vite frontend (HTTPS)...${NC}"
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
sleep 3

# ── Generate WiFi QR ───────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}  Generating WiFi access QR...${NC}"
cd "$ROOT"
python demo/wifi-qr.py 2>/dev/null || echo "  (install qrcode + pillow to generate QR)"

echo ""
echo -e "${GREEN}  ════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓  BotlBack TJ is LIVE!${NC}"
echo ""
echo -e "  ${YELLOW}Demo accounts:${NC}"
echo -e "  User:   ${CYAN}+992900000001${NC}  OTP: ${CYAN}1234${NC}  (247 pts, 23 recycled)"
echo -e "  Admin:  ${CYAN}admin${NC}          PWD: ${CYAN}Botlback2026!${NC}"
echo ""
echo -e "  ${YELLOW}Demo QR codes:${NC}"
echo -e "  Buy:     ${CYAN}BTL-DEMO-0001${NC} through ${CYAN}BTL-DEMO-0005${NC}"
echo -e "  Recycle: ${CYAN}RP-DEMO-001${NC}  (Базар Мехргон)"
echo ""
echo -e "  ${YELLOW}Open demo-access.png for WiFi QR${NC}"
echo -e "${GREEN}  ════════════════════════════════════════════${NC}"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
