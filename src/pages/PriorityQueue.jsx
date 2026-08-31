import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { CATEGORY_COLORS } from '../data/mockData';
import {
  getCategoryColor, getRiskColor, getCategoryShort,
  buildReasonString, formatDuration,
} from '../utils/formatters';

const CATEGORIES = Object.keys(CATEGORY_COLORS);
const RISK_TIERS = ['Critical', 'High', 'Moderate', 'Low'];

export default function PriorityQueue() {
  const getFilteredEvents = useStore((s) => s.getFilteredEvents);
  const filters = useStore((s) => s.filters);
  const setFilter = useStore((s) => s.setFilter);
  const resetFilters = useStore((s) => s.resetFilters);
  const selectEvent = useStore((s) => s.selectEvent);
  const selectedEventId = useStore((s) => s.selectedEventId);

  const [confidenceLocal, setConfidenceLocal] = useState(filters.confidenceMin);

  const events = getFilteredEvents();

  const grouped = useMemo(() => {
    const sorted = [...events].sort((a, b) => b.properties.risk_score - a.properties.risk_score);
    return {
      Critical: sorted.filter((e) => e.properties.risk_tier === 'Critical'),
      High: sorted.filter((e) => e.properties.risk_tier === 'High'),
      Moderate: sorted.filter((e) => e.properties.risk_tier === 'Moderate'),
      Low: sorted.filter((e) => e.properties.risk_tier === 'Low'),
    };
  }, [events]);

  const toggleCategory = (cat) => {
    const current = filters.categories;
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setFilter('categories', next);
  };

  const toggleRisk = (tier) => {
    const current = filters.riskTiers;
    const next = current.includes(tier)
      ? current.filter((t) => t !== tier)
      : [...current, tier];
    setFilter('riskTiers', next);
  };

  return (
    <div className="flex h-full bg-[var(--color-surface)]">
      {/* Filter sidebar */}
      <aside className="w-[260px] shrink-0 overflow-y-auto border-r border-[var(--color-border)] bg-white p-5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Confidence threshold */}
        <div>
          <label className="mb-2 block text-[14px] text-[var(--color-text-secondary)]">
            Min Confidence: <span className="font-data font-semibold text-[var(--color-text-primary)]">{confidenceLocal}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={confidenceLocal}
            onChange={(e) => setConfidenceLocal(Number(e.target.value))}
            onMouseUp={() => setFilter('confidenceMin', confidenceLocal)}
            onTouchEnd={() => setFilter('confidenceMin', confidenceLocal)}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-accent)]"
          />
        </div>

        {/* Date range */}
        <div>
          <h3 className="mb-2 text-[14px] text-[var(--color-text-secondary)]">Date Range</h3>
          <div className="flex flex-wrap gap-2">
            {['24H', '7D', '30D'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setFilter('dateRange', range)}
                className={`rounded-[var(--radius-md)] px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                  filters.dateRange === range
                    ? 'bg-[var(--color-accent)] text-[var(--color-text-primary)]'
                    : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Classification checkboxes */}
        <div>
          <h3 className="mb-2 text-[14px] text-[var(--color-text-secondary)]">Classification</h3>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="group flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={filters.categories.length === 0 || filters.categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="sr-only"
                />
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded border-2 transition-colors ${
                    filters.categories.length === 0 || filters.categories.includes(cat)
                      ? 'border-transparent'
                      : 'border-[var(--color-border)]'
                  }`}
                  style={{
                    backgroundColor:
                      filters.categories.length === 0 || filters.categories.includes(cat)
                        ? getCategoryColor(cat)
                        : 'transparent',
                  }}
                >
                  {(filters.categories.length === 0 || filters.categories.includes(cat)) && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="text-[14px] text-[var(--color-text-primary)] group-hover:text-[var(--color-text-primary)]">
                  {getCategoryShort(cat)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Risk tier checkboxes */}
        <div>
          <h3 className="mb-2 text-[14px] text-[var(--color-text-secondary)]">Risk Tier</h3>
          <div className="space-y-2">
            {RISK_TIERS.map((tier) => (
              <label key={tier} className="group flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={filters.riskTiers.length === 0 || filters.riskTiers.includes(tier)}
                  onChange={() => toggleRisk(tier)}
                  className="sr-only"
                />
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded border-2 transition-colors ${
                    filters.riskTiers.length === 0 || filters.riskTiers.includes(tier)
                      ? 'border-transparent'
                      : 'border-[var(--color-border)]'
                  }`}
                  style={{
                    backgroundColor:
                      filters.riskTiers.length === 0 || filters.riskTiers.includes(tier)
                        ? getRiskColor(tier)
                        : 'transparent',
                  }}
                >
                  {(filters.riskTiers.length === 0 || filters.riskTiers.includes(tier)) && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="text-[14px] text-[var(--color-text-primary)]">{tier}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Result count */}
        <div className="mt-auto border-t border-[var(--color-border-subtle)] pt-4">
          <span className="text-[13px] text-[var(--color-text-tertiary)]">
            Showing <span className="font-data font-semibold text-[var(--color-text-primary)]">{events.length}</span> events
          </span>
        </div>
      </aside>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6 p-5">
            {RISK_TIERS.map((tier) => {
              const tierEvents = grouped[tier];
              if (!tierEvents || tierEvents.length === 0) return null;
              return (
                <section key={tier}>
                  <div className="mb-3 flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getRiskColor(tier) }}
                    />
                    <h2 className="text-[14px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                      {tier}
                    </h2>
                    <span className="font-data text-[13px] text-[var(--color-text-tertiary)]">
                      {tierEvents.length}
                    </span>
                  </div>
                  <div className="grid gap-2.5">
                    {tierEvents.map((event) => (
                      <EventCard
                        key={event.properties.id}
                        event={event}
                        isSelected={selectedEventId === event.properties.id}
                        onSelect={() => selectEvent(event.properties.id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, isSelected, onSelect }) {
  const p = event.properties;

  return (
    <button
      onClick={onSelect}
      className={`
        w-full rounded-[var(--radius-lg)] border p-3.5 text-left transition-colors
        ${isSelected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
          : 'border-[var(--color-border)] bg-white hover:border-[var(--color-border)] hover:bg-[var(--color-surface)]'
        }
      `}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-data text-[14px] font-semibold text-[var(--color-text-primary)]">{p.id}</span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[12px] font-semibold text-white"
            style={{ backgroundColor: getCategoryColor(p.category) }}
          >
            {getCategoryShort(p.category)}
          </span>
        </div>
        <span className="font-data text-[13px] text-[var(--color-text-secondary)]">{p.region}</span>
      </div>

      <div className="mb-2 flex items-center gap-2.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${p.risk_score}%`, backgroundColor: getRiskColor(p.risk_tier) }}
          />
        </div>
        <span className="font-data text-[13px] font-semibold" style={{ color: getRiskColor(p.risk_tier) }}>
          {p.risk_score}
        </span>
      </div>

      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {buildReasonString(p.evidence)}
        </span>
        <span className="ml-2 shrink-0 font-data text-[13px] text-[var(--color-text-secondary)]">
          {p.persistence_hours > 48
            ? `${formatDuration(p.persistence_hours)} persistent`
            : `${p.frp} MW FRP`
          }
        </span>
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center px-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-text-primary)] font-medium mb-1">No events match filters</p>
        <p className="text-[14px] text-[var(--color-text-tertiary)]">Try adjusting your confidence threshold or classification filters.</p>
      </div>
    </div>
  );
}
