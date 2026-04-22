"""
Seed script: loads 9 rival OTAs, 30 country regions, and KPI metrics into the database.
Run from /backend: python ../data/seeds/seed.py
"""
import json
import os
import random
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

# Phase-3 enrichment: top routes + demographics per region (seeded for a
# curated subset — unseeded regions still render a usable panel from the
# synthesized monthly_demand + rival_ranking).
REGION_TOP_ROUTES: dict[str, list[dict]] = {
    "US": [
        {"route": "New York → Los Angeles", "share_pct": 22.3},
        {"route": "Chicago → Miami", "share_pct": 14.1},
        {"route": "Seattle → Honolulu", "share_pct": 9.6},
    ],
    "GB": [
        {"route": "London → Edinburgh", "share_pct": 18.9},
        {"route": "London → Manchester", "share_pct": 15.4},
        {"route": "London → Dublin", "share_pct": 12.2},
    ],
    "JP": [
        {"route": "Tokyo → Osaka", "share_pct": 24.7},
        {"route": "Tokyo → Sapporo", "share_pct": 13.8},
        {"route": "Tokyo → Okinawa", "share_pct": 11.2},
    ],
    "FR": [
        {"route": "Paris → Nice", "share_pct": 19.4},
        {"route": "Paris → Marseille", "share_pct": 14.6},
        {"route": "Paris → Bordeaux", "share_pct": 10.8},
    ],
    "IN": [
        {"route": "Delhi → Mumbai", "share_pct": 21.1},
        {"route": "Delhi → Bangalore", "share_pct": 16.3},
        {"route": "Mumbai → Goa", "share_pct": 12.4},
    ],
    "DE": [
        {"route": "Frankfurt → Berlin", "share_pct": 17.5},
        {"route": "Munich → Hamburg", "share_pct": 13.1},
        {"route": "Frankfurt → Cologne", "share_pct": 10.9},
    ],
    "AU": [
        {"route": "Sydney → Melbourne", "share_pct": 23.8},
        {"route": "Sydney → Brisbane", "share_pct": 14.2},
        {"route": "Melbourne → Gold Coast", "share_pct": 10.5},
    ],
    "BR": [
        {"route": "São Paulo → Rio de Janeiro", "share_pct": 20.6},
        {"route": "São Paulo → Salvador", "share_pct": 12.9},
        {"route": "Rio → Florianópolis", "share_pct": 9.3},
    ],
    "AE": [
        {"route": "Dubai → London", "share_pct": 18.2},
        {"route": "Dubai → Mumbai", "share_pct": 15.7},
        {"route": "Dubai → Bangkok", "share_pct": 11.4},
    ],
    "SG": [
        {"route": "Singapore → Bangkok", "share_pct": 19.8},
        {"route": "Singapore → Bali", "share_pct": 16.1},
        {"route": "Singapore → Tokyo", "share_pct": 12.7},
    ],
}

# Traveler demographics per region as share percentages. Segments intentionally
# sum to 100 so the Phase-3 donut-logic unit test can assert the invariant.
REGION_DEMOGRAPHICS: dict[str, list[dict]] = {
    "US": [
        {"segment": "Leisure", "share_pct": 58},
        {"segment": "Business", "share_pct": 27},
        {"segment": "VFR", "share_pct": 10},
        {"segment": "Group", "share_pct": 5},
    ],
    "GB": [
        {"segment": "Leisure", "share_pct": 54},
        {"segment": "Business", "share_pct": 29},
        {"segment": "VFR", "share_pct": 12},
        {"segment": "Group", "share_pct": 5},
    ],
    "JP": [
        {"segment": "Leisure", "share_pct": 49},
        {"segment": "Business", "share_pct": 31},
        {"segment": "VFR", "share_pct": 8},
        {"segment": "Group", "share_pct": 12},
    ],
    "FR": [
        {"segment": "Leisure", "share_pct": 62},
        {"segment": "Business", "share_pct": 24},
        {"segment": "VFR", "share_pct": 9},
        {"segment": "Group", "share_pct": 5},
    ],
    "IN": [
        {"segment": "Leisure", "share_pct": 46},
        {"segment": "Business", "share_pct": 28},
        {"segment": "VFR", "share_pct": 19},
        {"segment": "Group", "share_pct": 7},
    ],
    "DE": [
        {"segment": "Leisure", "share_pct": 52},
        {"segment": "Business", "share_pct": 33},
        {"segment": "VFR", "share_pct": 10},
        {"segment": "Group", "share_pct": 5},
    ],
    "AU": [
        {"segment": "Leisure", "share_pct": 61},
        {"segment": "Business", "share_pct": 22},
        {"segment": "VFR", "share_pct": 13},
        {"segment": "Group", "share_pct": 4},
    ],
    "BR": [
        {"segment": "Leisure", "share_pct": 64},
        {"segment": "Business", "share_pct": 20},
        {"segment": "VFR", "share_pct": 12},
        {"segment": "Group", "share_pct": 4},
    ],
    "AE": [
        {"segment": "Leisure", "share_pct": 48},
        {"segment": "Business", "share_pct": 38},
        {"segment": "VFR", "share_pct": 8},
        {"segment": "Group", "share_pct": 6},
    ],
    "SG": [
        {"segment": "Leisure", "share_pct": 51},
        {"segment": "Business", "share_pct": 37},
        {"segment": "VFR", "share_pct": 7},
        {"segment": "Group", "share_pct": 5},
    ],
}

# Map rival HQ country → ISO-alpha-2 for the home-region market-share bonus.
RIVAL_HOME_ISO: dict[str, str] = {
    "Booking.com": "NL",
    "Expedia": "US",
    "Trip.com": "CN",
    "Airbnb": "US",
    "Agoda": "SG",
    "MakeMyTrip": "IN",
    "Kiwi.com": "CZ",
    "Etraveli": "SE",
    "eDreams ODIGEO": "ES",
}

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
                json.dumps(REGION_TOP_ROUTES.get(iso, [])),
                json.dumps(REGION_DEMOGRAPHICS.get(iso, [])),
            )
            for iso, demand_index, avg_booking_value in REGION_METRICS
        ],
    )

    # Rival region snapshots (idempotent: replace the whole snapshot month).
    # Market-share generation: deterministic PRNG with a home-country bonus so
    # MakeMyTrip dominates India, Agoda dominates APAC, etc. Shares are
    # normalized so the top-N rivals cover ~80% of the market (the remainder
    # represents long-tail/local operators that aren't tracked here).
    cur.execute(
        "DELETE FROM rival_region_snapshots WHERE snapshot_month = %s",
        (SNAPSHOT_MONTH,),
    )
    rng = random.Random(42)

    cur.execute("SELECT id, name FROM rivals;")
    rival_by_name = {name: rid for rid, name in cur.fetchall()}

    snapshot_rows: list[tuple] = []
    for iso, _, _ in REGION_METRICS:
        # Each region picks 5–7 of the 9 rivals to "operate" in it
        active_rivals = rng.sample(list(RIVAL_HOME_ISO.keys()), k=rng.randint(5, 7))
        raw_scores = []
        for name in active_rivals:
            base = rng.uniform(3, 10)
            if RIVAL_HOME_ISO[name] == iso:
                base *= 4.0  # strong home-country bias
            raw_scores.append(base)
        total = sum(raw_scores)
        # Normalize to sum to 80% of market; remaining 20% is unmodeled competition.
        for name, score in zip(active_rivals, raw_scores):
            share = round(score / total * 80.0, 2)
            booking_volume = int(share * 15_000)  # plausible booking volume
            snapshot_rows.append(
                (
                    str(uuid.uuid4()),
                    rival_by_name[name],
                    iso,
                    share,
                    booking_volume,
                    SNAPSHOT_MONTH,
                )
            )

    execute_values(
        cur,
        """
        INSERT INTO rival_region_snapshots
            (id, rival_id, region_iso, market_share_pct, booking_volume, snapshot_month)
        VALUES %s
        """,
        snapshot_rows,
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
    cur.execute(
        "SELECT COUNT(*) FROM rival_region_snapshots WHERE snapshot_month = %s",
        (SNAPSHOT_MONTH,),
    )
    snapshot_count = cur.fetchone()[0]
    cur.close()
    conn.close()

    print(
        f"Seeded {rival_count} rivals, {region_count} regions, "
        f"{metrics_count} region_metrics, {snapshot_count} rival_region_snapshots."
    )
    assert rival_count == 9, f"Expected 9 rivals, got {rival_count}"
    assert region_count == 30, f"Expected 30 regions, got {region_count}"
    assert metrics_count == 30, f"Expected 30 region_metrics, got {metrics_count}"
    assert snapshot_count >= 150, f"Expected ≥150 rival_region_snapshots, got {snapshot_count}"
    print("PASS: seed counts verified.")


if __name__ == "__main__":
    seed()
