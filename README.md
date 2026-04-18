# OTA Intelligence Dashboard

> A world-map-based competitive intelligence dashboard for Online Travel Agency (OTA) presidents to monitor rival companies and regional travel market characteristics.

---

## Prerequisites

| Tool | Version | Install |
| --- | --- | --- |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.10+ | [python.org](https://python.org) |
| pip | latest | bundled with Python |

> A free [Mapbox account](https://account.mapbox.com/auth/signup/) is required for the interactive map. Grab your public token from the Mapbox dashboard.

---

## Repository Structure

```text
OTA-Dashboard/
├── backend/        FastAPI + SQLite API server
├── data/seed/      JSON seed data (rivals, regions, metrics)
├── frontend/       React + Vite + Mapbox GL dashboard
├── docs/           Walkthrough and design documents
└── specs/          User story and implementation plan
```

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd OTA-Dashboard
```

### 2. Install backend dependencies

```bash
pip install fastapi "uvicorn[standard]" aiosqlite python-multipart
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Configure the Mapbox token

```bash
cp frontend/.env.example frontend/.env
```

Open `frontend/.env` and replace the placeholder with your token:

```text
VITE_MAPBOX_TOKEN=pk.your_actual_token_here
```

---

## Running the System

Both servers must run at the same time. Open two terminal windows.

### Terminal 1 — Backend API

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The API starts at `http://localhost:8000`.
Interactive API docs are available at `http://localhost:8000/docs`.

On first start the database (`backend/ota.db`) is created automatically and seeded with:

- 9 rival companies (Booking.com, Expedia, Airbnb, Trip.com, and more)
- 30 countries across all continents
- 47 rival-region market share snapshots
- 12 regional demand metric records

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

The dashboard opens at `http://localhost:5173`.

---

## Running Tests

```bash
cd frontend
npx vitest run
```

Expected output: **8 tests pass** (color scale unit tests).

---

## Key API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/regions` | List all tracked countries |
| `GET` | `/api/regions/{iso}/metrics?year=2025` | Demand chart, demographics, rival ranking for a country |
| `GET` | `/api/rivals?category=B2C&year=2025` | List rivals with optional filters |
| `GET` | `/api/kpis/global?year=2025` | Global KPIs: markets, rival count, hottest region |
| `GET` | `/api/export?region=US&year=2025` | Download rival data as CSV |

---

## Features

- **Choropleth world map** — countries color-coded by demand index (blue = low, red = high)
- **Rival HQ markers** — click any marker to see company strategy, market share, and AI capabilities
- **Regional panel** — click any country for seasonal demand chart, traveler mix, top routes, and rival ranking
- **Comparison view** — select up to 3 regions for a side-by-side metrics table
- **Year filter** — switch between 2023, 2024, and 2025 data
- **CSV export** — download rival market share data for any selected region
