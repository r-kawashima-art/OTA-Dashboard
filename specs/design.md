# System Design & Architecture

## Architecture Overview

```mermaid
graph TD
    subgraph Frontend [React + Leaflet]
        A[World Map View] --> B[Rival Markers Layer]
        A --> C[KPI Header]
        A --> D[Time-Period Filter]
        B --> E[Rival Summary Card]
        A --> F[Regional Panel]
        F --> G[Demand Chart - Recharts]
        F --> H[Rival Ranking Table]
        A --> I[Comparison View]
    end

    subgraph Backend [FastAPI]
        J["/api/regions"] --> K[PostgreSQL + PostGIS]
        L["/api/rivals"] --> K
        M["/api/kpis"] --> K
        N["/api/export"] --> K
    end

    subgraph Ingestion [Python Cron]
        O[Data Scrapers / APIs] --> P[Transform & Validate]
        P --> K
    end

    Frontend -->|REST / JSON| Backend
```

## Project Structure

```text
OTA-Worldmap/
├── frontend/                          # React 19 + TypeScript (Vite)
│   ├── index.html                     # Vite entry document
│   ├── src/
│   │   ├── main.tsx                   # React root + global CSS import
│   │   ├── App.tsx                    # Layout shell (header + map)
│   │   ├── index.css                  # App styles + Leaflet CSS import
│   │   ├── types.ts                   # KPI + GeoJSON type definitions
│   │   ├── api/
│   │   │   └── regions.ts             # fetch wrapper for /api/regions
│   │   ├── components/
│   │   │   ├── WorldMap.tsx           # Leaflet map + choropleth layer
│   │   │   └── KpiSelector.tsx        # KPI dropdown
│   │   ├── stores/
│   │   │   └── kpiStore.ts            # Zustand store (selected KPI)
│   │   └── utils/
│   │       ├── colorScale.ts          # Choropleth color interpolation
│   │       └── colorScale.test.ts     # Vitest unit tests
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
│   │       └── regions.py             # GET /api/regions (GeoJSON + KPIs)
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

## Data Model (Simplified)

```mermaid
erDiagram
    REGION {
        string iso_code PK
        string name
        geometry boundary
        string continent
    }
    RIVAL {
        uuid id PK
        string name
        string hq_country
        string category
        string business_model
        text ai_strategy
        string website
    }
    RIVAL_REGION_SNAPSHOT {
        uuid id PK
        uuid rival_id FK
        string region_iso FK
        float market_share_pct
        int booking_volume
        date snapshot_month
    }
    REGION_METRICS {
        uuid id PK
        string region_iso FK
        date snapshot_month
        float avg_booking_value
        int demand_index
        jsonb top_routes
        jsonb demographics
    }

    REGION ||--o{ RIVAL_REGION_SNAPSHOT : has
    RIVAL ||--o{ RIVAL_REGION_SNAPSHOT : has
    REGION ||--o{ REGION_METRICS : has
```
