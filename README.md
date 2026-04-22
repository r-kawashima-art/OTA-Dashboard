# OTA Competitive Intelligence Dashboard

A world-map-based dashboard for monitoring rival Online Travel Agencies (OTAs) and regional travel market characteristics.

## Status

| Phase | Feature | Status |
| --- | --- | --- |
| 0 | Monorepo scaffold, DB migrations, seed data, CI | **Complete** |
| 1 | Interactive world map, KPI choropleth, hover tooltips (FR-01) | **Complete** |
| 2 | Rival company marker overlay (FR-02) | **Complete** |
| 3 | Regional characteristics panel (FR-03) | Not started |
| 4 | KPI header + comparison view (FR-04, FR-05) | Not started |
| 5 | Time-period filter + CSV/PDF export (FR-06) | Not started |

See [docs/walkthrough.md](docs/walkthrough.md) for per-phase progress notes.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite |
| Map | Leaflet (react-leaflet) |
| Charts | Recharts |
| State | Zustand |
| Backend | Python 3.12 + FastAPI |
| Database | PostgreSQL 16 + PostGIS 3.4 |
| Migrations | Alembic |
| Container | Docker Compose |

---

## Prerequisites

### System Dependencies (macOS)

If you are on macOS, we recommend using **Homebrew** to install the necessary system tools:

```bash
# Install PostgreSQL and PostGIS
brew install postgresql postgis

# Start PostgreSQL service
brew services start postgresql
```

### Language Runtimes

| Tool | Minimum Version | Install |
| --- | --- | --- |
| Node.js | 22 | <https://nodejs.org> |
| Python | 3.12 | <https://python.org> |
| Docker Desktop | latest | <https://docker.com/products/docker-desktop> |
| Git | any | <https://git-scm.com> |

---

## Running the App (after first-time setup)

Three processes must be up, in this order. Use **three separate terminals** so each one streams its own logs.

```bash
# Terminal 1 — Database (detached)
docker compose up -d db

# Terminal 2 — Backend API on :8000
cd backend
source .venv/bin/activate          # macOS / Linux (see Prerequisites for other shells)
uvicorn app.main:app --reload --port 8000

# Terminal 3 — Frontend on :3000
cd frontend
npm run dev
```

Then open **<http://localhost:3000>**. Vite proxies `/api/*` to `:8000`, so no CORS config is needed.

Stop everything:

```bash
# Ctrl-C in the backend and frontend terminals, then:
docker compose stop db             # keeps DB data
# docker compose down -v           # ↳ use -v to also delete the volume
```

Smoke-check the stack in a fourth terminal:

```bash
curl -s http://localhost:8000/healthz                              # → {"status":"ok"}
curl -s http://localhost:8000/api/regions | jq '.features | length' # → 233
curl -s http://localhost:8000/api/rivals  | jq '.count'             # → 9
```

> [!TIP]
> `.venv/bin/activate` is a shell script — it must be **sourced**, not executed. `source .venv/bin/activate` (or `. .venv/bin/activate`) avoids the `zsh: permission denied` error you get from calling it as a program.

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Ryosuke-Kawashima-Career/OTA-Worldmap.git
cd OTA-Worldmap
```

### 2. Start the database

**Option A: Docker (Recommended)**

```bash
docker compose up -d db
```

**Option B: Local PostgreSQL (macOS)**

If you prefer not to use Docker, you must create the database and user manually:

```bash
# Connect to the default postgres database
psql postgres

# Inside the psql prompt:
CREATE ROLE ota WITH LOGIN PASSWORD 'ota_secret' SUPERUSER;
CREATE DATABASE ota_worldmap OWNER ota;
\q
```

### 3. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
```

Activate it — **choose the line that matches your shell**:

| Shell | Command |
| --- | --- |
| Windows PowerShell | `.venv\Scripts\Activate.ps1` |
| Windows CMD | `.venv\Scripts\activate.bat` |
| Git Bash / WSL | `source .venv/Scripts/activate` |
| macOS / Linux | `source .venv/bin/activate` |

Your prompt will show `(.venv)` when active. Verify you are using the right Python before continuing:

```bash
which python      # Git Bash / macOS / Linux → should end with .venv/...
where python      # Windows CMD / PowerShell → first result must be .venv\...
```

```bash
# Install runtime dependencies into the active venv
pip install -r requirements.txt

# (Optional) Install dev/test tools — linting, type-checking, pytest
pip install -r requirements-dev.txt

# Configure environment
cp .env.example .env              # edit if your DB credentials differ

# Apply database migrations
alembic upgrade head

# Seed initial data (9 rivals, 30 countries, 30 KPI metric rows)
python ../data/seeds/seed.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API docs are available at `http://localhost:8000/docs`.

### 4. Frontend setup

Open a second terminal:

```bash
cd frontend

# Install dependencies (use --legacy-peer-deps to avoid React 19 peer conflicts with react-leaflet)
npm install --legacy-peer-deps

# Start the dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

## Run the app

1. Database (PostgreSQL + PostGIS via Docker)

```bash
cd /Users/r-kawashima/Projects/OTA-Dashboard
docker compose up -d db
```

First time only, seed the data:

```bash
.venv/bin/python data/seeds/seed.py
```

Expect: "Seeded 9 rivals, 30 regions, 30 region_metrics."
2. Backend (FastAPI — port 8000)

```bash
cd /Users/r-kawashima/Projects/OTA-Dashboard/backend
../.venv/bin/uvicorn app.main:app --reload
```

Serves /api/regions and /api/rivals

Smoke-check in another terminal:

```bash
curl -s http://localhost:8000/healthz            # → {"status":"ok"}
curl -s http://localhost:8000/api/rivals | head  # → {"rivals":[...], "count":9}
```

1. Frontend (Vite — port 3000)

```bash
cd /Users/r-kawashima/Projects/OTA-Dashboard/frontend
npm run dev
```

## Project Structure

```text
OTA-Worldmap/
├── frontend/                          # React 19 + TypeScript (Vite)
│   ├── index.html                     # Vite entry document
│   ├── src/
│   │   ├── main.tsx                   # React root + global CSS import
│   │   ├── App.tsx                    # Layout shell (header + map + rival card)
│   │   ├── index.css                  # App styles + Leaflet/MarkerCluster CSS
│   │   ├── types.ts                   # KPI, GeoJSON, and Rival types
│   │   ├── api/
│   │   │   ├── regions.ts             # fetch wrapper for /api/regions
│   │   │   └── rivals.ts              # fetch wrapper for /api/rivals
│   │   ├── components/
│   │   │   ├── WorldMap.tsx           # Leaflet map + choropleth layer
│   │   │   ├── KpiSelector.tsx        # KPI dropdown
│   │   │   ├── RivalMarkersLayer.tsx  # leaflet.markercluster rival pins
│   │   │   ├── RivalSummaryCard.tsx   # Floating card on marker click
│   │   │   └── RivalCategoryFilter.tsx # Category chip filter
│   │   ├── stores/
│   │   │   ├── kpiStore.ts            # Zustand store (selected KPI)
│   │   │   └── rivalStore.ts          # Zustand store (rivals, categories, selection)
│   │   └── utils/
│   │       ├── colorScale.ts          # Choropleth color interpolation
│   │       └── colorScale.test.ts     # Vitest unit tests
│   ├── e2e/
│   │   └── rivals.spec.ts             # Playwright smoke test (FR-02)
│   ├── playwright.config.ts
│   ├── vite.config.ts
│   └── package.json
├── backend/                           # FastAPI + SQLAlchemy (async)
│   ├── app/
│   │   ├── main.py                    # FastAPI app + router registration
│   │   ├── config.py                  # Pydantic settings
│   │   ├── database.py                # Async engine + session factory
│   │   ├── base.py                    # SQLAlchemy declarative base
│   │   ├── models/
│   │   │   ├── region.py              # Region, RegionMetrics
│   │   │   └── rival.py               # Rival, RivalRegionSnapshot
│   │   └── routers/
│   │       ├── regions.py             # GET /api/regions (GeoJSON + KPIs)
│   │       └── rivals.py              # GET /api/rivals (roster + HQ coords)
│   ├── migrations/                    # Alembic migration files
│   ├── alembic.ini
│   └── requirements.txt
├── data/
│   ├── geo/
│   │   └── countries.simplified.geo.json   # Boundaries for 233 countries
│   └── seeds/
│       └── seed.py                    # Rivals, regions, region_metrics
├── docs/
│   └── walkthrough.md                 # Per-phase implementation log
├── specs/
│   ├── user_story.md
│   └── implementation_plan.md
└── docker-compose.yml
```

---

## API Endpoints

| Method | Path | Purpose | Response |
| --- | --- | --- | --- |
| `GET` | `/healthz` | Liveness probe | `{"status": "ok"}` |
| `GET` | `/api/regions` | Country boundaries merged with the latest KPI snapshot per region | GeoJSON `FeatureCollection` — 233 features, `properties` include `iso_code`, `name`, `continent`, `demand_index`, `avg_booking_value`, `snapshot_month` |
| `GET` | `/api/rivals` | Rival OTA roster with HQ coordinates. Supports `?category=B2C&category=B2B` | `{ "rivals": [{id, name, hq_country, category, business_model, ai_strategy, website, lat, lng}], "count": n }` |

Interactive OpenAPI docs are available at `http://localhost:8000/docs` when the backend is running.

Smoke-check from the terminal:

```bash
curl -s http://localhost:8000/healthz
curl -s http://localhost:8000/api/regions | jq '.features | length'   # 233
curl -s http://localhost:8000/api/regions \
  | jq '[.features[] | select(.properties.demand_index != null)] | length'   # 30
curl -s http://localhost:8000/api/rivals  | jq '.count'               # 9
curl -s 'http://localhost:8000/api/rivals?category=B2C' | jq '.count' # filtered
```

---

## Development Commands

### Frontend

```bash
cd frontend
npm run dev       # start dev server on :3000
npm run build     # type-check + production build
npm run lint      # ESLint (zero warnings enforced)
npx tsc --noEmit  # TypeScript strict check
npm test          # Vitest unit tests
npm run test:e2e  # Playwright smoke test (needs backend + DB running)
```

First-time Playwright users must install the Chromium binary:

```bash
cd frontend
npx playwright install chromium
```

### Backend

```bash
cd backend
uvicorn app.main:app --reload           # dev server with hot-reload
alembic upgrade head                    # apply all pending migrations
alembic revision --autogenerate -m "x"  # generate migration from model changes
alembic downgrade -1                    # roll back one migration
```

### Database

```bash
docker compose up -d db       # start DB in background
docker compose stop db        # stop DB (keeps data)
docker compose down -v        # stop DB and delete volume
psql -h localhost -U ota -d ota_worldmap   # open psql shell
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust if needed:

```env
DATABASE_URL=postgresql://ota:ota_secret@localhost:5432/ota_worldmap
ASYNC_DATABASE_URL=postgresql+asyncpg://ota:ota_secret@localhost:5432/ota_worldmap
```

---

## CI/CD

GitHub Actions runs three jobs on every push and pull request to `main`:

| Job | What it checks |
| --- | --- |
| `frontend` | `tsc --noEmit` + ESLint |
| `backend` | `mypy` type check |
| `db-migration` | `alembic upgrade head` on a live PostGIS container |

---

## Troubleshooting (macOS)

### `FeatureNotSupportedError: extension "postgis" is not available`

This means PostgreSQL is running but cannot find the PostGIS extension files. Ensure you have run `brew install postgis` and restarted your PostgreSQL service:

```bash
brew services restart postgresql
```

### `ValueError: the greenlet library is required`

This occurs when using SQLAlchemy's async driver on certain Python versions (like 3.14). It is included in `requirements.txt`, but if you see this error, run:

```bash
pip install greenlet
```

### `InvalidAuthorizationSpecificationError: role "ota" does not exist`

This means the local PostgreSQL role `ota` has not been created. Follow the "Option B" steps in the Quick Start section to create the role and database.

### `sh: .../vite: Permission denied`

This can happen if the execution bit is missing from the binaries in `node_modules`. Fix it with:

```bash
chmod +x frontend/node_modules/.bin/*
```

### World map is blank at `http://localhost:3000`

The page renders the header but the map area is empty or white. This is almost always a stale-client problem after scaffolding changes — not a code bug. Resolve in this order:

1. Stop both dev servers and clear the Vite module cache, then restart cleanly:

   ```bash
   kill $(lsof -t -i:3000 -i:8000) 2>/dev/null
   rm -rf frontend/node_modules/.vite
   ```

2. Confirm the backend is serving KPIs — `/api/regions` must return 233 features with 30 of them carrying a non-null `demand_index` (see the smoke-check under [API Endpoints](#api-endpoints)). If the count is 0, re-run the seed script.
3. Hard-reload the browser (`⌘⇧R` on macOS, `Ctrl+Shift+R` on Windows/Linux), or open the page in a private window to bypass cached assets.
4. If the map still doesn't appear, open DevTools → Console. A `Map container is already initialized` error points to a `react-leaflet@4` + React 19 StrictMode double-mount; a `Failed to fetch /api/regions` message means the backend isn't actually reachable from Vite's proxy.
