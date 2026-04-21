"""Regions router — serves country boundaries merged with the latest KPI snapshot."""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Region, RegionMetrics

router = APIRouter(prefix="/api", tags=["regions"])

# Repo root → /data/geo/countries.simplified.geo.json
_GEOJSON_PATH = (
    Path(__file__).resolve().parents[3] / "data" / "geo" / "countries.simplified.geo.json"
)


@lru_cache(maxsize=1)
def _load_boundaries() -> dict[str, Any]:
    """Load the country-boundaries GeoJSON once per process."""
    with _GEOJSON_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/regions")
async def list_regions(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Return a GeoJSON FeatureCollection of country boundaries enriched with the
    latest region metrics (demand_index, avg_booking_value) and continent metadata.

    Countries without seeded metrics still appear in the collection with null KPI
    values, so the frontend can render the full base map and only color-code the
    subset that has data.
    """
    boundaries = _load_boundaries()

    # Region metadata keyed by iso_code
    region_rows = (await db.execute(select(Region.iso_code, Region.name, Region.continent))).all()
    region_meta: dict[str, dict[str, str | None]] = {
        iso: {"name": name, "continent": continent} for iso, name, continent in region_rows
    }

    # Latest KPI snapshot per region (we only seed one month, so MAX is safe).
    latest_month_subq = (
        select(RegionMetrics.region_iso, RegionMetrics.snapshot_month)
        .order_by(RegionMetrics.region_iso, RegionMetrics.snapshot_month.desc())
        .distinct(RegionMetrics.region_iso)
        .subquery()
    )
    metrics_stmt = select(
        RegionMetrics.region_iso,
        RegionMetrics.demand_index,
        RegionMetrics.avg_booking_value,
        RegionMetrics.snapshot_month,
    ).join(
        latest_month_subq,
        (RegionMetrics.region_iso == latest_month_subq.c.region_iso)
        & (RegionMetrics.snapshot_month == latest_month_subq.c.snapshot_month),
    )
    metrics_rows = (await db.execute(metrics_stmt)).all()
    kpi_by_iso: dict[str, dict[str, Any]] = {
        iso: {
            "demand_index": demand_index,
            "avg_booking_value": avg_booking_value,
            "snapshot_month": snapshot_month.isoformat() if snapshot_month else None,
        }
        for iso, demand_index, avg_booking_value, snapshot_month in metrics_rows
    }

    features: list[dict[str, Any]] = []
    for feat in boundaries["features"]:
        iso = feat["properties"].get("iso_code")
        if not iso:
            continue
        db_meta = region_meta.get(iso, {})
        kpis = kpi_by_iso.get(iso, {})
        properties = {
            "iso_code": iso,
            "name": db_meta.get("name") or feat["properties"].get("name"),
            "continent": db_meta.get("continent"),
            "demand_index": kpis.get("demand_index"),
            "avg_booking_value": kpis.get("avg_booking_value"),
            "snapshot_month": kpis.get("snapshot_month"),
        }
        features.append(
            {
                "type": "Feature",
                "properties": properties,
                "geometry": feat["geometry"],
            }
        )

    return {"type": "FeatureCollection", "features": features}
