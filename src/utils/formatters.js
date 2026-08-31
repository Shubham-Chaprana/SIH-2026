import { CATEGORY_COLORS, RISK_COLORS, CATEGORY_SHORT } from '../data/mockData';

/** Format a risk score as a percentage string */
export function formatRiskScore(score) {
  return `${score}%`;
}

/** Format persistence hours as human-readable duration */
export function formatDuration(hours) {
  if (hours < 1) return '<1h';
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const remaining = Math.round(hours % 24);
  if (remaining === 0) return `${days}d`;
  return `${days}d ${remaining}h`;
}

/** Format ISO timestamp to compact display */
export function formatTimestamp(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffH = diffMs / 3600000;

  if (diffH < 1) return `${Math.round(diffMs / 60000)}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  if (diffH < 168) return `${Math.round(diffH / 24)}d ago`;

  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Format coordinates for display */
export function formatCoords(lat, lng) {
  return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
}

/** Get classification color */
export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Unknown'];
}

/** Get risk tier color */
export function getRiskColor(tier) {
  return RISK_COLORS[tier] || RISK_COLORS['Low'];
}

/** Get short category label */
export function getCategoryShort(category) {
  return CATEGORY_SHORT[category] || category;
}

/** Generate a concise reason string from evidence */
export function buildReasonString(evidence) {
  if (!evidence || evidence.length === 0) return '';
  const top = [...evidence].sort((a, b) => b.weight - a.weight).slice(0, 3);
  return top.map((e) => e.factor.toLowerCase()).join(' + ');
}

/** Clamp a number between min and max */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
