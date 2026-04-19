"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-19
"""
from typing import Sequence, Union

import geoalchemy2
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    op.create_table(
        "regions",
        sa.Column("iso_code", sa.String(10), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("boundary", geoalchemy2.types.Geometry("MULTIPOLYGON", srid=4326), nullable=True),
        sa.Column("continent", sa.String(50), nullable=True),
    )

    op.create_table(
        "rivals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("hq_country", sa.String(100), nullable=True),
        sa.Column("category", sa.String(50), nullable=True),
        sa.Column("business_model", sa.Text, nullable=True),
        sa.Column("ai_strategy", sa.Text, nullable=True),
        sa.Column("website", sa.String(255), nullable=True),
    )

    op.create_table(
        "region_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("region_iso", sa.String(10), sa.ForeignKey("regions.iso_code"), nullable=False),
        sa.Column("snapshot_month", sa.Date, nullable=False),
        sa.Column("avg_booking_value", sa.Float, nullable=True),
        sa.Column("demand_index", sa.Integer, nullable=True),
        sa.Column("top_routes", postgresql.JSONB, nullable=True),
        sa.Column("demographics", postgresql.JSONB, nullable=True),
    )

    op.create_table(
        "rival_region_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("rival_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("rivals.id"), nullable=False),
        sa.Column("region_iso", sa.String(10), sa.ForeignKey("regions.iso_code"), nullable=False),
        sa.Column("market_share_pct", sa.Float, nullable=True),
        sa.Column("booking_volume", sa.Integer, nullable=True),
        sa.Column("snapshot_month", sa.Date, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("rival_region_snapshots")
    op.drop_table("region_metrics")
    op.drop_table("rivals")
    op.drop_table("regions")
