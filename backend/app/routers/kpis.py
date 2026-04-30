"""KPIs router — serves global summary KPIs for the dashboard header (FR-04)."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Region, RegionMetrics, Rival

router = APIRouter(prefix="/api", tags=["kpis"])


@router.get("/kpis/global")
async def get_global_kpis(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Return the three global summary KPIs for the dashboard header.

    Shape:
        {
          markets_covered: int,         # countries with at least one metrics snapshot
          tracked_rivals: int,          # total rivals in the roster
          hottest_growth_region: {      # highest demand_index in the latest month, or null
            iso_code, name, demand_index
          } | null,
          snapshot_month: str | null    # the latest snapshot month referenced above
        }

    Notes:
    - "Markets covered" counts distinct region ISOs that have *any* metrics row,
      not the 195 country borders, so it reflects data coverage rather than
      raw boundary availability.
    - The hottest-growth region is computed against the *latest* snapshot month
      so the figure stays stable as we ingest new months over time.
    """
    markets_covered = (
        await db.execute(select(func.count(distinct(RegionMetrics.region_iso))))
    ).scalar_one()

    tracked_rivals = (await db.execute(select(func.count(Rival.id)))).scalar_one()

    latest_month = (
        await db.execute(select(func.max(RegionMetrics.snapshot_month)))
    ).scalar_one_or_none()

    hottest: dict[str, Any] | None = None
    if latest_month is not None:
        row = (
            await db.execute(
                select(
                    RegionMetrics.region_iso,
                    Region.name,
                    RegionMetrics.demand_index,
                )
                .join(Region, Region.iso_code == RegionMetrics.region_iso)
                .where(RegionMetrics.snapshot_month == latest_month)
                .where(RegionMetrics.demand_index.is_not(None))
                .order_by(RegionMetrics.demand_index.desc())
                .limit(1)
            )
        ).first()
        if row is not None:
            iso, name, demand_index = row
            hottest = {
                "iso_code": iso,
                "name": name,
                "demand_index": demand_index,
            }

    return {
        "markets_covered": int(markets_covered or 0),
        "tracked_rivals": int(tracked_rivals or 0),
        "hottest_growth_region": hottest,
        "snapshot_month": latest_month.isoformat() if latest_month else None,
    }
