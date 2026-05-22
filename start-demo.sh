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
PYEXEC="$ROOT/backend/venv/bin/python"
# Fallback to system python if venv doesn't exist yet
[ -x "$PYEXEC" ] || PYEXEC="python"

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
# Try Docker first, fall back to pg_ctlcluster (bare-metal / VM)
if docker info >/dev/null 2>&1 && [ -S /var/run/docker.sock ]; then
    docker compose -f "$ROOT/docker-compose.yml" up -d db
    sleep 3
    echo -e "${GREEN}      ✓ PostgreSQL ready (Docker)${NC}"
elif command -v pg_ctlcluster >/dev/null 2>&1; then
    PG_VER=$(pg_lsclusters -h | awk 'NR==1{print $1}')
    PG_CLUSTER=$(pg_lsclusters -h | awk 'NR==1{print $2}')
    PG_STATUS=$(pg_lsclusters -h | awk 'NR==1{print $4}')
    if [ "$PG_STATUS" != "online" ]; then
        sudo pg_ctlcluster "$PG_VER" "$PG_CLUSTER" start 2>/dev/null \
          || pg_ctlcluster "$PG_VER" "$PG_CLUSTER" start 2>/dev/null \
          || true
        sleep 2
    fi
    echo -e "${GREEN}      ✓ PostgreSQL ready (pg_ctlcluster ${PG_VER}/${PG_CLUSTER})${NC}"
else
    echo -e "${RED}      ✗ Cannot start PostgreSQL — install Docker or postgresql${NC}"
    exit 1
fi

# ── Step 2: Migrate ────────────────────────────────────────────────────────
echo -e "${CYAN}[2/5] Running migrations...${NC}"
cd "$ROOT/backend"
$PYEXEC manage.py migrate --no-input 2>&1 | grep -E "Apply|OK|No migrations" || true
echo -e "${GREEN}      ✓ Migrations done${NC}"

# ── Step 3: Seed demo data ─────────────────────────────────────────────────
echo -e "${CYAN}[3/5] Seeding demo data...${NC}"
$PYEXEC manage.py seed_demo 2>&1 | tail -6
echo -e "${GREEN}      ✓ Demo data ready${NC}"

# ── Step 4: Backend server ─────────────────────────────────────────────────
echo -e "${CYAN}[4/5] Starting Django API server...${NC}"
$PYEXEC manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
sleep 1
echo -e "${GREEN}      ✓ API: http://0.0.0.0:8000/api/${NC}"

# ── Step 5: Frontend ───────────────────────────────────────────────────────
echo -e "${CYAN}[5/5] Starting Vite frontend (HTTPS)...${NC}"
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
sleep 3

# ── Detect WiFi IP ─────────────────────────────────────────────────────────
WIFI_IP=""
# Try common tools in order
if command -v ip >/dev/null 2>&1; then
    WIFI_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src"){print $(i+1); exit}}')
fi
if [ -z "$WIFI_IP" ] && command -v ifconfig >/dev/null 2>&1; then
    WIFI_IP=$(ifconfig | awk '/inet /{print $2}' | grep -v "^127\." | head -1 | sed 's/addr://')
fi
if [ -z "$WIFI_IP" ] && [ -f /etc/hosts ]; then
    # Last resort: hostname -I
    WIFI_IP=$(hostname -I 2>/dev/null | awk '{print $1}') || true
fi

# ── Generate access QR ────────────────────────────────────────────────────
cd "$ROOT"
if [ -n "$WIFI_IP" ]; then
    $PYEXEC -c "
import sys
try:
    import qrcode
    url = 'https://${WIFI_IP}:5173'
    img = qrcode.make(url)
    img.save('demo-access.png')
    print('QR saved: demo-access.png  →  ' + url)
except ImportError:
    pass
" 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}  ════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓  BotlBack TJ is LIVE!${NC}"
echo ""
echo -e "  ${YELLOW}URLs:${NC}"
echo -e "  Local:   ${CYAN}https://localhost:5173${NC}"
if [ -n "$WIFI_IP" ]; then
echo -e "  Network: ${CYAN}https://${WIFI_IP}:5173${NC}  ← phones open this"
fi
echo ""
echo -e "  ${RED}⚠  HTTPS uses a self-signed cert.${NC}"
echo -e "  ${YELLOW}  On phone: tap 'Advanced' → 'Proceed anyway'${NC}"
echo ""
echo -e "  ${YELLOW}Demo accounts:${NC}"
echo -e "  User:   ${CYAN}+992900000001${NC}  OTP: ${CYAN}1234${NC}  (247 pts, 23 recycled)"
echo -e "  Admin:  ${CYAN}admin${NC}          PWD: ${CYAN}Botlback2026!${NC}"
echo ""
echo -e "  ${YELLOW}Demo QR codes:${NC}"
echo -e "  Buy:     ${CYAN}BTL-DEMO-0001${NC} → ${CYAN}BTL-DEMO-0005${NC}"
echo -e "  Recycle: ${CYAN}RP-DEMO-001${NC}  (Базар Мехргон)"
if [ -f "$ROOT/demo-access.png" ]; then
echo ""
echo -e "  ${YELLOW}  Open demo-access.png for phone QR code${NC}"
fi
echo -e "${GREEN}  ════════════════════════════════════════════════════${NC}"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
