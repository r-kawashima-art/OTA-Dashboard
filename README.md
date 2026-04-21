# OTA Competitive Intelligence Dashboard

A world-map-based dashboard for monitoring rival Online Travel Agencies (OTAs) and regional travel market characteristics.

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

# Seed initial data (9 rivals, 30 countries)
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

---

## Project Structure

```text
OTA-Worldmap/
├── frontend/          # React 19 + TypeScript (Vite)
│   ├── src/
│   └── package.json
├── backend/           # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   └── routers/
│   ├── migrations/    # Alembic migration files
│   ├── alembic.ini
│   └── requirements.txt
├── data/
│   └── seeds/seed.py  # Initial rival + region data
├── docs/
│   └── walkthrough.md # Implementation progress log
├── specs/
│   ├── user_story.md
│   └── implementation_plan.md
└── docker-compose.yml
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
