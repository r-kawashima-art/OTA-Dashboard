"""
Seed script: loads 9 rival OTAs and 30 country regions into the database.
Run from /backend: python ../data/seeds/seed.py
"""
import os
import sys
import uuid

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

    conn.commit()
    cur.execute("SELECT COUNT(*) FROM rivals;")
    rival_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM regions;")
    region_count = cur.fetchone()[0]
    cur.close()
    conn.close()

    print(f"Seeded {rival_count} rivals and {region_count} regions.")
    assert rival_count == 9, f"Expected 9 rivals, got {rival_count}"
    assert region_count == 30, f"Expected 30 regions, got {region_count}"
    print("PASS: seed counts verified.")


if __name__ == "__main__":
    seed()
