import json
import uuid
import aiosqlite
from pathlib import Path

DB_PATH = Path(__file__).parent / "ota.db"
MIGRATIONS = Path(__file__).parent / "migrations" / "001_init.sql"
SEED_DIR = Path(__file__).parent.parent / "data" / "seed"


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db


async def init_db() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.executescript(MIGRATIONS.read_text())
        await db.commit()

        # Skip seed if already loaded
        async with db.execute("SELECT COUNT(*) FROM rival") as cur:
            row = await cur.fetchone()
            if row[0] > 0:
                return

        rivals = json.loads((SEED_DIR / "rivals.json").read_text())
        for r in rivals:
            await db.execute(
                "INSERT OR IGNORE INTO rival VALUES (?,?,?,?,?,?,?)",
                (r["id"], r["name"], r["hq_country"], r["category"],
                 r["business_model"], r.get("ai_strategy"), r.get("website")),
            )

        regions = json.loads((SEED_DIR / "regions.json").read_text())
        for r in regions:
            await db.execute(
                "INSERT OR IGNORE INTO region VALUES (?,?,?)",
                (r["iso_code"], r["name"], r["continent"]),
            )

        snapshots = json.loads((SEED_DIR / "snapshots.json").read_text())
        for s in snapshots:
            await db.execute(
                "INSERT OR IGNORE INTO rival_region_snapshot VALUES (?,?,?,?,?,?)",
                (str(uuid.uuid4()), s["rival_id"], s["region_iso"],
                 s["market_share_pct"], s["booking_volume"], s["snapshot_month"]),
            )

        metrics = json.loads((SEED_DIR / "metrics.json").read_text())
        for m in metrics:
            await db.execute(
                "INSERT OR IGNORE INTO region_metrics VALUES (?,?,?,?,?,?,?,?)",
                (
                    str(uuid.uuid4()),
                    m["region_iso"],
                    m["snapshot_month"],
                    m["avg_booking_value"],
                    m["demand_index"],
                    json.dumps(m["top_routes"]),
                    json.dumps(m["demographics"]),
                    "2025-01-15T00:00:00Z",
                ),
            )

        await db.commit()
