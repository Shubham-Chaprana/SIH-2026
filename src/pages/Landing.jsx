import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Lazy load the 3D globe to avoid blocking initial paint
const GlobeCanvas = lazy(() => import('../components/landing/GlobeCanvas'));

// Custom SVG Icons matching hero lightning bolt stroke language (2.2px stroke, rounded)
function SatelliteIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function ContextLayersIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function AIClassificationIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="15" x2="23" y2="15" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="15" x2="4" y2="15" />
    </svg>
  );
}

function RiskRadarIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function Landing() {
  const steps = [
    {
      num: '01',
      step: 'Satellite Detection',
      desc: 'NASA FIRMS ingests thermal anomalies every 10–20 minutes from SNPP, NOAA-20, Aqua, Terra, and Sentinel-2.',
      icon: SatelliteIcon,
    },
    {
      num: '02',
      step: 'Context Enrichment',
      desc: 'Cross-reference with OpenStreetMap industrial polygons, ESA land-cover classes, and population density buffers.',
      icon: ContextLayersIcon,
    },
    {
      num: '03',
      step: 'AI Classification',
      desc: 'Machine learning ensemble (XGBoost + ViT) classifies as industrial, wildfire, agricultural, or gas flare.',
      icon: AIClassificationIcon,
    },
    {
      num: '04',
      step: 'Risk & Investigation',
      desc: 'Risk score ranks priority. Evidence cards explain the classification. Full thermal history on every event.',
      icon: RiskRadarIcon,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FAFAF8] via-white to-[#F5F0E6] text-[var(--color-text-primary)]">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[var(--color-border)] transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-[19px] font-bold tracking-[-0.04em] text-[#1A1A17]">
                THERMOS
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-data">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              FIRMS Live Feed
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#4A4A43]">
            <a href="#overview" className="hover:text-[#1A1A17] transition-colors">
              Overview
            </a>
            <a href="#problem" className="hover:text-[#1A1A17] transition-colors">
              Problem
            </a>
            <a href="#how-it-works" className="hover:text-[#1A1A17] transition-colors">
              How It Works
            </a>
            <Link to="/analytics" className="hover:text-[#1A1A17] transition-colors">
              Analytics
            </Link>
            <Link to="/intelligence" className="hover:text-[#1A1A17] transition-colors">
              Intelligence
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex text-[13px] font-medium text-[#4A4A43] hover:text-[#1A1A17] transition-colors px-2 py-1"
            >
              GitHub
            </a>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-[13.5px] font-semibold text-[#1A1A17] shadow-xs hover:bg-[var(--color-accent-hover)] hover:shadow-sm active:scale-95 transition-all"
            >
              <span>Launch Dashboard</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section id="overview" className="mx-auto grid w-full min-h-[82vh] max-w-7xl items-center gap-10 px-6 py-12 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        {/* Left: Hero Text */}
        <motion.div
          className="flex min-w-0 flex-col justify-center"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-[var(--color-accent)] flex items-center justify-center shadow-md shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h1 className="text-[clamp(2.8rem,5vw,4.8rem)] font-bold tracking-[-0.06em] text-[var(--color-text-primary)] leading-[0.95]">
              THERMOS
            </h1>
          </div>

          <p className="mb-4 max-w-[38rem] text-[clamp(1.15rem,2vw,1.55rem)] font-semibold leading-[1.3] text-[#2B2B26]">
            Thermal Event Recognition and Monitoring Operational System
          </p>

          <p className="mb-8 max-w-[42rem] text-[16.5px] leading-[1.65] text-[#484841]">
            NASA FIRMS detects thermal anomalies from satellites. THERMOS classifies what they actually are — industrial fires, gas flares, wildfires, or agricultural burning — with confidence scores and risk analysis in one operational dashboard.
          </p>

          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-[var(--radius-lg)] bg-[var(--color-accent)] px-7 py-3.5 text-[15px] font-semibold text-[#1A1A17] shadow-sm transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-md active:scale-[0.98]"
            >
              <span>Enter Dashboard</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* Right: 3D Globe */}
        <motion.div
          className="h-[460px] md:h-[520px] min-w-0 overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-b from-[#FAF8F5]/80 to-[#ECE6D8]/60 border border-[var(--color-border)] shadow-lg relative"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin mx-auto mb-3" />
                  <p className="text-[14px] text-[#54544D] font-medium">Initializing satellite thermal globe…</p>
                </div>
              </div>
            }
          >
            <GlobeCanvas />
          </Suspense>
        </motion.div>
      </section>

      {/* 2. Problem vs Solution Section: 3 Cards */}
      <section id="problem" className="scroll-mt-16 px-6 py-16 md:px-8 bg-white/60 border-y border-[var(--color-border)]">
        <motion.div
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Problem Card 1 */}
          <motion.div
            variants={item}
            className="p-5 bg-[#FAFAF8] border border-[#E8E5DE] rounded-[var(--radius-lg)] shadow-sm hover:border-[#D8D4CA] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-[var(--radius-md)] bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-stone-200/70 text-stone-700 font-data">
                  Problem 01
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-[#1A1A17] mb-1.5">Raw Thermal Points</h3>
              <p className="text-[14px] text-[#4A4A43] leading-[1.55]">
                NASA FIRMS gives raw coordinates of heat from space. No context — just lat/lng without identity.
              </p>
            </div>
          </motion.div>

          {/* Problem Card 2 */}
          <motion.div
            variants={item}
            className="p-5 bg-[#FAFAF8] border border-[#E8E5DE] rounded-[var(--radius-lg)] shadow-sm hover:border-[#D8D4CA] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-[var(--radius-md)] bg-red-100/70 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-stone-200/70 text-stone-700 font-data">
                  Problem 02
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-[#1A1A17] mb-1.5">No Classification</h3>
              <p className="text-[14px] text-[#4A4A43] leading-[1.55]">
                A refinery flare looks identical to an uncontrolled wildfire. Operators cannot tell the difference.
              </p>
            </div>
          </motion.div>

          {/* Solution Card 3: Visually Distinct with Brand Yellow */}
          <motion.div
            variants={item}
            className="p-5 bg-[#FFFDF2] border-2 border-[#F5C518] rounded-[var(--radius-lg)] shadow-md ring-1 ring-[#F5C518]/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center text-[#1A1A17] shadow-sm shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#F5C518] text-[#1A1A17] font-data shadow-xs">
                  The Solution
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-[#1A1A17] mb-1.5">THERMOS Solves It</h3>
              <p className="text-[14px] text-[#2E2E28] leading-[1.55] font-medium">
                AI + satellite context classifies every anomaly with confidence. Risk ranking enables instant dispatch.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. How It Works Section: Vertical Flow */}
      <section id="how-it-works" className="scroll-mt-16 px-6 py-16 md:px-8 lg:py-20">
        {/* Section Header: Consistent Center Alignment */}
        <div className="mx-auto mb-10 w-full max-w-3xl text-center">
          <h2 className="text-[clamp(2rem,3.2vw,3rem)] font-bold tracking-[-0.05em] text-[#1A1A17] leading-[1.1] mb-3">
            How It Works
          </h2>
          <p className="text-[16.5px] leading-[1.6] text-[#4A4A43] max-w-[32rem] mx-auto">
            Four sequential steps from satellite raw telemetry to operational intelligence
          </p>
        </div>

        {/* Timeline Steps */}
        <div className="mx-auto max-w-2xl">
          {steps.map((block, i) => {
            const Icon = block.icon;
            return (
              <motion.div
                key={block.num}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative flex flex-col items-center"
              >
                {/* Connecting Spine Line (between steps) */}
                {i > 0 && (
                  <div className="w-0.5 h-8 bg-gradient-to-b from-[#F5C518] to-[#D8D3C8] my-1" />
                )}

                {/* Step Card Box with Normal Paragraph Wrapping & Proper Max-Width */}
                <div className="w-full max-w-[560px] p-6 bg-white border border-[#E8E5DF] rounded-[var(--radius-xl)] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center">
                  {/* Step Number & Icon Badge */}
                  <div className="flex items-center gap-3 mb-3.5">
                    <span className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-[#1A1A17] text-[12px] font-bold flex items-center justify-center font-data shadow-xs">
                      {block.num}
                    </span>
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[#F5F0E6] border border-[#E4DDCF] flex items-center justify-center text-[#1A1A17] shadow-xs">
                      <Icon className="w-5 h-5 text-[#1A1A17]" />
                    </div>
                  </div>

                  {/* Title & Description with Proper Max Width */}
                  <h3 className="text-[17px] font-bold text-[#1A1A17] mb-2 tracking-[-0.02em]">
                    {block.step}
                  </h3>
                  <p className="text-[14.5px] text-[#45453E] leading-[1.6] max-w-[480px] mx-auto">
                    {block.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
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
