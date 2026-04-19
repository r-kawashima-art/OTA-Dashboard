import uuid
from datetime import date

from geoalchemy2 import Geometry
from sqlalchemy import Date, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.base import Base


class Region(Base):
    __tablename__ = "regions"

    iso_code: Mapped[str] = mapped_column(String(10), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    boundary: Mapped[object] = mapped_column(Geometry("MULTIPOLYGON", srid=4326), nullable=True)
    continent: Mapped[str] = mapped_column(String(50), nullable=True)


class RegionMetrics(Base):
    __tablename__ = "region_metrics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    region_iso: Mapped[str] = mapped_column(String(10), nullable=False)
    snapshot_month: Mapped[date] = mapped_column(Date, nullable=False)
    avg_booking_value: Mapped[float] = mapped_column(Float, nullable=True)
    demand_index: Mapped[int] = mapped_column(Integer, nullable=True)
    top_routes: Mapped[object] = mapped_column(JSONB, nullable=True)
    demographics: Mapped[object] = mapped_column(JSONB, nullable=True)
