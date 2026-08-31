import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

export default function TopBar() {
  const [lastSync, setLastSync] = useState(new Date());
  const searchQuery = useStore((s) => s.filters.searchQuery);
  const setFilter = useStore((s) => s.setFilter);

  // Simulate live sync pulse
  useEffect(() => {
    const interval = setInterval(() => setLastSync(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const formatSync = (d) => {
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <header className="flex items-center justify-between h-[60px] px-4 bg-white/95 border-b border-[var(--color-border)] shrink-0 backdrop-blur-sm">
      {/* Left: product name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-[1.05rem] font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
            THERMOS
          </span>
        </div>

        {/* Live status */}
        <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-[var(--color-border)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-status-live)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-status-live)]"></span>
          </span>
          <span className="text-[12px] text-[var(--color-text-secondary)] font-data">
            LIVE · {formatSync(lastSync)}
          </span>
        </div>
      </div>

      {/* Center: search */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search events, regions, IDs…"
            value={searchQuery}
            onChange={(e) => setFilter('searchQuery', e.target.value)}
            className="w-full h-9 pl-8 pr-3 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
          />
        </div>
      </div>

      {/* Right: meta */}
      <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-secondary)]">
        <span className="font-data">NASA FIRMS v2</span>
        <div className="w-px h-4 bg-[var(--color-border)]" />
        <span className="font-data">SIH 2026</span>
      </div>
    </header>
  );
}
