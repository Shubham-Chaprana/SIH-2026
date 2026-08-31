import { useStore } from '../store/useStore';
import { aggregateStats, sortedByRisk, RISK_COLORS } from '../data/mockData';
import {
  getCategoryColor, getRiskColor, getCategoryShort, buildReasonString,
  formatDuration,
} from '../utils/formatters';
import MapView from '../components/map/MapView';

export default function CommandCentre() {
  const timeRange = useStore((s) => s.timeRange);
  const setTimeRange = useStore((s) => s.setTimeRange);
  const selectEvent = useStore((s) => s.selectEvent);
  const selectedEventId = useStore((s) => s.selectedEventId);

  const topEvents = sortedByRisk.slice(0, 6);

  return (
    <div className="flex flex-col h-full">
      {/* Main content: map + priority sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Map area — 65-70% */}
        <div className="flex-1 min-w-0 min-h-[420px] relative">
          <MapView />
        </div>

        {/* Right: Priority Events */}
        <div className="w-[280px] border-l border-[var(--color-border)] bg-white flex flex-col shrink-0">
          <div className="px-3 py-2.5 border-b border-[var(--color-border)]">
            <h2 className="text-[14px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Priority Events
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {topEvents.map((event) => {
              const p = event.properties;
              const isSelected = selectedEventId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => selectEvent(p.id)}
                  className={`
                    w-full text-left px-3 py-2.5 border-b border-[var(--color-border-subtle)]
                    transition-colors hover:bg-[var(--color-surface)]
                    ${isSelected ? 'bg-[var(--color-accent-subtle)]' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-data text-[13px] font-semibold text-[var(--color-text-primary)]">
                      {p.id}
                    </span>
                    <span
                      className="px-1.5 py-0.5 text-[12px] font-semibold rounded text-white"
                      style={{ backgroundColor: getRiskColor(p.risk_tier) }}
                    >
                      {p.risk_score}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColor(p.category) }}
                    />
                    <span className="text-[13px] text-[var(--color-text-primary)] truncate">
                      {getCategoryShort(p.category)}
                    </span>
                    <span className="text-[13px] text-[var(--color-text-tertiary)]">·</span>
                    <span className="text-[13px] text-[var(--color-text-secondary)] truncate">
                      {p.region}
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--color-text-tertiary)] truncate">
                    {buildReasonString(p.evidence)}
                    {p.persistence_hours > 48 && ` · ${formatDuration(p.persistence_hours)} persistent`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom strip: stats + time range */}
      <div className="h-[42px] border-t border-[var(--color-border)] bg-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-5">
          <StatChip label="Total Events" value={aggregateStats.total} />
          <StatChip label="Critical" value={aggregateStats.critical} color={RISK_COLORS.Critical} />
          <StatChip label="High" value={aggregateStats.high} color={RISK_COLORS.High} />
          <StatChip label="Persistent" value={aggregateStats.persistent} color="#D97706" />
        </div>

        <div className="flex items-center gap-0.5 bg-[var(--color-surface)] p-0.5 rounded-[var(--radius-md)] border border-[var(--color-border)]">
          {['24H', '7D', '30D'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`
                px-2.5 py-1 text-[13px] font-medium rounded-[var(--radius-sm)] transition-colors
                ${timeRange === range
                  ? 'bg-[var(--color-accent)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }
              `}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12px] text-[var(--color-text-tertiary)]">{label}</span>
      <span
        className="font-data text-sm font-semibold"
        style={{ color: color || 'var(--color-text-primary)' }}
      >
        {value}
      </span>
    </div>
  );
}
