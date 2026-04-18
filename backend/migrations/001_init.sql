CREATE TABLE IF NOT EXISTS region (
    iso_code  TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    continent TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rival (
    id             TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    hq_country     TEXT NOT NULL,
    category       TEXT NOT NULL,   -- budget | luxury | B2B | B2C
    business_model TEXT NOT NULL,
    ai_strategy    TEXT,
    website        TEXT
);

CREATE TABLE IF NOT EXISTS rival_region_snapshot (
    id               TEXT PRIMARY KEY,
    rival_id         TEXT NOT NULL REFERENCES rival(id),
    region_iso       TEXT NOT NULL REFERENCES region(iso_code),
    market_share_pct REAL NOT NULL,
    booking_volume   INTEGER NOT NULL,
    snapshot_month   TEXT NOT NULL   -- ISO date YYYY-MM-01
);

CREATE TABLE IF NOT EXISTS region_metrics (
    id                TEXT PRIMARY KEY,
    region_iso        TEXT NOT NULL REFERENCES region(iso_code),
    snapshot_month    TEXT NOT NULL,
    avg_booking_value REAL NOT NULL,
    demand_index      INTEGER NOT NULL,
    top_routes        TEXT NOT NULL,   -- JSON array
    demographics      TEXT NOT NULL,   -- JSON object
    last_updated      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshot_rival  ON rival_region_snapshot(rival_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_region ON rival_region_snapshot(region_iso);
CREATE INDEX IF NOT EXISTS idx_metrics_region  ON region_metrics(region_iso);
