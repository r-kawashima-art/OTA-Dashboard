import csv
import io
import json
from fastapi import APIRouter, Depends, Query, Response
import aiosqlite
from database import get_db

router = APIRouter(tags=["kpis"])


@router.get("/api/kpis/global")
async def global_kpis(year: int = 2025, db: aiosqlite.Connection = Depends(get_db)):
    month = f"{year}-01-01"

    async with db.execute("SELECT COUNT(DISTINCT iso_code) FROM region") as cur:
        markets = (await cur.fetchone())[0]

    async with db.execute("SELECT COUNT(DISTINCT id) FROM rival") as cur:
        rival_count = (await cur.fetchone())[0]

    async with db.execute(
        """
        SELECT r.name, m.demand_index
        FROM region_metrics m
        JOIN region r ON r.iso_code = m.region_iso
        WHERE m.snapshot_month = ?
        ORDER BY m.demand_index DESC
        LIMIT 1
        """,
        (month,),
    ) as cur:
        row = await cur.fetchone()
    hottest = dict(row) if row else {}

    async with db.execute(
        "SELECT MAX(last_updated) FROM region_metrics"
    ) as cur:
        last_row = await cur.fetchone()
    last_updated = last_row[0] if last_row else None

    await db.close()
    return {
        "markets_covered": markets,
        "rivals_tracked": rival_count,
        "hottest_region": hottest,
        "last_updated": last_updated,
    }


@router.get("/api/export")
async def export_region(
    region: str = Query(..., description="ISO code"),
    year: int = 2025,
    db: aiosqlite.Connection = Depends(get_db),
):
    iso = region.upper()
    month = f"{year}-01-01"

    async with db.execute(
        """
        SELECT rv.name as rival, rv.category, s.market_share_pct, s.booking_volume
        FROM rival_region_snapshot s
        JOIN rival rv ON rv.id = s.rival_id
        WHERE s.region_iso = ? AND s.snapshot_month = ?
        ORDER BY s.market_share_pct DESC
        """,
        (iso, month),
    ) as cur:
        rows = [dict(r) for r in await cur.fetchall()]

    await db.close()

    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=["rival", "category", "market_share_pct", "booking_volume"])
    writer.writeheader()
    writer.writerows(rows)

    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{iso}_{year}_rivals.csv"'},
    )
