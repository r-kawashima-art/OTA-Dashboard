import type { Rival } from "../api";

interface Props {
  rival: Rival;
  onClose: () => void;
}

export function RivalCard({ rival, onClose }: Props) {
  const categoryColor: Record<string, string> = {
    B2C: "#3b82f6",
    B2B: "#8b5cf6",
    budget: "#10b981",
    luxury: "#f59e0b",
  };
  const color = categoryColor[rival.category] ?? "#6b7280";

  return (
    <div className="rival-card">
      <button className="rival-card-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="rival-card-header">
        <span className="rival-name">{rival.name}</span>
        <span className="rival-badge" style={{ background: color }}>{rival.category}</span>
      </div>
      <div className="rival-meta">
        <span>🏢 {rival.hq_country}</span>
        {rival.market_share_pct !== undefined && (
          <span>📊 {rival.market_share_pct.toFixed(1)}% share</span>
        )}
        {rival.booking_volume !== undefined && (
          <span>🎫 {(rival.booking_volume / 1_000_000).toFixed(1)}M bookings</span>
        )}
      </div>
      <p className="rival-model">{rival.business_model}</p>
      {rival.ai_strategy && (
        <div className="rival-ai">
          <strong>AI Strategy:</strong>
          <p>{rival.ai_strategy}</p>
        </div>
      )}
      {rival.website && (
        <a className="rival-link" href={rival.website} target="_blank" rel="noreferrer">
          Visit website ↗
        </a>
      )}
    </div>
  );
}
