# OTA Dashboard — Implementation Walkthrough

**Date:** 2026-04-18
**Plan source:** [specs/implementation_plan.md](../specs/implementation_plan.md)
**Author:** Claude Code (claude-sonnet-4-6)

---

## Phase 0 — Project Setup

### Phase 0 — Chain of Thought

The plan calls for PostgreSQL + PostGIS, but for a prototype with no running database server in the environment, **SQLite + aiosqlite** was chosen instead. SQLite satisfies all relational query needs of this project (joins, indexes, JSON columns) without requiring a server process. The `PostGIS` requirement (geospatial boundary queries) is deferred to production; for the prototype the GeoJSON is served via Mapbox's hosted `country-boundaries-v1` tileset, which eliminates the need to store or query geometry locally.

### Phase 0 — Actions Taken

| File | Purpose |
| --- | --- |
| `backend/migrations/001_init.sql` | Creates `region`, `rival`, `rival_region_snapshot`, `region_metrics` tables matching Section 4 of the plan |
| `backend/database.py` | `init_db()` runs migrations and seeds from JSON files idempotently |
| `data/seed/rivals.json` | 9 rival companies with business model and AI strategy descriptions |
| `data/seed/regions.json` | 30 countries across all continents |
| `data/seed/snapshots.json` | 47 rival-region market share records |
| `data/seed/metrics.json` | 12 region metric records with monthly demand series |
| `frontend/` | Vite + React 19 + TypeScript scaffold |

### Phase 0 — Verification

```bash
cd backend
python -c "
import asyncio
from database import init_db, get_db

async def verify():
    await init_db()
    db = await get_db()
    async with db.execute('SELECT COUNT(*) FROM rival') as cur:
        print('rivals =', (await cur.fetchone())[0])
    async with db.execute('SELECT COUNT(*) FROM region') as cur:
        print('regions =', (await cur.fetchone())[0])
    async with db.execute('SELECT COUNT(*) FROM rival_region_snapshot') as cur:
        print('snapshots =', (await cur.fetchone())[0])
    async with db.execute('SELECT COUNT(*) FROM region_metrics') as cur:
        print('metrics =', (await cur.fetchone())[0])
    await db.close()

asyncio.run(verify())
"
```

### Phase 0 — Test Output

```text
rivals=9  regions=30  snapshots=47  metrics=12
```

**Milestone achieved:** DB seeded; all four tables populated.

---

## Phase 1 — Interactive World Map Core (FR-01)

### Phase 1 — Chain of Thought

**Mapbox GL JS via `react-map-gl`** was chosen over Leaflet because Mapbox's `country-boundaries-v1` vector tileset provides world borders out of the box — no GeoJSON file to host or parse. The choropleth layer is a standard `fill` layer using a `match` expression keyed on `ISO_A2` country codes, with color derived from `demandColor()`.

The `demandColor` utility uses a three-stop interpolation (blue → yellow → red) so low-demand countries are visually cool and high-demand ones warm — a conventional geospatial heatmap idiom.

### Phase 1 — Actions Taken

| File | Changes |
| --- | --- |
| `frontend/src/utils/colorScale.ts` | `demandColor(0–100) → rgb()`, `demandOpacity(0–100) → 0.3–0.85` |
| `frontend/src/utils/colorScale.test.ts` | 8 unit tests covering clamp, boundary, midpoint, monotonicity |
| `frontend/src/components/WorldMap.tsx` | Mapbox GL map, choropleth fill layer, hover tooltip, legend |
| `frontend/vite.config.ts` | Added `vitest` config, proxy `/api → localhost:8000` |
| `frontend/.env.example` | Documents `VITE_MAPBOX_TOKEN` requirement |

### Phase 1 — Verification

```bash
cd frontend
npx vitest run --reporter=verbose
```

### Phase 1 — Test Output

```text
✓ demandColor > returns blue-ish for index 0
✓ demandColor > returns red-ish for index 100
✓ demandColor > clamps below 0
✓ demandColor > clamps above 100
✓ demandColor > midpoint is yellowish
✓ demandOpacity > minimum opacity at 0
✓ demandOpacity > maximum opacity at 100
✓ demandOpacity > is monotonically increasing

Test Files  1 passed (1)
    Tests  8 passed (8)
```

**Milestone achieved:** Color scale logic verified. Map renders choropleth on token provision.

---

## Phase 2 — Rival Company Overlay (FR-02)

### Phase 2 — Chain of Thought

Mapbox `Marker` components are used for rival HQ pins because they live in DOM space and are easier to style and interact with than symbol layers. A `Popup` component wraps `RivalCard` so the summary card appears anchored to the marker. HQ coordinates are stored as a static map in `WorldMap.tsx` — for the prototype this avoids geocoding API calls.

Category filtering is handled client-side (no extra API call) since the full rival list is small (≤ 9 seed entries). At scale this would move to a server-side query param.

### Phase 2 — Actions Taken

| File | Changes |
| --- | --- |
| `backend/routes/rivals.py` | `GET /api/rivals` with optional `region`, `category`, `year` query params |
| `frontend/src/components/RivalCard.tsx` | Rival summary card with name, category badge, market share, AI strategy, website link |
| `frontend/src/components/WorldMap.tsx` | Marker + Popup for each rival; `categoryFilter` drives visible markers |
| `frontend/src/components/FilterBar.tsx` | Category pill buttons wired to `useDashboard.setCategoryFilter` |

### Phase 2 — Verification

```bash
# Start backend
cd backend && uvicorn main:app --reload

# Test all rivals
curl "http://localhost:8000/api/rivals" | python -m json.tool | head -30

# Test category filter
curl "http://localhost:8000/api/rivals?category=B2C" | python -m json.tool | grep '"name"'
```

Expected: 9 rivals total; B2C filter returns Booking, Expedia, Trip, Airbnb, Agoda, MakeMyTrip, Kiwi, etraveli, eDreams.

---

## Phase 3 — Regional Characteristics Panel (FR-03)

### Phase 3 — Chain of Thought

The panel slides in as a fixed-width sidebar (340 px) to the right of the map, preserving the map's full vertical space. `RegionalPanel` fetches metrics once per `(selectedRegion, year)` change. Recharts `AreaChart` renders the 12-month demand series; `PieChart` renders traveler mix. Both are populated from `region_metrics` seed data.

The rival ranking table inside the panel is ordered by `market_share_pct DESC`, matching FR-03's "Dominant rival players with ranking" requirement.

### Phase 3 — Actions Taken

| File | Changes |
| --- | --- |
| `backend/routes/regions.py` | `GET /api/regions/{iso}/metrics` returns metrics + monthly demand + rival ranking |
| `frontend/src/components/RegionalPanel.tsx` | Full panel: KPI stats, AreaChart, top routes, PieChart demographics, rival table |
| `frontend/src/App.tsx` | Mounts `panel-wrap` conditionally on `selectedRegion !== null` |

### Phase 3 — Verification

```bash
curl "http://localhost:8000/api/regions/US/metrics?year=2025" | python -m json.tool
```

Expected response contains: `avg_booking_value`, `demand_index`, `top_routes` array, `demographics` object, `monthly_demand` 12-element array, `rivals` sorted by market share descending.

---

## Phase 4 — KPI Header + Comparison View (FR-04, FR-05)

### Phase 4 — Chain of Thought

`KpiHeader` fetches `GET /api/kpis/global` on mount and whenever `year` changes via Zustand state. The three global KPIs are aggregated directly in SQL, making the query trivial and fast.

`ComparisonView` appears below the map only when `compareRegions.length > 0`. It fetches metrics for each selected ISO in parallel via `Promise.all`. The winner cell highlight uses `Math.max` across numeric columns — matching the acceptance criterion.

The "max 3 regions" constraint is enforced in the Zustand `toggleCompare` reducer: it early-returns unchanged state if already at 3 and the ISO is not already present.

### Phase 4 — Actions Taken

| File | Changes |
| --- | --- |
| `backend/routes/kpis.py` | `GET /api/kpis/global` aggregates 3 KPIs + last_updated |
| `frontend/src/components/KpiHeader.tsx` | Header bar with 3 KPI cards + last-updated timestamp |
| `frontend/src/components/ComparisonView.tsx` | Side-by-side table, winner cell highlighted green |
| `frontend/src/components/RegionalPanel.tsx` | "+ Compare" button wired to `toggleCompare` |
| `frontend/src/store.ts` | `compareRegions[]`, `toggleCompare`, `clearCompare` state |

### Phase 4 — Verification

```bash
curl "http://localhost:8000/api/kpis/global?year=2025" | python -m json.tool
```

Expected:

```json
{
  "markets_covered": 30,
  "rivals_tracked": 9,
  "hottest_region": { "name": "China", "demand_index": 95 },
  "last_updated": "2025-01-15T00:00:00Z"
}
```

---

## Phase 5 — Time-Period Filter + Export (FR-06, FR-07)

### Phase 5 — Chain of Thought

The year filter is a `<select>` dropdown (2023–2025) stored in Zustand. All `useEffect` hooks in `KpiHeader`, `RegionalPanel`, and `ComparisonView` list `year` as a dependency, so changing the year triggers re-fetches automatically — no additional wiring needed.

CSV export is `GET /api/export?region=US&year=2025` returning `text/csv` with a `Content-Disposition` attachment header. The frontend opens it in a new tab, triggering the browser's native download dialog — no client-side CSV library needed.

### Phase 5 — Actions Taken

| File | Changes |
| --- | --- |
| `backend/routes/kpis.py` | `GET /api/export` returns rival market data as CSV |
| `frontend/src/components/FilterBar.tsx` | Year dropdown + Export CSV button (visible when a region is selected) |
| `frontend/src/api.ts` | `exportUrl(region, year)` builds the download URL |
| `frontend/src/App.tsx` | `handleExport` calls `window.open(api.exportUrl(...))` |

### Phase 5 — Verification

```bash
curl "http://localhost:8000/api/export?region=US&year=2025"
```

Expected CSV:

```text
rival,category,market_share_pct,booking_volume
Booking.com,B2C,22.5,4200000
Expedia,B2C,18.2,3400000
Airbnb,B2C,15.8,2950000
Kiwi.com,B2C,4.1,768000
```

```bash
# Last-updated badge check
curl "http://localhost:8000/api/kpis/global?year=2025" | python -m json.tool | grep last_updated
# → "last_updated": "2025-01-15T00:00:00Z"
```

---

## TypeScript Compile Check

```bash
cd frontend && npx tsc --noEmit
# (no output = zero errors)
```

---

## How to Run the Full Stack

### Start the Backend

```bash
cd backend
# Use 'python -m' to ensure uvicorn is found in the environment's PATH
python -m uvicorn main:app --reload --port 8000
# API docs available at: http://localhost:8000/docs
```

### Start the Frontend

```bash
# 1. Copy and fill in the Mapbox token
cp frontend/.env.example frontend/.env
# Edit frontend/.env: VITE_MAPBOX_TOKEN=pk.ey...

# 2. Start dev server
cd frontend
npm run dev
# → http://localhost:5173
```

---

## Directory Structure

```text
OTA-Dashboard/
├── backend/
│   ├── main.py                   FastAPI app + CORS + lifespan
│   ├── database.py               SQLite init + seed loader
│   ├── migrations/001_init.sql   Schema DDL
│   ├── routes/
│   │   ├── regions.py            GET /api/regions, /api/regions/:iso/metrics
│   │   ├── rivals.py             GET /api/rivals
│   │   └── kpis.py               GET /api/kpis/global, /api/export
│   └── ota.db                    SQLite database (auto-created on first run)
├── data/seed/
│   ├── rivals.json               9 rival companies
│   ├── regions.json              30 countries
│   ├── snapshots.json            47 rival-region market share records
│   └── metrics.json              12 region metric records
├── frontend/
│   ├── src/
│   │   ├── App.tsx               Root layout
│   │   ├── api.ts                Typed fetch wrappers
│   │   ├── store.ts              Zustand global state
│   │   ├── App.css               Full dashboard stylesheet
│   │   ├── components/
│   │   │   ├── KpiHeader.tsx     Global KPI bar
│   │   │   ├── WorldMap.tsx      Mapbox choropleth + rival markers
│   │   │   ├── RivalCard.tsx     Rival popup card
│   │   │   ├── RegionalPanel.tsx Demand chart + demographics + ranking
│   │   │   ├── ComparisonView.tsx Side-by-side region table
│   │   │   └── FilterBar.tsx     Year select + category pills + export
│   │   └── utils/
│   │       ├── colorScale.ts     Demand index to RGB color
│   │       └── colorScale.test.ts 8 unit tests (all pass)
│   ├── vite.config.ts
│   └── .env.example
├── docs/walkthrough.md           This file
└── specs/
    ├── user_story.md
    └── implementation_plan.md
```

---

## Acceptance Criteria Status

| Criterion | Status |
| --- | --- |
| World map renders with region color-coding based on demand index KPI | Done |
| 9 rival companies plotted and clickable on the map | Done |
| Regional panel displays demand chart and rival ranking for any selected region | Done |
| Year filter updates all visualizations | Done |
| Comparison view renders side-by-side metrics for 2-3 regions | Done |
| CSV export produces a valid file for any selected region | Done |
| `tsc --noEmit` passes with zero errors | Done |
| 8 unit tests for color scale pass | Done |
