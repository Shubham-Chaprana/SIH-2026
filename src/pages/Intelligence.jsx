import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CATEGORY_COLORS, RISK_COLORS, mockGeoJSON } from '../data/mockData';
import { getCategoryColor, getRiskColor, getCategoryShort, formatDuration, formatCoords } from '../utils/formatters';

const SATELLITE_PASSES = [
  { sat: 'SNPP VIIRS', time: '10 mins ago', status: 'Ingested', anomalies: 14, resolution: '375m' },
  { sat: 'NOAA-20 VIIRS', time: '38 mins ago', status: 'Ingested', anomalies: 18, resolution: '375m' },
  { sat: 'Aqua MODIS', time: '2.4h ago', status: 'Processed', anomalies: 8, resolution: '1km' },
  { sat: 'Terra MODIS', time: '5.1h ago', status: 'Processed', anomalies: 11, resolution: '1km' },
  { sat: 'Sentinel-2 MSI', time: '8.2h ago', status: 'Calibrated', anomalies: 4, resolution: '20m' },
];

const INDUSTRIAL_CLUSTERS = [
  { name: 'Jamnagar Petrochemical Zone', region: 'Gujarat', risk: 88, activeFires: 3, criticalInfra: 'RIL Refinery, Nayara Energy', buffer: '3.2km to settlement' },
  { name: 'Visakhapatnam Industrial Corridor', region: 'Andhra Pradesh', risk: 79, activeFires: 2, criticalInfra: 'HPCL Refinery, Vizag Steel', buffer: '1.8km to urban fringe' },
  { name: 'Bokaro Steel & Thermal Complex', region: 'Jharkhand', risk: 72, activeFires: 2, criticalInfra: 'SAIL Steel Plant, BTPS', buffer: '4.5km to forest edge' },
  { name: 'Paradip Port & Chemical Hub', region: 'Odisha', risk: 65, activeFires: 1, criticalInfra: 'IOCL Refinery, PPL Fertilizer', buffer: '0.9km to coastal mangrove' },
  { name: 'Haldia Industrial Complex', region: 'West Bengal', risk: 58, activeFires: 1, criticalInfra: 'Haldia Petrochemicals, IOCL', buffer: '2.1km to port residential' },
];

export default function Intelligence() {
  const selectEvent = useStore((s) => s.selectEvent);
  const events = mockGeoJSON.features;
  const reduceMotion = useReducedMotion();

  const [selectedCluster, setSelectedCluster] = useState(INDUSTRIAL_CLUSTERS[0]);

  const persistentAnomalies = useMemo(() => {
    return events.filter((e) => e.properties.persistence_hours >= 48);
  }, [events]);

  const reveal = reduceMotion ? {} : {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.3, ease: 'easeOut' },
  };

  return (
    <div className="h-full overflow-y-auto p-5 md:p-6">
      <div className="space-y-6 max-w-[1600px]">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[clamp(1.5rem,2vw,2rem)] font-semibold text-[var(--color-text-primary)] tracking-[-0.03em]">
              Intelligence & Threat Correlation
            </h1>
            <p className="mt-1 text-[15px] leading-[1.6] text-[var(--color-text-secondary)]">
              Multi-source satellite ingestion, OSM industrial asset correlation & population buffer analytics
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-[var(--radius-lg)] border border-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-primary)] shadow-[0_1px_0_rgba(17,24,39,0.04)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span className="font-data">5 Sensors Active</span>
          </div>
        </header>

        <motion.section {...reveal} className="grid gap-6 xl:grid-cols-[1.7fr_0.8fr]">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.02)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[0.9rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                Live Satellite Constellation Feed
              </h2>
              <span className="font-data text-[13px] text-[var(--color-text-tertiary)]">Auto-refresh: 60s</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] text-[13px] text-[var(--color-text-tertiary)]">
                    <th className="pb-3 pr-4 font-medium">Satellite / Sensor</th>
                    <th className="pb-3 pr-4 font-medium">Last Pass</th>
                    <th className="pb-3 pr-4 font-medium">Ground Res.</th>
                    <th className="pb-3 pr-4 font-medium">Anomalies</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)] text-[14px]">
                  {SATELLITE_PASSES.map((pass, i) => (
                    <tr key={i} className="hover:bg-[var(--color-surface)] transition-colors">
                      <td className="py-3 pr-4 font-semibold text-[var(--color-text-primary)]">{pass.sat}</td>
                      <td className="py-3 pr-4 font-data text-[var(--color-text-secondary)]">{pass.time}</td>
                      <td className="py-3 pr-4 font-data text-[var(--color-text-secondary)]">{pass.resolution}</td>
                      <td className="py-3 pr-4 font-data font-semibold text-[var(--color-text-primary)]">{pass.anomalies}</td>
                      <td className="py-3">
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700">
                          {pass.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.02)]">
            <h2 className="mb-4 text-[0.9rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              Sensor Fusion Confidence
            </h2>
            <div className="space-y-4">
              {[
                ['Thermal-OSM Overlap', '94.2%', 'bg-[var(--color-accent)]'],
                ['Temporal Persistence Score', '88.7%', 'bg-amber-500'],
                ['Land-cover Class Purity', '91.0%', 'bg-emerald-600'],
              ].map(([label, value, bar]) => (
                <div key={label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[0.78rem]">
                    <span className="text-[var(--color-text-secondary)]">{label}</span>
                    <span className="font-data font-semibold text-[var(--color-text-primary)]">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div className={`h-full rounded-full ${bar}`} style={{ width: value }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-[var(--color-border-subtle)] pt-4 text-[13px] text-[var(--color-text-secondary)]">
              <span>Model Ensemble:</span>
              <span className="ml-1 font-data font-semibold text-[var(--color-text-primary)]">XGBoost-Thermal + ViT-16</span>
            </div>
          </div>
        </motion.section>

        <motion.section {...reveal} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.02)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[0.9rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              Industrial Cluster Vulnerability Index
            </h2>
            <span className="text-[13px] text-[var(--color-text-secondary)]">OSM cross-reference</span>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="grid gap-3 lg:grid-cols-5"
          >
            {INDUSTRIAL_CLUSTERS.map((cluster) => {
              const isSelected = selectedCluster.name === cluster.name;
              return (
                <motion.button
                  key={cluster.name}
                  onClick={() => setSelectedCluster(cluster)}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
                  className={`text-left rounded-[var(--radius-lg)] border p-3 transition-colors ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] ring-1 ring-[var(--color-accent)]'
                      : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-surface)]'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[12px] text-[var(--color-text-secondary)]">{cluster.region}</span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold text-white font-data"
                      style={{ backgroundColor: cluster.risk >= 75 ? RISK_COLORS.Critical : RISK_COLORS.High }}
                    >
                      {cluster.risk}
                    </span>
                  </div>
                  <h3 className="mb-2 text-[14px] font-semibold text-[var(--color-text-primary)] leading-snug">
                    {cluster.name}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                    {cluster.criticalInfra}
                  </p>
                  <div className="mt-3 text-[12px] font-data text-[var(--color-text-secondary)]">
                    {cluster.activeFires} active source{cluster.activeFires > 1 ? 's' : ''}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="mt-5 grid gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:grid-cols-4">
            <div>
              <span className="mb-1 block text-[0.72rem] text-[var(--color-text-tertiary)]">Cluster Focus</span>
              <span className="text-[0.82rem] font-semibold text-[var(--color-text-primary)]">{selectedCluster.name}</span>
            </div>
            <div>
              <span className="mb-1 block text-[0.72rem] text-[var(--color-text-tertiary)]">Major Infrastructure</span>
              <span className="text-[0.8rem] text-[var(--color-text-secondary)]">{selectedCluster.criticalInfra}</span>
            </div>
            <div>
              <span className="mb-1 block text-[0.72rem] text-[var(--color-text-tertiary)]">Exposure Buffer</span>
              <span className="font-data text-[0.8rem] font-semibold text-amber-700">{selectedCluster.buffer}</span>
            </div>
            <div>
              <span className="mb-1 block text-[0.72rem] text-[var(--color-text-tertiary)]">Active Hotspots</span>
              <span className="font-data text-[0.8rem] font-semibold text-[var(--color-text-primary)]">{selectedCluster.activeFires} Detected</span>
            </div>
          </div>
        </motion.section>

        <motion.section {...reveal} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.02)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[0.9rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              Persistent Thermal Sources (&gt;48h Duration)
            </h2>
            <span className="font-data text-[0.74rem] text-[var(--color-text-secondary)]">
              {persistentAnomalies.length} sources monitored
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {persistentAnomalies.slice(0, 6).map((event) => {
              const p = event.properties;
              return (
                <div
                  key={p.id}
                  onClick={() => selectEvent(p.id)}
                  className="cursor-pointer rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors hover:border-[var(--color-accent)]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-data text-[0.74rem] font-semibold text-[var(--color-text-primary)]">{p.id}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold text-white"
                      style={{ backgroundColor: getCategoryColor(p.category) }}
                    >
                      {getCategoryShort(p.category)}
                    </span>
                  </div>
                  <div className="mb-2 text-[0.8rem] font-medium text-[var(--color-text-primary)]">{p.region}</div>
                  <div className="flex items-center justify-between gap-2 text-[0.73rem] text-[var(--color-text-secondary)]">
                    <span className="font-data font-medium text-amber-800">{formatDuration(p.persistence_hours)} active</span>
                    <span className="font-data">{p.frp} MW FRP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
