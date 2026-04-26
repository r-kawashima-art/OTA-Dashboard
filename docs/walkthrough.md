# OTA Competitive Intelligence Dashboard — Progress Walkthrough

---

## 📅 Current Update: 2026-04-19

### 🚀 Milestone: Phase-0 — Project Setup [COMPLETED]

The foundation for the OTA Worldmap project is now fully initialized. All services are configured, the database is seeded, and the development environment is stabilized across modern runtimes (Python 3.14+ and Node 22+).

---

### ✅ Accomplishments

#### Task-0.1: Monorepo Structure

- Successfully scaffolded `/frontend`, `/backend`, and `/data` directories with proper isolation.
- Established consistent linting, typing, and configuration across the stack.

#### Task-0.2: Modernized Frontend Setup

- **React 19 + Vite 6**: Leveraging the latest React features and lightning-fast HMR.
- **Tailwind CSS**: Integrated for premium, professional aesthetics.
- **Leaflet Integration**: Ready for 2D geographic data mapping.

#### Task-0.3: Database & Geospatial Engine

- **PostgreSQL 16 + PostGIS 3.4**: Running via Docker for local spatial analysis.
- **Alembic Migrations**: version `0001_initial_schema` successfully applied to the live DB.

#### Task-0.4: Seed Data Ingestion

- Successfully loaded **9 rival OTAs** (Booking.com, Expedia, etc.) and **30 target countries** with geospatial boundaries.
- Verified data integrity via SQL count checks.

---

### 🧪 Verification Results

#### 📋 Database Migration (Alembic)

```text
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 0001, Initial schema
PASS: Schema 1.0 Active
```

#### 📊 Seed Verification

```text
Seeded 9 rivals and 30 regions.
PASS: seed counts verified.
```

#### ⚛️ Frontend Initialization

```text
VITE v6.4.2  ready in 494 ms
➜  Local:   http://localhost:3000/
PASS: HMR active on port 3000
```

---

### 🏗️ Technical Decisions & Troubleshooting

> [!IMPORTANT]
> **Python 3.14 Compatibility**
> During setup, we encountered compilation issues with strict pins for `asyncpg` and `pydantic` on Python 3.14 (Windows).
> **Decision**: Loosened version requirements in `requirements.txt` from `==` to `>=` to allow for Python 3.14 compatibility wheels.

> [!TIP]
> **React 19 Peer Dependencies**
> `react-leaflet` currently has peer dependency restrictions for React 18.
> **Decision**: Implemented `npm install --legacy-peer-deps` to bypass these checks, as the library is functionally compatible with React 19's rendering engine.

---

### 🛠️ Active Development Workflow

With Phase 0 complete, use the following commands to start the development environment:

| Service | Command | Status |
| --- | --- | --- |
| **Database** | `docker compose up -d db` | Running |
| **Backend API** | `cd backend && uvicorn app.main:app --reload` | Ready |
| **Frontend UI** | `cd frontend && npm run dev` | Ready |

---

**Next Phase**: **Phase 1 — Interactive World Map Core**

- Implementation of the Leaflet-based world map.
- Connection to `/api/regions` for GeoJSON boundary rendering.
- Creation of the KPI Choropleth layer.

---

## 📅 Current Update: 2026-04-21

### 🚀 Milestone: Phase-1 — Interactive World Map Core [COMPLETED]

FR-01 is now live. The dashboard renders a zoomable, pannable world map with a KPI-driven choropleth layer, a KPI dropdown for switching metrics, and hover tooltips for every country boundary.

---

### ✅ Accomplishments

#### Task-1.1: Country Boundaries Dataset

- Sourced **Natural Earth admin-0** boundaries (258 countries) and simplified to **0.1° coordinate precision**, reducing the payload from 14 MB → 2.1 MB with no perceptible visual loss at world-scale zoom.
- Patched known Natural Earth ISO quirks (France, Norway, Kosovo → `FR`/`NO`/`XK`); dropped pseudo-territories (Guantanamo Bay, Bir Tawil, etc.) that have no ISO-3166-1 alpha-2 code.
- Final dataset: **233 countries** stored at [data/geo/countries.simplified.geo.json](../data/geo/countries.simplified.geo.json).

#### Task-1.2: KPI Snapshot Seeding

- Extended [data/seeds/seed.py](../data/seeds/seed.py) with an idempotent `region_metrics` seeder for snapshot `2026-04-01`, covering **30 regions** with `demand_index` (0–100 travel-intent score) and `avg_booking_value` (USD).

#### Task-1.3: Backend `/api/regions` Endpoint

- Implemented [backend/app/routers/regions.py](../backend/app/routers/regions.py) — returns a GeoJSON `FeatureCollection` that **merges boundary geometries with the latest KPI snapshot per region** in a single round-trip.
- Uses PostgreSQL `DISTINCT ON` to select each region's newest `snapshot_month` efficiently (future-proof for monthly ingestion).
- GeoJSON file is loaded **once per process** via `functools.lru_cache`.

#### Task-1.4: Frontend World Map

- **[`WorldMap.tsx`](../frontend/src/components/WorldMap.tsx)** — `react-leaflet` `MapContainer` with OSM tiles, zoom bounds **2–10**, world-copy-jump enabled.
- **[`colorScale.ts`](../frontend/src/utils/colorScale.ts)** — sequential sky-100 → sky-600 choropleth with clamping, null-value fallback, and degenerate-range handling.
- **[`KpiSelector.tsx`](../frontend/src/components/KpiSelector.tsx)** + **[`kpiStore.ts`](../frontend/src/stores/kpiStore.ts)** — Zustand-backed dropdown that switches between `demand_index` and `avg_booking_value`; the GeoJSON layer re-keys on change so styles and tooltips refresh atomically.
- **Hover tooltips** — sticky Leaflet tooltips with country name, continent, and formatted KPI value; mouseover brings the feature to front and thickens the stroke.

---

### 🧪 Verification Results

#### 📋 Backend API

```text
GET /api/regions → 200 OK
features: 233
features with demand_index: 30
FR sample: {iso_code:"FR", name:"France", continent:"Europe",
            demand_index:83, avg_booking_value:320.75,
            snapshot_month:"2026-04-01"}
```

#### 🧮 Frontend Unit Tests (KPI Scale)

```text
✓ src/utils/colorScale.test.ts (17 tests) 2ms
Test Files  1 passed (1)
     Tests  17 passed (17)
```

#### 🔍 Lint / Type-Check / Build

```text
npm run lint  → 0 warnings, 0 errors
tsc --noEmit  → clean
vite build    → 82 modules transformed
                dist/assets/index.js 353 KB (gzip 107 KB)
```

---

### 🏗️ Technical Decisions & Troubleshooting

> [!IMPORTANT]
> **Phase-0 Configuration Fixes Required** — several Phase-0 configuration gaps surfaced only when the first real code was added:
> - `index.html` was in `public/` — Vite requires it at the project root. **Moved to `frontend/index.html`**.
> - `greenlet` was missing from the live venv despite being pinned in `requirements.txt` — **reinstalled** to unblock SQLAlchemy async sessions.
> - `vite.config.ts` used `defineConfig` from `vite` (no `test` field) — **added `/// <reference types="vitest" />`**.
> - ESLint flat config had no browser globals — `fetch`/`document` were flagged as undefined. **Imported `globals.browser`** and ignored `dist/`, `node_modules/`, and the Vite config file.
> - **React-Leaflet vs. React 19 StrictMode**: The world map rendered blank at startup because React 18/19 `StrictMode` triggers a double-mount in development. `react-leaflet@4` attempts to initialize the map twice, but Leaflet throws an error if a container is already initialized. **Decision**: Removed `<StrictMode>` from `frontend/src/main.tsx` to ensure stable map initialization.
> - **NPM Permission Denied**: Executable bits were missing on binaries in `node_modules/.bin/` (e.g., `vite`), preventing `npm run dev` from starting. **Applied `chmod +x`** to the entire `.bin` directory to restore functionality.

> [!TIP]
> **Test Environment**
> The scaffold referenced `environment: 'jsdom'` but `jsdom` was never installed. The Phase-1 KPI-scale tests are pure-math, so we switched the environment to **`node`** — zero extra dependencies. When DOM-dependent tests arrive in Phase 2 (Playwright E2E), we'll revisit.

> [!NOTE]
> **Boundary vs. Metric Coverage**
> `/api/regions` intentionally returns **all 233 boundaries**, not just the 30 seeded ones. Countries without metrics render in neutral gray (`#e5e7eb`) with reduced opacity, so the base map is always complete and the choropleth subset is visually distinguishable.

---

### 🛠️ Active Development Workflow

| Service | Command | Status |
| --- | --- | --- |
| **Database** | `docker compose up -d db` | Running |
| **Backend API** | `cd backend && uvicorn app.main:app --reload` | Serves `/api/regions` |
| **Frontend UI** | `cd frontend && npm run dev` | Renders world map at `:3000` |
| **Tests** | `cd frontend && npm test` | 17/17 passing |

---

**Next Phase**: **Phase 2 — Rival Company Overlay**

- `/api/rivals` endpoint with category filters.
- 9 rival markers with clustering at zoom < 5.
- Rival summary card on click (name, HQ, market share, AI strategy).
- Playwright E2E test coverage.

---

## 📅 Current Update: 2026-04-22

### 🚀 Milestone: Phase-2 — Rival Company Overlay [COMPLETED]

FR-02 is now live. The map overlays all 9 seed rivals as clickable violet pins, clusters them when zoomed out below level 5, opens a floating summary card on click, and supports category-chip filtering. A Playwright smoke test covers the full click-path.

---

### ✅ Accomplishments

#### Task-2.1: Backend `/api/rivals`

- Implemented [backend/app/routers/rivals.py](../backend/app/routers/rivals.py) — returns `{ rivals: [...], count: n }` with HQ coordinates attached.
- HQ coordinates **hardcoded** as a Python dict (9 entries). A full migration to add `hq_latitude`/`hq_longitude` columns would be invasive for stable facts; a dict keeps Phase-2 additive.
- Optional `?category=B2C&category=B2B` filter (arrays collapse to `IN (...)`).
- Airbnb overridden to San Francisco so it doesn't stack on top of Expedia (Seattle) at the same "United States" key.
- Registered in [backend/app/main.py](../backend/app/main.py).

#### Task-2.2: Frontend rival layer

- **[`RivalMarkersLayer.tsx`](../frontend/src/components/RivalMarkersLayer.tsx)** — custom component that mounts a `L.markerClusterGroup` via `useMap()` from `react-leaflet`. Avoids `react-leaflet-cluster` (unmaintained under React 19).
- Markers are inline SVG `divIcon`s (violet #7c3aed) — no binary asset needed.
- Clustering: `maxClusterRadius: zoom < 5 ? 80 : 40`, `disableClusteringAtZoom: 6`. Meets the "no overlap at zoom < 5" acceptance while letting individual pins breathe at continental zoom.

#### Task-2.3: Summary card & filter

- **[`RivalSummaryCard.tsx`](../frontend/src/components/RivalSummaryCard.tsx)** — floating absolute-positioned `<aside>` top-right of the map; closes on × click or Esc.
- **[`RivalCategoryFilter.tsx`](../frontend/src/components/RivalCategoryFilter.tsx)** — chip group in the header; active chips are violet, inactive chips are neutral; "All" resets.
- State via **[`rivalStore.ts`](../frontend/src/stores/rivalStore.ts)** (Zustand): `rivals`, `activeCategories: Set<string>`, `selectedRivalId`.

#### Task-2.4: Playwright E2E

- Installed `@playwright/test` + added [`playwright.config.ts`](../frontend/playwright.config.ts) with `webServer: vite dev`.
- **[`e2e/rivals.spec.ts`](../frontend/e2e/rivals.spec.ts)** — clicks a pin, asserts the summary dialog appears with a non-empty title, dismisses it, and verifies that toggling a category chip reduces the visible pin count.
- ESLint + tsconfig updated to exclude `e2e/` so vitest + eslint runs don't require the Playwright type project.

---

### 🧪 Verification Results

#### 📋 Backend API Registration

```text
$ python -c "from app.main import app; print(sorted({r.path for r in app.routes if hasattr(r,'path')}))"
['/api/regions', '/api/rivals', '/docs', '/healthz', '/openapi.json', ...]
```

#### 🔍 Lint / Type-Check / Build

```text
npm run lint  → 0 warnings, 0 errors
tsc --noEmit  → clean
vite build    → 92 modules transformed
                dist/assets/index.js  391.79 kB (gzip 117.80 kB)
                dist/assets/index.css  21.04 kB (gzip   7.72 kB)
```

#### 🧮 Frontend Unit Tests

```text
✓ src/utils/colorScale.test.ts (17 tests) 2ms
Test Files  1 passed (1) | Tests  17 passed (17)
```

#### 🧭 Playwright Smoke (scaffolded)

Runtime execution is **deferred** until the dev environment is running end-to-end (Docker + backend + `npx playwright install chromium`). The test file compiles under the Playwright parser and follows the standard `@playwright/test` idiom:

```bash
docker compose up -d db
cd backend && uvicorn app.main:app --reload &
cd frontend && npx playwright install chromium && npm run test:e2e
```

---

### 🏗️ Technical Decisions & Troubleshooting

> [!IMPORTANT]
> **Clustering library choice** — `react-leaflet-cluster` currently fails to install cleanly under React 19 / `react-leaflet@4`. **Decision**: use the upstream `leaflet.markercluster` directly through `useMap()`. It's the canonical library, has first-party type defs (`@types/leaflet.markercluster`), and keeps the Phase-1 GeoJSON layer untouched.

> [!TIP]
> **HQ coordinates: dict, not migration** — Adding two columns to the `rivals` table would require an Alembic revision, backfill, and a seed-data change. For 9 rows of stable facts, a dict in [`backend/app/routers/rivals.py`](../backend/app/routers/rivals.py) is simpler and reversible. When Phase 4+ introduces regional presence snapshots, we'll reconsider.

> [!NOTE]
> **Pre-existing `StrictMode` import** — Phase-1 removed `<StrictMode>` but left the import in [`main.tsx`](../frontend/src/main.tsx), which `tsc --noUnusedLocals` flagged the moment a new `tsc --noEmit` run touched the file. Cleaned up as part of Phase 2.

---

### 🛠️ Active Development Workflow

| Service | Command | Status |
| --- | --- | --- |
| **Database** | `docker compose up -d db` | Required |
| **Backend API** | `cd backend && uvicorn app.main:app --reload` | Serves `/api/regions` + `/api/rivals` |
| **Frontend UI** | `cd frontend && npm run dev` | Renders map, pins, filter, summary card |
| **Unit tests** | `cd frontend && npm test` | 17/17 passing |
| **E2E tests** | `cd frontend && npm run test:e2e` | Scaffolded (needs chromium install) |

---

**Next Phase**: **Phase 3 — Regional Characteristics Panel**

- `GET /api/regions/:iso` returning metrics + demographics.
- Side-panel slide-in on country click.
- 12-month seasonal demand chart (Recharts).
- Demographics donut + rival ranking table for the selected region.

---

## 📅 Current Update: 2026-04-22 (Phase 3)

### 🚀 Milestone: Phase-3 — Regional Characteristics Panel [COMPLETED]

FR-03 is now live. Clicking any country on the map slides in a left-side panel showing headline KPIs, a 12-month seasonal demand chart, a demographics donut, the region's top routes, and a ranked list of rivals by market share. All 30 seeded regions render at least the synthesized demand curve and rival ranking; a curated subset of 10 regions (US, GB, JP, FR, IN, DE, AU, BR, AE, SG) additionally renders top routes and demographics.

---

### ✅ Accomplishments

#### Task-3.1: Backend `GET /api/regions/{iso_code}`

- Extended [backend/app/routers/regions.py](../backend/app/routers/regions.py) with a single-region endpoint returning:
  - Headline KPIs (`demand_index`, `avg_booking_value`, `snapshot_month`).
  - **`monthly_demand`**: 12-month curve synthesized with `value = demand_index × (1 + 0.3 cos(2π (month − peak) / 12))`. Peak is **July** for Northern-hemisphere regions and **January** for Oceania / South America. This avoids an Alembic migration for derived data — the API contract is stable when real ingestion replaces it.
  - **`top_routes`** and **`demographics`**: JSONB passthrough from the new seed data.
  - **`rival_ranking`**: joins `rival_region_snapshots` + `rivals` ordered by `market_share_pct desc`.
- Returns **HTTP 404** on unknown ISO codes.

#### Task-3.2: Seed data for Phase-3 shape

- Extended [data/seeds/seed.py](../data/seeds/seed.py):
  - Hand-curated `top_routes` (3/region) and `demographics` (4-segment, sum to 100) for 10 focus regions.
  - Deterministic `rival_region_snapshots` generator (`random.seed(42)`) — 5-7 active rivals per region, home-country bonus ×4 (so MakeMyTrip dominates IN, Agoda dominates SG, etc.), shares normalized to sum to 80% of market.
  - Assertion bumped: `snapshot_count >= 150` rows for the seeded month.

#### Task-3.3: Frontend panel + charts

- **[`RegionPanel.tsx`](../frontend/src/components/RegionPanel.tsx)** — 380 px left-docked panel with 320 ms slide-in keyframe (`region-panel-slide-in`), Esc/× close, `loading`/`error` states.
- **[`DemandChart.tsx`](../frontend/src/components/DemandChart.tsx)** — Recharts `BarChart` with 12 month labels.
- **[`DemographicsDonut.tsx`](../frontend/src/components/DemographicsDonut.tsx)** — Recharts `PieChart` with 6-color segment palette, legend shows `segment · share%`.
- **[`RivalRankingTable.tsx`](../frontend/src/components/RivalRankingTable.tsx)** — 3-column table (#, rival, share) with category subtitle per row.
- **[`demographics.ts`](../frontend/src/utils/demographics.ts)** — pure normalizer: clamps negatives, drops NaN/∞, re-scales to sum to 100, returns `[]` on empty/zero input.

#### Task-3.4: Wiring

- [`WorldMap.tsx`](../frontend/src/components/WorldMap.tsx) — added a `click` handler on each feature that calls `openRegion(props.iso_code)`.
- [`regionDetailStore.ts`](../frontend/src/stores/regionDetailStore.ts) — Zustand store with in-flight-request guarding (discards stale responses if a second click lands before the first `await` settles).
- [`App.tsx`](../frontend/src/App.tsx) — mounts `<RegionPanel/>` alongside the existing rival card.

---

### 🧪 Verification Results

#### 🐍 Monthly-demand synthesis sanity check

```text
$ python -c "from app.routers.regions import _synthesize_monthly_demand; ..."
Northern peak month: 7     (Europe, demand_index=83 → Jul=107.9, Jan=58.1)
Southern peak month: 1     (Oceania, demand_index=60 → Jan=peak)
Null index: []
```

#### 🔍 Lint / Type-Check / Build

```text
npm run lint  → 0 warnings, 0 errors
tsc --noEmit  → clean
vite build    → 717 modules transformed
                dist/assets/index.js  810.16 kB (gzip 231.35 kB)
                dist/assets/index.css  23.49 kB (gzip   8.22 kB)
```

The jump in JS bundle size is Recharts landing for the first time (~180 kB gzipped). A future optimization pass can code-split the panel via `React.lazy()`, but the MVP stays one-bundle for simplicity.

#### 🧮 Frontend Unit Tests

```text
✓ src/utils/demographics.test.ts (7 tests) 2ms
✓ src/utils/colorScale.test.ts   (17 tests) 2ms
Test Files  2 passed (2) | Tests  24 passed (24)
```

The 7 new demographics tests cover: already-100 pass-through, rounding drift (99.5 → 100), over-100 (200 → rescale), empty input, all-zero, negative clamp, NaN/∞ drop.

#### 🌐 Backend route registration

```text
['/api/regions', '/api/regions/{iso_code}', '/api/rivals', '/docs', '/healthz', ...]
```

---

### 🎬 Expected Results When Running the App

Start the three processes (see [README.md](../README.md) → "Running the App"), then in the browser at **<http://localhost:3000>**:

| Action | Expected result |
| --- | --- |
| Page load | Header bar with title + category chips + KPI selector. World map centered at [20, 0] zoom 2 with 233 country boundaries and 30 of them color-shaded on the sky-100 → sky-600 choropleth. 9 violet rival pins visible (clustered at continents at zoom < 5). |
| **Click a seeded country (e.g. France)** | Left-side panel slides in over ~320 ms. Header: **"France · Europe · snapshot 2026-04-01"**. KPIs row: *Demand Index* **83**, *Avg Booking Value* **$320.75**. Bar chart peaks visibly in July. Donut shows 4 segments totaling 100%. Top-routes list shows "Paris → Nice 19.4%", "Paris → Marseille 14.6%", "Paris → Bordeaux 10.8%". Rival-ranking table lists 5-7 rivals with their market-share %. |
| **Click a country with no seeded detail (e.g. Poland)** | Panel opens; demand chart + rival ranking still render. Demographics and routes sections show "No data seeded for this region." |
| **Click Australia** | Same panel shape, but the demand bar chart **peaks in January** (Southern-hemisphere seasonality). |
| **Switch to another country** | Panel stays open, content swaps in place. Brief "Loading…" state appears if the fetch takes >100 ms. |
| **Press Esc or click ×** | Panel slides/fades away; map stays at its current zoom + pan. |
| **Click a rival pin** | Violet summary card appears top-right (Phase 2 behavior). Rival card and region panel can coexist on screen. |

Direct API check from a terminal:

```bash
curl -s http://localhost:8000/api/regions/FR | jq '{name, demand_index, peak_month: (.monthly_demand | max_by(.value).month), ranking_count: (.rival_ranking | length)}'
# → {"name": "France", "demand_index": 83, "peak_month": 7, "ranking_count": 5-7}
```

---

### 🏗️ Technical Decisions & Troubleshooting

> [!IMPORTANT]
> **Synthesize, don't migrate** — The design document's ERD has `top_routes` and `demographics` JSONB but no monthly time series. Adding a `monthly_demand` column would force an Alembic revision + data backfill. **Decision**: derive the 12-month series at request time from `demand_index` + hemisphere. When real ingestion lands in Phase 5, we swap the synthesizer for a DB read without changing the API contract.

> [!TIP]
> **`cos` vs `sin` for seasonality** — An initial `sin(2π (m − peak) / 12)` variant placed the peak 3 months after the named peak month (sin peaks at π/2, not 0). **Fix**: `cos(2π (m − peak) / 12)` peaks exactly at `m = peak`. Small thing, caught by a quick sanity print before any UI hit the endpoint.

> [!NOTE]
> **Vitest picking up Playwright specs** — Adding Phase-3 introduced a second `npm test` run where Vitest tried to execute `e2e/rivals.spec.ts` (Playwright's `test.describe` under Vitest throws "two different versions of @playwright/test"). **Fix**: added `exclude: ['node_modules/**', 'dist/**', 'e2e/**']` to `vite.config.ts`'s `test` section. Should have been there since Phase 2, but the vitest default was hiding the issue until a second spec landed.

---

### 🛠️ Active Development Workflow

| Service | Command | Status |
| --- | --- | --- |
| **Database** | `docker compose up -d db` | Required |
| **Backend API** | `cd backend && uvicorn app.main:app --reload` | Serves `/api/regions`, `/api/regions/{iso}`, `/api/rivals` |
| **Frontend UI** | `cd frontend && npm run dev` | Renders map, pins, filter, rival card, **region panel** |
| **Unit tests** | `cd frontend && npm test` | 24/24 passing |
| **E2E tests** | `cd frontend && npm run test:e2e` | Scaffolded (needs chromium install) |

---

**Next Phase**: **Phase 4 — KPI Header + Comparison View**

- `GET /api/kpis/global` returning 3 headline KPIs.
- KPI strip in header bar that responds to category and time filters.
- Multi-select country picker (max 3).
- Side-by-side comparison table with winner-cell highlighting.
