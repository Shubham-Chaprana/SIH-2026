import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import {
  formatDuration, formatTimestamp, formatCoords,
  getCategoryColor, getRiskColor, getCategoryShort,
} from '../../utils/formatters';
import EventHistoryChart from './EventHistoryChart';
import EvidenceCard from './EvidenceCard';
import AskThermos from './AskThermos';

export default function IncidentDetailDrawer() {
  const drawerOpen = useStore((s) => s.drawerOpen);
  const getSelectedEvent = useStore((s) => s.getSelectedEvent);
  const clearSelection = useStore((s) => s.clearSelection);

  const event = getSelectedEvent();
  const p = event?.properties;

  return (
    <AnimatePresence>
      {drawerOpen && p && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/10 z-40"
            onClick={clearSelection}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-[420px] max-w-[90vw] bg-white border-l border-[var(--color-border)] z-50 flex flex-col overflow-hidden shadow-lg"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)] shrink-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-data text-sm font-semibold text-[var(--color-text-primary)]">
                    {p.id}
                  </span>
                  <span
                    className="px-2 py-0.5 text-[12px] font-semibold rounded-full text-white"
                    style={{ backgroundColor: getCategoryColor(p.category) }}
                  >
                    {getCategoryShort(p.category)}
                  </span>
                </div>
                <button
                  onClick={clearSelection}
                  className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-secondary)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Risk + confidence row */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-[var(--color-text-secondary)]">Risk</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-24 h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${p.risk_score}%`,
                          backgroundColor: getRiskColor(p.risk_tier),
                        }}
                      />
                    </div>
                    <span className="font-data text-[14px] font-semibold" style={{ color: getRiskColor(p.risk_tier) }}>
                      {p.risk_score}
                    </span>
                    <span
                      className="px-1.5 py-0.5 text-[12px] font-semibold rounded text-white"
                      style={{ backgroundColor: getRiskColor(p.risk_tier) }}
                    >
                      {p.risk_tier}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] text-[var(--color-text-secondary)]">Conf.</span>
                  <span className="font-data text-[14px] font-semibold text-[var(--color-text-primary)]">{p.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                <MetaItem label="Location" value={p.region} />
                <MetaItem label="Coordinates" value={formatCoords(p.lat, p.lng)} mono />
                <MetaItem label="First Detected" value={formatTimestamp(p.first_detected)} />
                <MetaItem label="Persistence" value={formatDuration(p.persistence_hours)} mono />
                <MetaItem label="Observations" value={p.observation_count} mono />
                <MetaItem label="Land Cover" value={p.land_cover} />
                <MetaItem label="FRP" value={`${p.frp} MW`} mono />
                <MetaItem label="Brightness" value={`${p.brightness_temp} K`} mono />
              </div>

              {/* WHY THIS CLASSIFICATION */}
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2.5">
                  Why This Classification
                </h3>
                <div className="space-y-2">
                  {p.evidence.map((e, i) => (
                    <EvidenceCard key={i} evidence={e} />
                  ))}
                </div>
              </div>

              {/* Event history chart */}
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2.5">
                  Thermal History
                </h3>
                <EventHistoryChart event={event} />
              </div>
            </div>

            {/* Bottom: Ask THERMOS */}
            <AskThermos eventId={p.id} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function MetaItem({ label, value, mono }) {
  return (
    <div>
      <span className="block mb-0.5 text-[12px] text-[var(--color-text-tertiary)]">{label}</span>
      <span className={`text-sm text-[var(--color-text-primary)] ${mono ? 'font-data' : ''}`}>
        {value}
      </span>
    </div>
  );
}
