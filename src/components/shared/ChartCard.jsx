export default function ChartCard({ title, children, span }) {
  return (
    <div
      className={`
        bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 shadow-[0_1px_0_rgba(17,24,39,0.02)]
        ${span === 'full' ? 'xl:col-span-2' : ''}
      `}
    >
      <h3 className="mb-4 text-[15px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
        {title}
      </h3>
      {children}
    </div>
  );
}
