from fastapi import APIRouter, Depends, Query
import aiosqlite
from database import get_db

router = APIRouter(prefix="/api/rivals", tags=["rivals"])


@router.get("")
async def list_rivals(
    region: str | None = Query(None, description="Filter by region ISO code"),
    category: str | None = Query(None, description="Filter by category"),
    year: int = 2025,
    db: aiosqlite.Connection = Depends(get_db),
):
    month = f"{year}-01-01"

    if region:
        region = region.upper()
        async with db.execute(
            """
            SELECT rv.id, rv.name, rv.hq_country, rv.category,
                   rv.business_model, rv.ai_strategy, rv.website,
                   s.market_share_pct, s.booking_volume, s.region_iso
            FROM rival_region_snapshot s
            JOIN rival rv ON rv.id = s.rival_id
            WHERE s.region_iso = ? AND s.snapshot_month = ?
            ORDER BY s.market_share_pct DESC
            """,
            (region, month),
        ) as cur:
            rows = await cur.fetchall()
    else:
        async with db.execute(
            """
            SELECT rv.id, rv.name, rv.hq_country, rv.category,
                   rv.business_model, rv.ai_strategy, rv.website,
                   NULL as market_share_pct, NULL as booking_volume, NULL as region_iso
            FROM rival rv
            ORDER BY rv.name
            """,
        ) as cur:
            rows = await cur.fetchall()

    await db.close()
    results = [dict(r) for r in rows]

    if category:
        results = [r for r in results if r["category"].lower() == category.lower()]

    return results
