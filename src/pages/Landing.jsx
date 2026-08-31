import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Lazy load the 3D globe to avoid blocking initial paint
const GlobeCanvas = lazy(() => import('../components/landing/GlobeCanvas'));

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FAFAF8] via-white to-[#F5F0E6]">
      {/* Hero Section */}
      <section className="mx-auto grid w-full min-h-[90vh] max-w-7xl items-center gap-8 px-8 py-12 lg:grid-cols-[1.08fr_0.92fr]">
        {/* Left: Hero Text */}
        <motion.div
          className="flex min-w-0 flex-col justify-center"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-md shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h1 className="text-[clamp(2.8rem,5vw,4.8rem)] font-bold tracking-[-0.06em] text-[var(--color-text-primary)] leading-[0.95]">
              THERMOS
            </h1>
          </div>

          <p className="mb-4 max-w-[36rem] text-[clamp(1.08rem,1.8vw,1.5rem)] font-medium leading-[1.35] text-[var(--color-text-secondary)]">
            Satellite Thermal Intelligence for Industrial Fire Detection
          </p>

          <p className="mb-8 max-w-[42rem] text-[17px] leading-[1.6] text-[var(--color-text-secondary)]">
            NASA FIRMS detects thermal anomalies from satellites. THERMOS classifies what they actually are — industrial fires, gas flares, wildfires, or agricultural burning — with confidence scores and risk analysis in one operational dashboard.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex max-w-xs items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent)] px-6 py-3 font-semibold text-[var(--color-text-primary)] shadow-sm transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-md"
          >
            Enter Dashboard
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>

        {/* Right: 3D Globe */}
        <motion.div
          className="h-[500px] min-w-0 overflow-hidden rounded-[var(--radius-xl)] shadow-lg"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Suspense
            fallback={
              <div className="w-full h-full bg-gradient-to-br from-[#F5F0E6] to-[#E8E0D0] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin mx-auto mb-3" />
                  <p className="text-[14px] text-[var(--color-text-tertiary)]">Loading globe…</p>
                </div>
              </div>
            }
          >
            <GlobeCanvas />
          </Suspense>
        </motion.div>
      </section>

      {/* Problem Section: 3 Cards */}
      <section className="px-8 py-16 bg-white/50">
        <motion.div
          className="max-w-6xl mx-auto grid grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div
            variants={item}
            className="p-6 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Raw Thermal Points</h3>
            <p className="text-sm text-[var(--color-text-tertiary)]">NASA FIRMS gives raw coordinates of heat from space. No context — just lat/lng.</p>
          </motion.div>

          <motion.div
            variants={item}
            className="p-6 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M15 9l-6 6m0-6l6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">No Classification</h3>
            <p className="text-sm text-[var(--color-text-tertiary)]">A refinery flare looks the same as a wildfire. Operators can't tell the difference.</p>
          </motion.div>

          <motion.div
            variants={item}
            className="p-6 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">THERMOS Solves It</h3>
            <p className="text-sm text-[var(--color-text-tertiary)]">AI + satellite context classifies every anomaly with confidence. Risk ranking for fast dispatch.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works: Vertical Flow */}
      <section className="px-8 py-20">
        <div className="mx-auto mb-16 w-full max-w-4xl text-center">
          <h2 className="mx-auto mb-3 max-w-[18ch] text-[clamp(2.2rem,3vw,3.4rem)] font-bold tracking-[-0.05em] text-[var(--color-text-primary)] leading-[1.05]">
            How It Works
          </h2>
          <p className="mx-auto max-w-[30rem] text-center text-[17px] leading-[1.6] text-[var(--color-text-secondary)]" style={{ textWrap: 'balance' }}>
            Four steps from satellite to operational intelligence
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-0">
          {[
            {
              step: 'Satellite Detection',
              desc: 'NASA FIRMS ingests thermal anomalies every 10–20 minutes from SNPP, NOAA-20, Aqua, Terra, and Sentinel-2.',
              icon: '🛰️',
            },
            {
              step: 'Context Enrichment',
              desc: 'Cross-reference with OSM industrial polygons, ESA land-cover classes, and population density buffers.',
              icon: '🗺️',
            },
            {
              step: 'AI Classification',
              desc: 'Machine learning ensemble (XGBoost + ViT) classifies as industrial, wildfire, agricultural, or gas flare.',
              icon: '🧠',
            },
            {
              step: 'Risk & Investigation',
              desc: 'Risk score ranks priority. Evidence cards explain the classification. Full thermal history on every event.',
              icon: '📊',
            },
          ].map((block, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Connecting line (except last) */}
              {i < 3 && (
                <motion.div
                  className="mx-auto w-1 h-12 bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-border)]"
                  initial={{ opacity: 0, scaleY: 0 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 + 0.1 }}
                />
              )}

              {/* Step Card */}
              <div className="flex flex-col items-center text-center py-8">
                <div className="text-4xl mb-4">{block.icon}</div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{block.step}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-sm leading-relaxed">{block.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-white/50 px-8 py-12 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--color-text-tertiary)]">Data & Tech</span>
            <div className="flex gap-3">
              <span className="px-2.5 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--color-text-secondary)] font-data">
                NASA FIRMS
              </span>
              <span className="px-2.5 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--color-text-secondary)] font-data">
                OpenStreetMap
              </span>
              <span className="px-2.5 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--color-text-secondary)] font-data">
                ESA WorldCover
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
            <span>SIH 2026 · Team THERMOS</span>
            <a href="https://github.com" className="hover:text-[var(--color-text-primary)] transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
