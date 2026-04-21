"""
Seed script: loads 9 rival OTAs, 30 country regions, and KPI metrics into the database.
Run from /backend: python ../data/seeds/seed.py
"""
import os
import sys
import uuid
from datetime import date

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

import psycopg2
from psycopg2.extras import execute_values

DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://ota:ota_secret@localhost:5432/ota_worldmap",
)

RIVALS = [
    {
        "id": str(uuid.uuid4()),
        "name": "Booking.com",
        "hq_country": "Netherlands",
        "category": "B2C",
        "business_model": "Online hotel and accommodation marketplace; merchant and agency models.",
        "ai_strategy": "AI-powered pricing, personalised search, and generative travel assistants.",
        "website": "https://www.booking.com",
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Expedia",
        "hq_country": "United States",
        "category": "B2C",
        "business_model": "Full-service OTA covering flights, hotels, cars, and packages.",
        "ai_strategy": "Conversational AI trip-planning (Romie), dynamic packaging via ML.",
        "website": "https://www.expedia.com",
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Trip.com",
        "hq_country": "China",
        "category": "B2C",
        "business_model": "Asia-first full-service OTA; expanding globally through acquisitions.",
        "ai_strategy": "TripGenie AI assistant; demand-forecasting for flash sales.",
        "website": "https://www.trip.com",
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Airbnb",
        "hq_country": "United States",
        "category": "B2C",
        "business_model": "P2P short-term rental marketplace; host + guest fee model.",
        "ai_strategy": "AI-generated listings, smart pricing for hosts, experience recommendations.",
        "website": "https://www.airbnb.com",
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Agoda",
        "hq_country": "Singapore",
        "category": "B2C",
        "business_model": "Asia-Pacific hotel specialist; part of Booking Holdings.",
        "ai_strategy": "ML-driven competitive rate parity; personalised deal engine.",
        "website": "https://www.agoda.com",
    },
    {
        "id": str(uuid.uuid4()),
        "name": "MakeMyTrip",
        "hq_country": "India",
        "category": "B2C",
        "business_model": "Indian full-service OTA dominating domestic flights and hotels.",
        "ai_strategy": "AI chatbot for support; predictive fare alerts.",
        "website": "https://www.makemytrip.com",
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Kiwi.com",
        "hq_country": "Czech Republic",
        "category": "B2C",
        "business_model": "Virtual interlining — combining tickets across carriers into one booking.",
        "ai_strategy": "Graph-based route optimisation; AI disruption management.",
        "website": "https://www.kiwi.com",
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Etraveli",
        "hq_country": "Sweden",
        "category": "B2C",
        "business_model": "Flight-first OTA with strong European presence; white-label B2B.",
        "ai_strategy": "Dynamic ancillary upsell using ML models.",
        "website": "https://www.etraveli.com",
    },
    {
        "id": str(uuid.uuid4()),
        "name": "eDreams ODIGEO",
        "hq_country": "Spain",
        "category": "B2C",
        "business_model": "Subscription-based OTA (Prime programme); flights & hotels.",
        "ai_strategy": "AI subscription churn prevention; personalised offer engine.",
        "website": "https://www.edreams.com",
    },
]

COUNTRIES = [
    ("US", "United States", "Americas"),
    ("GB", "United Kingdom", "Europe"),
    ("DE", "Germany", "Europe"),
    ("FR", "France", "Europe"),
    ("JP", "Japan", "Asia"),
    ("CN", "China", "Asia"),
    ("IN", "India", "Asia"),
    ("AU", "Australia", "Oceania"),
    ("BR", "Brazil", "Americas"),
    ("CA", "Canada", "Americas"),
    ("MX", "Mexico", "Americas"),
    ("ES", "Spain", "Europe"),
    ("IT", "Italy", "Europe"),
    ("NL", "Netherlands", "Europe"),
    ("SE", "Sweden", "Europe"),
    ("CZ", "Czech Republic", "Europe"),
    ("SG", "Singapore", "Asia"),
    ("TH", "Thailand", "Asia"),
    ("ID", "Indonesia", "Asia"),
    ("KR", "South Korea", "Asia"),
    ("AE", "United Arab Emirates", "Asia"),
    ("SA", "Saudi Arabia", "Asia"),
    ("ZA", "South Africa", "Africa"),
    ("NG", "Nigeria", "Africa"),
    ("EG", "Egypt", "Africa"),
    ("AR", "Argentina", "Americas"),
    ("TR", "Turkey", "Europe"),
    ("PL", "Poland", "Europe"),
    ("PT", "Portugal", "Europe"),
    ("GR", "Greece", "Europe"),
]

# KPI snapshot for the latest month. Demand index is a 0-100 score
# (travel intent proxy); avg booking value is USD per reservation.
SNAPSHOT_MONTH = date(2026, 4, 1)
REGION_METRICS = [
    ("US", 92, 412.50),
    ("GB", 78, 298.10),
    ("DE", 71, 275.40),
    ("FR", 83, 320.75),
    ("JP", 81, 355.90),
    ("CN", 86, 240.60),
    ("IN", 74, 165.20),
    ("AU", 68, 390.00),
    ("BR", 62, 185.30),
    ("CA", 70, 342.80),
    ("MX", 65, 210.45),
    ("ES", 79, 268.90),
    ("IT", 77, 289.50),
    ("NL", 72, 305.60),
    ("SE", 64, 330.25),
    ("CZ", 58, 198.70),
    ("SG", 75, 405.10),
    ("TH", 82, 172.30),
    ("ID", 69, 148.90),
    ("KR", 73, 285.70),
    ("AE", 80, 450.20),
    ("SA", 55, 295.80),
    ("ZA", 52, 215.40),
    ("NG", 48, 158.90),
    ("EG", 60, 188.20),
    ("AR", 57, 175.60),
    ("TR", 66, 205.30),
    ("PL", 61, 190.80),
    ("PT", 72, 245.50),
    ("GR", 76, 260.40),
]


def seed():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    # Regions
    execute_values(
        cur,
        "INSERT INTO regions (iso_code, name, continent) VALUES %s ON CONFLICT DO NOTHING",
        COUNTRIES,
    )

    # Rivals
    execute_values(
        cur,
        """
        INSERT INTO rivals (id, name, hq_country, category, business_model, ai_strategy, website)
        VALUES %s ON CONFLICT DO NOTHING
        """,
        [
            (
                r["id"], r["name"], r["hq_country"], r["category"],
                r["business_model"], r["ai_strategy"], r["website"],
            )
            for r in RIVALS
        ],
    )

    # Region metrics (idempotent: replace the snapshot for the seeded month)
    cur.execute(
        "DELETE FROM region_metrics WHERE snapshot_month = %s",
        (SNAPSHOT_MONTH,),
    )
    execute_values(
        cur,
        """
        INSERT INTO region_metrics
            (id, region_iso, snapshot_month, avg_booking_value, demand_index, top_routes, demographics)
        VALUES %s
        """,
        [
            (
                str(uuid.uuid4()),
                iso,
                SNAPSHOT_MONTH,
                avg_booking_value,
                demand_index,
                None,
                None,
            )
            for iso, demand_index, avg_booking_value in REGION_METRICS
        ],
    )

    conn.commit()
    cur.execute("SELECT COUNT(*) FROM rivals;")
    rival_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM regions;")
    region_count = cur.fetchone()[0]
    cur.execute(
        "SELECT COUNT(*) FROM region_metrics WHERE snapshot_month = %s",
        (SNAPSHOT_MONTH,),
    )
    metrics_count = cur.fetchone()[0]
    cur.close()
    conn.close()

    print(f"Seeded {rival_count} rivals, {region_count} regions, {metrics_count} region_metrics.")
    assert rival_count == 9, f"Expected 9 rivals, got {rival_count}"
    assert region_count == 30, f"Expected 30 regions, got {region_count}"
    assert metrics_count == 30, f"Expected 30 region_metrics, got {metrics_count}"
    print("PASS: seed counts verified.")


if __name__ == "__main__":
    seed()
