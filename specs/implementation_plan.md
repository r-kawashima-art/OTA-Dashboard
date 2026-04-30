# Implementation Plan — OTA Competitive Intelligence Dashboard

**Version:** 1.0
**Last Updated:** 2026-04-18
**Source Spec:** [specs/user_story.md](user_story.md)

---

## 1. Executive Summary

Build a world-map-based competitive intelligence dashboard for the OTA president to monitor rival companies and regional travel market characteristics, prioritizing a working map core before layering analytics on top.

---

## 2. Tech Stack Decision

| Layer | Choice | Rationale |
|---|---|---|
| Frontend Framework | React 19 + TypeScript | Type safety, ecosystem maturity |
| Map Library | Leaflet (react-leaflet) | Open-source, free, and lightweight mapping |
| Charts | Recharts | Lightweight, React-native, composable |
| State Management | Zustand | Simple, minimal boilerplate for dashboard state |
| Backend API | Python + FastAPI | Fast prototyping, async I/O, auto-generated docs |
| Database | PostgreSQL + PostGIS | Relational + geospatial queries |
| Data Ingestion | Python scripts + cron | Scraping/API fetch pipeline, monthly cadence |
| Hosting | Vercel (frontend) + Railway (backend) | Fast deployment, free tier for prototype |

---

## 3. Phase Plan

### Phase 0 — Project Setup

**Goal:** Runnable skeleton, CI, and seed data loaded.

| Task | Output | Acceptance Criteria | Verification |
|---|---|---|---|
| Create monorepo structure | Repo scaffold | `/frontend`, `/backend`, `/data` folders exist | `ls -R` directory check |
| Configure Linting/TypeScript | Config files | Strict mode enabled, zero lint errors | `npm run lint` and `tsc --noEmit` |
| Set up PostgreSQL + PostGIS | DB running | Local and Railway instances accessible | `psql -c "SELECT version();"` |
| Database Migrations | `migrations/` | Schema matches Data Model (Section 4) | `\d` command to verify tables |
| Seed Database | Seed script | 9 rivals and 30 countries loaded | `SELECT COUNT(*)` count check |
| Configure CI/CD | Pipeline | Preview deployments active on Vercel | PR trigger + preview URL validation |

**Milestone:** `http://localhost:3000` loads a blank page and DB connectivity is confirmed.

---

### Phase 1 — Interactive World Map Core

**Goal:** Satisfy FR-01 fully.

| Task | Output | Acceptance | Verification |
|---|---|---|---|
| Leaflet Integration | Map renders | Map visible with OSM tiles | Manual visual check |
| Zoom / pan controls | Controls | Zoom 2–10 works smoothly | Manual interaction trace |
| Fetch /api/regions | Boundaries | All 195 borders drawn | Browser console: GeoJSON check |
| KPI Choropleth | Color layer | Dropdown switches KPI, colors update | Visual vs expected palette |
| Hover Tooltips | Tooltip | Appears within 200ms | Performance monitor (DevTools) |
| KPI Scale Unit Tests | Tests | 100% pass | `npm test` or `vitest` |

**Milestone:** World map with color-coded KPI choropleth is live in staging.

---

### Phase 2 — Rival Company Overlay ✅ [COMPLETED 2026-04-22]

**Goal:** Satisfy FR-02 fully.

| ID | Task | Output | Acceptance | Verification | Status |
|---|---|---|---|---|---|
| T-2.1 | Backend `/api/rivals` | [backend/app/routers/rivals.py](../backend/app/routers/rivals.py) | Returns JSON in < 200ms, supports `?category=` filter | `curl -sw '\n%{time_total}s\n' http://localhost:8000/api/rivals` | ✅ |
| T-2.2 | Rival markers | [RivalMarkersLayer.tsx](../frontend/src/components/RivalMarkersLayer.tsx) | 9 seed rivals visible as violet SVG pins | Visual marker count check at zoom ≥ 6 | ✅ |
| T-2.3 | Marker clustering | `leaflet.markercluster` via `useMap()` | No overlap at zoom < 5 (`maxClusterRadius: 80`) | Manual zoom-out verification | ✅ |
| T-2.4 | Rival summary card | [RivalSummaryCard.tsx](../frontend/src/components/RivalSummaryCard.tsx) | Card opens within 300ms on marker click; Esc + × close | Interaction profiling via DevTools | ✅ |
| T-2.5 | Category filters | [RivalCategoryFilter.tsx](../frontend/src/components/RivalCategoryFilter.tsx) + [rivalStore.ts](../frontend/src/stores/rivalStore.ts) | Toggling a chip adds/removes rivals of that category | Toggle each category manual test | ✅ |
| T-2.6 | Playwright E2E | [e2e/rivals.spec.ts](../frontend/e2e/rivals.spec.ts) + [playwright.config.ts](../frontend/playwright.config.ts) | `npm run test:e2e` exercises marker click, card open/close, chip toggle | `npx playwright install chromium && npm run test:e2e` | Scaffolded — runtime pending DB/browser |

**Milestone:** All 9 seed rivals are clickable on the map with summary cards, filterable by category, and covered by a Playwright smoke test.

---

### Phase 3 — Regional Characteristics Panel ✅ [COMPLETED 2026-04-22]

**Goal:** Satisfy FR-03 fully.

| ID | Task | Output | Acceptance | Verification | Status |
|---|---|---|---|---|---|
| T-3.1 | Backend `/api/regions/{iso}` | [backend/app/routers/regions.py](../backend/app/routers/regions.py) | Returns metrics + monthly_demand + demographics + top_routes + rival_ranking; 404 on unknown ISO | `curl -s http://localhost:8000/api/regions/FR \| jq` | ✅ |
| T-3.2 | Side panel slide-in | [RegionPanel.tsx](../frontend/src/components/RegionPanel.tsx) | Opens in < 400ms via 320ms CSS transform | Manual inspection of `region-panel-slide-in` keyframes | ✅ |
| T-3.3 | Seasonal demand chart | [DemandChart.tsx](../frontend/src/components/DemandChart.tsx) | 12-month Recharts `BarChart`; peaks synthesized from `demand_index` + hemisphere | Northern sample peaks in Jul, Southern in Jan | ✅ |
| T-3.4 | Demographics donut | [DemographicsDonut.tsx](../frontend/src/components/DemographicsDonut.tsx) + [demographics.ts](../frontend/src/utils/demographics.ts) | Segments re-normalize to sum to 100 | `npm test` — 7/7 donut-logic tests in [demographics.test.ts](../frontend/src/utils/demographics.test.ts) | ✅ |
| T-3.5 | Close / collapse UX | `closeRegion()` on Esc + × button | Panel dismounts; map retains bounds | Click-path manual test | ✅ |
| T-3.6 | Rival ranking table | [RivalRankingTable.tsx](../frontend/src/components/RivalRankingTable.tsx) + seed_update for [data/seeds/seed.py](../data/seeds/seed.py) | Dominant rival first; rows ≤ 7 per region; 30 × ~6 rows seeded | `SELECT COUNT(*) FROM rival_region_snapshots;` ≥ 150 | ✅ |

**Milestone:** Clicking any country opens a panel with demand chart, demographics donut, top routes, and rival ranking.

---

### Phase 4 — KPI Header + Comparison View ✅ [COMPLETED 2026-04-30]

**Goal:** Satisfy FR-04 and FR-05.

| ID | Task | Output | Acceptance | Verification | Status |
|---|---|---|---|---|---|
| T-4.1 | Backend `/api/kpis/global` | [backend/app/routers/kpis.py](../backend/app/routers/kpis.py) | Returns `markets_covered`, `tracked_rivals`, `hottest_growth_region`, `snapshot_month`; latency < 200ms | `curl -sw '\n%{time_total}s\n' http://localhost:8000/api/kpis/global` → 30 / 9 / US (92) / 2026-04-01 in 33ms | ✅ |
| T-4.2 | KPI header bar | [KpiHeaderBar.tsx](../frontend/src/components/KpiHeaderBar.tsx) + [api/globalKpis.ts](../frontend/src/api/globalKpis.ts) | Three-tile bar; "Tracked Rivals" recomputes live from `rivalStore.activeCategories` | Toggle category chips → `filteredRivalCount` re-renders without re-fetch | ✅ |
| T-4.3 | Multi-select picker | [ComparisonPicker.tsx](../frontend/src/components/ComparisonPicker.tsx) + [comparisonStore.ts](../frontend/src/stores/comparisonStore.ts) | Hard cap of 3 chips; `<select>` disables at capacity; chips removable; restricted to seeded regions | `addRegion` no-ops past `COMPARISON_MAX`; dropdown shows only `demand_index !== null` regions | ✅ |
| T-4.4 | Comparison table | [ComparisonPanel.tsx](../frontend/src/components/ComparisonPanel.tsx) | 5 metric rows × ≤3 region columns aligned by `selectedIsos` order; renders only when ≥2 regions picked | `buildComparisonRows` unit tests assert column order and values per region | ✅ |
| T-4.5 | Highlight winner cell | [comparison.ts](../frontend/src/utils/comparison.ts) + [comparison.test.ts](../frontend/src/utils/comparison.test.ts) | Highest value gets `comparison-table__cell--winner` (green); ties produce no winner; null/NaN never wins | `npm test` — 13/13 comparison tests pass (37/37 total) | ✅ |

**Milestone:** President can compare up to 3 regions in a table with row-level winner highlighting; KPI header bar reflects rival-category filter live. Verified via `npm run lint`, `npm run build` (TS strict), `npm test` (37/37), and live `/api/kpis/global` curl.

#### Small Tweak Phase 4 ✅ [COMPLETED 2026-04-30]

**Situation:** the rival roster only carried B2C OTAs, and `rivals.category` was a single VARCHAR — it couldn't represent OTAs that operate in both segments.

**Resolution:**

- Schema: migration [0002_rival_multi_category.py](../backend/migrations/versions/0002_rival_multi_category.py) drops `category VARCHAR` and adds `categories VARCHAR[]`, backfilling each existing row's prior category as a single-element array.
- Model: [Rival.categories: ARRAY(String(50))](../backend/app/models/rival.py) replaces the scalar field.
- API: [routers/rivals.py](../backend/app/routers/rivals.py) filters via Postgres array overlap (`Rival.categories.overlap(...)`), so `?category=B2B` matches both pure-B2B rivals and dual-category ones.
- Seed: [seed.py](../data/seeds/seed.py) adds 6 new entries (Amadeus, Hotelbeds, TBO Tek, HRS, Riya Connect — pure B2B; Traveloka — both) and re-tags Expedia / Etraveli as `["B2C", "B2B"]` to reflect Expedia Partner Solutions and Etraveli's white-label arm.
- Frontend: [types.ts](../frontend/src/types.ts), [rivalStore.ts](../frontend/src/stores/rivalStore.ts), [RivalCategoryFilter.tsx](../frontend/src/components/RivalCategoryFilter.tsx), [RivalMarkersLayer.tsx](../frontend/src/components/RivalMarkersLayer.tsx), [RivalSummaryCard.tsx](../frontend/src/components/RivalSummaryCard.tsx), [KpiHeaderBar.tsx](../frontend/src/components/KpiHeaderBar.tsx), and [RivalRankingTable.tsx](../frontend/src/components/RivalRankingTable.tsx) all consume `categories: string[]`. Visibility is "any active category" (overlap semantics, mirroring the backend).

##### Acceptance Criteria

- [x] User can review both B2C and B2B OTAs (some categorized to **both**). Verified: `/api/rivals` returns 15 rivals; Expedia, Etraveli, Traveloka show `["B2C", "B2B"]`.
- [x] User can filter B2C and B2B OTAs. Verified: `/api/rivals?category=B2B` → 8 results (5 pure-B2B + 3 dual); `?category=B2C` → 10 results (7 pure-B2C + 3 dual).

**Verification:** `alembic upgrade head` (0001 → 0002), `python data/seeds/seed.py` (15 rivals / 30 regions / 175 snapshots), `npm run lint` clean, `npm run build` (TS strict) clean, `npm test` 37/37, live `/api/rivals?category=B2B|B2C` curl confirmed.

---

### Phase 5 — Time-Period Filter + Export

**Goal:** Satisfy FR-06.

| Task | Output | Acceptance | Verification |
|---|---|---|---|
| Time range slider | Filter widget | UI re-fetches on change | Network tab verification |
| Backend query param | API update | Filtered data returned | API direct query verification |
| Backend /api/export | Export API | Returns valid CSV | Check CSV in spreadsheet app |
| PDF export (jsPDF) | PDF button | PDF contains map + tables | Manual PDF audit |
| "Last updated" badge | Timestamp | Shows ingestion date | UI vs DB timestamp match |

**Milestone:** Full filter + export flow works end-to-end.
