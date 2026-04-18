# User Story and Requirements

## User Story

**As a** president of an Online Travel Agency (OTA)
**I want to** have a world-map based dashboard to analyze rival companies and characteristics of each region
**So that** I can make informed decisions about keep up with the evolution of the traveling industry and what strategies to implement.

---

## Functional Requirements

### FR-01: Interactive World Map

- Display a zoomable, pannable world map as the primary interface.
- Color-code regions based on a selectable KPI (e.g., market size, competitor density, demand index).
- Show country/region boundaries with tooltips on hover.

### FR-02: Rival Company Overlay

- Plot rival OTA companies as markers on the map based on their primary operating region(s).
- Display a summary card per rival on click: company name, headquarter country, estimated market share, key products/services.
- Allow filtering rivals by category (e.g., budget, luxury, B2B, B2C).
- Display a **ranking** of rivals by market share in the selected region.
- Explain each company's business model and **strategy**, especially AI-driven features.

Example of rival companies:

- Booking.com
- Expedia
- Trip.com
- Airbnb
- Agoda
- MakeMyTrip
- kiwi.com
- etraveli
- eDream ODIGEO

### FR-03: Regional Characteristics Panel

On selecting a region, display a side panel with:

- Top travel destinations and routes.
- Seasonal demand trends (monthly chart).
- Average booking value and traveler demographics.
- Dominant rival players in that region with the ranking.

### FR-04: KPI Dashboard Header

- Show global summary KPIs at the top: total addressable markets covered, number of tracked rivals, hottest-growth region.
- KPIs must update dynamically when filters are applied.

### FR-05: Comparison View

- Allow the president to select up to 3 regions and render a side-by-side comparison table of key metrics.

### FR-06: Time-Period Filter

- Provide a date-range selector (yearly granularity minimum) to analyze historical trends per region and rival.

---

## Non-functional Requirements

### NFR-01: Data Freshness

- Market and competitor data must be refreshed at least monthly via automated ingestion pipelines.
- A "last updated" timestamp must be visible on the dashboard.

### NFR-02: Scalability

- The system must support tracking up to 500 rival companies and data for all 195 UN-recognized countries without degradation.

---

## Acceptance Criteria

### ToDo

- [ ] World map renders with region color-coding based on at least one KPI.
- [ ] At least 10 rival companies are plotted and clickable on the map.
- [ ] Regional characteristics panel displays demand trend chart and top rivals for any selected region.
- [ ] Time-period filter correctly updates all visualizations.
- [ ] Comparison view renders side-by-side metrics for 2–3 selected regions.
- [ ] CSV export produces a valid, formatted file for any selected region dataset.
- [ ] Page load time is verified to be under 3 seconds in a performance test.
- [ ] Access is blocked for unauthenticated users.
