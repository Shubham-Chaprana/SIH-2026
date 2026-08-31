export default function EvidenceCard({ evidence }) {
  const { factor, weight, note } = evidence;
  const pct = Math.round(weight * 100);

  return (
    <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{factor}</span>
        <span className="font-data text-[12px] text-[var(--color-text-secondary)]">{pct}%</span>
      </div>
      <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mb-2">{note}</p>
      <div className="w-full h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
