import { useState } from 'react';

const SERVICES = [
  { name: 'NASA FIRMS VIIRS NRT Ingestion', type: 'Data Ingestion', status: 'Operational', latency: '42ms', uptime: '99.98%', lastSync: '12s ago' },
  { name: 'Copernicus Sentinel-2 API Hub', type: 'Optical Corroboration', status: 'Operational', latency: '88ms', uptime: '99.95%', lastSync: '45s ago' },
  { name: 'OSM Overpass Industrial Vector Sync', type: 'GIS Infrastructure', status: 'Operational', latency: '115ms', uptime: '99.99%', lastSync: '2m ago' },
  { name: 'XGBoost Thermal Classifier (v3.2)', type: 'ML Inference', status: 'Operational', latency: '14ms', uptime: '100%', lastSync: 'Instant' },
  { name: 'Spatial Clustering Engine (DBSCAN)', type: 'Vector Processing', status: 'Operational', latency: '28ms', uptime: '99.97%', lastSync: 'Instant' },
  { name: 'Meteorological Wind Vector Feed (ECMWF)', type: 'Weather Model', status: 'Operational', latency: '64ms', uptime: '99.91%', lastSync: '5m ago' },
];

export default function SystemHealth() {
  const [syncing, setSyncing] = useState(false);
  const [lastManualSync, setLastManualSync] = useState(null);

  const handleManualSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastManualSync(new Date().toLocaleTimeString('en-IN'));
    }, 1500);
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">System Operations & Pipeline Telemetry</h1>
          <p className="mt-0.5 text-[15px] text-[var(--color-text-secondary)]">
            Real-time health monitoring of satellite feeds, GIS pipelines, and ML inference microservices
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-1.5 text-[14px] font-semibold bg-[var(--color-accent)] text-[var(--color-text-primary)] rounded-[var(--radius-md)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {syncing ? 'Syncing Feeds…' : 'Trigger Full Resync'}
        </button>
      </div>

      {/* Aggregate Health Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
          <span className="mb-1 block text-[13px] text-[var(--color-text-tertiary)]">Global Pipeline Uptime</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data text-xl font-bold text-emerald-700">99.98%</span>
            <span className="text-[12px] text-emerald-600 font-medium">Nominal</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
          <span className="mb-1 block text-[13px] text-[var(--color-text-tertiary)]">Avg Inference Latency</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data text-xl font-bold text-[var(--color-text-primary)]">14.2 ms</span>
            <span className="text-[12px] text-[var(--color-text-secondary)] font-data">P99: 22ms</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
          <span className="mb-1 block text-[13px] text-[var(--color-text-tertiary)]">Satellite Hotspots Ingested (24h)</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data text-xl font-bold text-[var(--color-text-primary)]">2,840</span>
            <span className="text-[12px] text-emerald-700 font-medium font-data">+12% vs avg</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
          <span className="mb-1 block text-[13px] text-[var(--color-text-tertiary)]">Active Cluster Nodes</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data text-xl font-bold text-[var(--color-text-primary)]">6 / 6</span>
            <span className="text-[12px] text-emerald-700 font-medium">All Healthy</span>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Microservice Fleet Status
          </h2>
          {lastManualSync && (
            <span className="text-[12px] text-emerald-700 font-data">Manual sync completed at {lastManualSync}</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] text-[13px] text-[var(--color-text-tertiary)] font-medium">
                <th className="pb-2">Microservice Name</th>
                <th className="pb-2">Subsystem</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Avg Latency</th>
                <th className="pb-2">Uptime (30d)</th>
                <th className="pb-2">Last Sync Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)] text-[14px]">
              {SERVICES.map((s, i) => (
                <tr key={i} className="hover:bg-[var(--color-surface)] transition-colors">
                  <td className="py-2.5 font-semibold text-[var(--color-text-primary)]">{s.name}</td>
                  <td className="py-2.5 text-[var(--color-text-secondary)]">{s.type}</td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[12px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-data text-[var(--color-text-secondary)]">{s.latency}</td>
                  <td className="py-2.5 font-data font-semibold text-[var(--color-text-primary)]">{s.uptime}</td>
                  <td className="py-2.5 font-data text-[var(--color-text-tertiary)]">{s.lastSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model & Architecture Specifications */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
          <h2 className="mb-2 text-[15px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            AI Classification Stack
          </h2>
          <div className="space-y-2 text-[14px] text-[var(--color-text-secondary)]">
            <div className="p-2.5 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
              <span className="font-semibold text-[var(--color-text-primary)] block">Primary Classifier:</span>
              Gradient Boosted Decision Tree (XGBoost) trained on 140,000 historical NASA FIRMS points cross-validated with Indian ISRO/Bhuvan wildfire logs.
            </div>
            <div className="p-2.5 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
              <span className="font-semibold text-[var(--color-text-primary)] block">Optical Verification:</span>
              Vision Transformer (ViT-Small) evaluating Sentinel-2 Top-of-Atmosphere (TOA) reflectance for plume validation.
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
          <h2 className="mb-2 text-[15px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Data Source Licensing & Attribution
          </h2>
          <div className="space-y-2 text-[14px] text-[var(--color-text-secondary)]">
            <div className="p-2.5 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
              <span className="font-semibold text-[var(--color-text-primary)] block">NASA LANCE / FIRMS:</span>
              Near Real-Time (NRT) VIIRS 375m Active Fire products (VNP14IMGTDL_NRT and VJ114IMGTDL_NRT). Open Data.
            </div>
            <div className="p-2.5 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
              <span className="font-semibold text-[var(--color-text-primary)] block">OpenStreetMap Contributors:</span>
              Industrial landuse, refinery polygons, and steel manufacturing infrastructure bounds (ODbL).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
