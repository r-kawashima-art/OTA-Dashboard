import { useCallback, useEffect, useRef, useState } from "react";
import Map, {
  Source,
  Layer,
  type MapRef,
  type MapLayerMouseEvent,
  Marker,
  Popup,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { api, type Rival } from "../api";
import { useDashboard } from "../store";
import { demandColor, demandOpacity } from "../utils/colorScale";
import { RivalCard } from "./RivalCard";

// Public token — read-only, scoped to this prototype
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

// Seed demand index map for choropleth coloring (mirrors backend seed data)
const DEMAND_INDEX: Record<string, number> = {
  US: 92, GB: 85, DE: 80, CN: 95, JP: 88, IN: 86, AU: 76,
  AE: 89, SG: 84, FR: 82, ES: 87, BR: 72,
};

// Approximate centroids for rival HQ countries (used as marker positions)
const HQ_COORDS: Record<string, [number, number]> = {
  Netherlands: [4.9, 52.4],
  USA: [-95.7, 37.1],
  China: [104.2, 35.9],
  Singapore: [103.8, 1.4],
  India: [78.9, 20.6],
  Australia: [133.8, -25.3],
  "Czech Republic": [15.5, 49.8],
  Sweden: [18.6, 60.1],
  Spain: [-3.7, 40.4],
};

export function WorldMap() {
  const mapRef = useRef<MapRef>(null);
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [rivals, setRivals] = useState<Rival[]>([]);
  const [activeRival, setActiveRival] = useState<Rival | null>(null);

  const { selectedRegion, setSelectedRegion, year, categoryFilter } = useDashboard((s) => ({
    selectedRegion: s.selectedRegion,
    setSelectedRegion: s.setSelectedRegion,
    year: s.year,
    categoryFilter: s.categoryFilter,
  }));

  useEffect(() => {
    api.rivals({ year }).then(setRivals).catch(console.error);
  }, [year]);

  const visibleRivals = categoryFilter
    ? rivals.filter((r) => r.category === categoryFilter)
    : rivals;

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feat = e.features?.[0];
      if (!feat) return;
      const iso = feat.properties?.["ISO_A2"] as string;
      if (iso && iso !== "-99") setSelectedRegion(iso === selectedRegion ? null : iso);
    },
    [selectedRegion, setSelectedRegion]
  );

  const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const feat = e.features?.[0];
    setHoveredIso(feat?.properties?.["ISO_A2"] ?? null);
  }, []);

  const handleMouseLeave = useCallback(() => setHoveredIso(null), []);

  // Build fill-color expression for choropleth
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fillColorExpression: any = [
    "match",
    ["get", "ISO_A2"],
    ...Object.entries(DEMAND_INDEX).flatMap(([iso, idx]) => [iso, demandColor(idx)]),
    "#e5e7eb",
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fillOpacityExpression: any = [
    "case",
    ["==", ["get", "ISO_A2"], selectedRegion ?? ""],
    0.9,
    ["==", ["get", "ISO_A2"], hoveredIso ?? ""],
    0.75,
    0.4,
  ];

  if (!MAPBOX_TOKEN) {
    return (
      <div className="map-placeholder">
        <p>⚠ Set <code>VITE_MAPBOX_TOKEN</code> in <code>frontend/.env</code> to enable the map.</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: 15, latitude: 20, zoom: 1.6 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactiveLayerIds={["countries-fill"]}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Source
          id="countries"
          type="vector"
          url="mapbox://mapbox.country-boundaries-v1"
        >
          <Layer
            id="countries-fill"
            type="fill"
            source-layer="country_boundaries"
            paint={{
              "fill-color": fillColorExpression,
              "fill-opacity": fillOpacityExpression,
            }}
          />
          <Layer
            id="countries-line"
            type="line"
            source-layer="country_boundaries"
            paint={{ "line-color": "#374151", "line-width": 0.5 }}
          />
        </Source>

        {/* Rival HQ markers */}
        {visibleRivals.map((rival) => {
          const coords = HQ_COORDS[rival.hq_country];
          if (!coords) return null;
          return (
            <Marker
              key={rival.id}
              longitude={coords[0]}
              latitude={coords[1]}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setActiveRival(rival.id === activeRival?.id ? null : rival);
              }}
            >
              <div className="rival-marker" title={rival.name}>
                {rival.name.charAt(0)}
              </div>
            </Marker>
          );
        })}

        {/* Active rival popup */}
        {activeRival && HQ_COORDS[activeRival.hq_country] && (
          <Popup
            longitude={HQ_COORDS[activeRival.hq_country][0]}
            latitude={HQ_COORDS[activeRival.hq_country][1]}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => setActiveRival(null)}
            maxWidth="340px"
          >
            <RivalCard rival={activeRival} onClose={() => setActiveRival(null)} />
          </Popup>
        )}
      </Map>

      {/* Hover tooltip */}
      {hoveredIso && DEMAND_INDEX[hoveredIso] !== undefined && (
        <div className="map-tooltip">
          {hoveredIso} — Demand Index: {DEMAND_INDEX[hoveredIso]}
        </div>
      )}

      {/* Legend */}
      <div className="map-legend">
        <span style={{ background: demandColor(0) }} />Low
        <span style={{ background: demandColor(50) }} />Mid
        <span style={{ background: demandColor(100) }} />High
      </div>
    </div>
  );
}
