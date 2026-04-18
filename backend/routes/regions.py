import json
from fastapi import APIRouter, Depends, HTTPException
import aiosqlite
from database import get_db

router = APIRouter(prefix="/api/regions", tags=["regions"])


@router.get("")
async def list_regions(db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("SELECT iso_code, name, continent FROM region ORDER BY name") as cur:
        rows = await cur.fetchall()
    await db.close()
    return [dict(r) for r in rows]


@router.get("/{iso}/metrics")
async def region_metrics(iso: str, year: int = 2025, db: aiosqlite.Connection = Depends(get_db)):
    iso = iso.upper()
    month = f"{year}-01-01"

    async with db.execute(
        """
        SELECT r.iso_code, r.name, r.continent,
               m.avg_booking_value, m.demand_index,
               m.top_routes, m.demographics, m.last_updated
        FROM region r
        LEFT JOIN region_metrics m
               ON m.region_iso = r.iso_code AND m.snapshot_month = ?
        WHERE r.iso_code = ?
        """,
        (month, iso),
    ) as cur:
        row = await cur.fetchone()

    if not row:
        await db.close()
        raise HTTPException(status_code=404, detail=f"Region {iso} not found")

    data = dict(row)
    data["top_routes"] = json.loads(data["top_routes"]) if data["top_routes"] else []
    data["demographics"] = json.loads(data["demographics"]) if data["demographics"] else {}

    # Monthly demand series from seed JSON (embedded for prototype)
    monthly_demand_map = _monthly_demand_seed()
    data["monthly_demand"] = monthly_demand_map.get(iso, [])

    # Rival ranking for this region
    async with db.execute(
        """
        SELECT rv.id, rv.name, rv.category, rv.hq_country,
               s.market_share_pct, s.booking_volume
        FROM rival_region_snapshot s
        JOIN rival rv ON rv.id = s.rival_id
        WHERE s.region_iso = ? AND s.snapshot_month = ?
        ORDER BY s.market_share_pct DESC
        """,
        (iso, month),
    ) as cur:
        rivals = [dict(r) for r in await cur.fetchall()]

    data["rivals"] = rivals
    await db.close()
    return data


def _monthly_demand_seed() -> dict:
    """Return hard-coded monthly demand from the seed metrics JSON."""
    import json
    from pathlib import Path
    path = Path(__file__).parent.parent.parent / "data" / "seed" / "metrics.json"
    items = json.loads(path.read_text())
    return {item["region_iso"]: item.get("monthly_demand", []) for item in items}
