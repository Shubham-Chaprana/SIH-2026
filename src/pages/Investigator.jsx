import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { mockGeoJSON, CATEGORY_COLORS, RISK_COLORS, generateEventHistory } from '../data/mockData';
import { getCategoryColor, getRiskColor, getCategoryShort, formatDuration, formatCoords, formatTimestamp } from '../utils/formatters';
import EventHistoryChart from '../components/shared/EventHistoryChart';
import EvidenceCard from '../components/shared/EvidenceCard';

export default function Investigator() {
  const events = mockGeoJSON.features;
  const selectEvent = useStore((s) => s.selectEvent);
  const selectedEventId = useStore((s) => s.selectedEventId);

  const [currentId, setCurrentId] = useState(selectedEventId || events[0].properties.id);
  const [activeTab, setActiveTab] = useState('spectral'); // 'spectral' | 'meteorology' | 'decision_tree' | 'report'

  const currentEvent = useMemo(() => {
    return events.find((e) => e.properties.id === currentId) || events[0];
  }, [events, currentId]);

  const p = currentEvent.properties;

  const decisionSteps = useMemo(() => {
    return [
      { step: '1. Satellite Thermal Ingestion', status: 'Passed', detail: `FRP ${p.frp} MW detected via VIIRS 375m I-Band (3.74µm channel anomaly > 320K)` },
      { step: '2. Spatial Vector Alignment', status: 'Matched', detail: `Point [${p.lat}, ${p.lng}] lies within 200m buffer of OSM Industrial Zone (${p.land_cover})` },
      { step: '3. Temporal Persistence Audit', status: 'Confirmed', detail: `Continuous thermal signature logged across ${p.observation_count} satellite passes (${formatDuration(p.persistence_hours)})` },
      { step: '4. Land-Cover Cross Validation', status: 'Verified', detail: `Copernicus Global Land Service confirms non-vegetated high-albedo industrial surface` },
      { step: `5. Final Classification: ${p.category}`, status: 'High Confidence', detail: `Ensemble model score: ${p.confidence}% confidence. Risk Tier: ${p.risk_tier} (${p.risk_score}/100)` },
    ];
  }, [p]);

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Header with Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">AI Incident Investigator</h1>
          <p className="mt-0.5 text-[15px] text-[var(--color-text-secondary)]">
            Deep-dive multi-modal diagnostics, spectral signature analysis & algorithmic decision auditing
          </p>
        </div>

        {/* Incident Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-[14px] text-[var(--color-text-secondary)] font-medium">Select Incident:</label>
          <select
            value={currentId}
            onChange={(e) => {
              setCurrentId(e.target.value);
              selectEvent(e.target.value);
            }}
            className="h-8 px-2.5 text-[14px] font-data bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--color-accent)] font-semibold"
          >
            {events.slice(0, 15).map((e) => (
              <option key={e.properties.id} value={e.properties.id}>
                {e.properties.id} — {e.properties.region} ({e.properties.risk_tier})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incident Key Metrics Banner */}
      <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 grid grid-cols-6 gap-4">
        <div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">Incident ID</span>
          <span className="font-data font-semibold text-sm text-[var(--color-text-primary)]">{p.id}</span>
        </div>
        <div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">Classification</span>
          <span
            className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full text-white"
            style={{ backgroundColor: getCategoryColor(p.category) }}
          >
            {getCategoryShort(p.category)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">Location & Coords</span>
          <span className="text-xs text-[var(--color-text-primary)] font-medium block truncate">{p.region}</span>
          <span className="font-data text-[10px] text-[var(--color-text-tertiary)]">{formatCoords(p.lat, p.lng)}</span>
        </div>
        <div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">Risk Score / Tier</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-data font-semibold text-sm" style={{ color: getRiskColor(p.risk_tier) }}>
              {p.risk_score}
            </span>
            <span
              className="px-1.5 py-0.5 text-[10px] font-semibold rounded text-white font-data"
              style={{ backgroundColor: getRiskColor(p.risk_tier) }}
            >
              {p.risk_tier}
            </span>
          </div>
        </div>
        <div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">Persistence / Passes</span>
          <span className="font-data font-semibold text-xs text-[var(--color-text-primary)]">
            {formatDuration(p.persistence_hours)} ({p.observation_count} passes)
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] block">Radiative Power</span>
          <span className="font-data font-semibold text-xs text-amber-700">{p.frp} MW ({p.brightness_temp} K)</span>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border)]">
        {[
          { key: 'spectral', label: 'Spectral & Thermal Dynamics' },
          { key: 'decision_tree', label: 'AI Diagnostic Decision Chain' },
          { key: 'meteorology', label: 'Meteorological Dispersion Simulation' },
          { key: 'evidence', label: 'Evidence Feature Attribution' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-[var(--color-accent)] text-[var(--color-text-primary)] bg-white'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'spectral' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
            <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
              Multi-temporal Thermal Signature (Temp vs. Radiative Output)
            </h2>
            <EventHistoryChart event={currentEvent} />
            <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] font-data">
              <span>Peak Temperature: {Math.round(p.brightness_temp * 1.08)} K</span>
              <span>Baseline Mean: {Math.round(p.brightness_temp * 0.95)} K</span>
              <span>Stability Index: 0.94 (Industrial Process Profile)</span>
            </div>
          </div>

          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 flex flex-col justify-between">
            <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Sensor Channel Radiance Distribution
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-secondary)]">VIIRS I4 Channel (3.74 µm Mid-IR)</span>
                  <span className="font-data font-semibold text-[var(--color-text-primary)]">{p.brightness_temp} K</span>
                </div>
                <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)]">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (p.brightness_temp / 500) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-secondary)]">VIIRS I5 Channel (11.45 µm Thermal IR)</span>
                  <span className="font-data font-semibold text-[var(--color-text-primary)]">{Math.round(p.brightness_temp * 0.78)} K</span>
                </div>
                <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)]">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (p.brightness_temp * 0.78 / 500) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-secondary)]">ΔT (I4 - I5 Subtraction Anomaly)</span>
                  <span className="font-data font-semibold text-emerald-700">+{Math.round(p.brightness_temp * 0.22)} K</span>
                </div>
                <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)]">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-xs text-[var(--color-text-secondary)]">
              <span className="font-semibold text-[var(--color-text-primary)]">Spectral Signature Match: </span>
              {p.category === 'Gas Flare'
                ? 'High-temperature point emitter consistent with continuous hydrocarbon flaring.'
                : p.category === 'Industrial Persistent Source'
                ? 'Sustained thermal plume aligned with metallurgical or refining furnace exhaust.'
                : 'Broad diffuse radiance profile matching uncontrolled open combustion.'}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'decision_tree' && (
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
          <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
            AI Classification Explainability Trace
          </h2>

          <div className="space-y-3">
            {decisionSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]">
                <div className="w-6 h-6 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent)] flex items-center justify-center font-data text-xs font-bold text-[var(--color-text-primary)] shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">{step.step}</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-data">
                      {step.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'meteorology' && (
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-3">
            <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Atmospheric Boundary Layer & Dispersion Vector
            </h2>
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] space-y-3">
              <div className="grid grid-cols-3 gap-3 text-xs font-data">
                <div className="bg-white p-2.5 rounded border border-[var(--color-border)]">
                  <span className="text-[10px] text-[var(--color-text-tertiary)] block">Surface Wind</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">14.2 km/h (WSW 245°)</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-[var(--color-border)]">
                  <span className="text-[10px] text-[var(--color-text-tertiary)] block">Boundary Layer Ht</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">850 m AGL</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-[var(--color-border)]">
                  <span className="text-[10px] text-[var(--color-text-tertiary)] block">Relative Humidity</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">58%</span>
                </div>
              </div>

              <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                <span className="font-semibold text-[var(--color-text-primary)]">Plume Dispersion Forecast: </span>
                Gaussian plume modeling indicates downwind trajectory toward ENE at 3.9 m/s. Dispersion cone maintains PM2.5 / SO2 concentration within permissible safety thresholds outside the 1.5km industrial buffer.
              </div>
            </div>
          </div>

          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3 flex flex-col justify-between">
            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Receptor Vulnerability
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-secondary)]">Settlement Distance</span>
                <span className="font-data font-semibold">1.8 km E</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-secondary)]">Forest Canopy Buffer</span>
                <span className="font-data font-semibold">4.2 km N</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-secondary)]">Air Quality AQI Delta</span>
                <span className="font-data font-semibold text-amber-700">+18 AQI</span>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="w-full mt-3 py-2 text-xs font-semibold bg-[var(--color-accent)] text-[var(--color-text-primary)] rounded-[var(--radius-md)] hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Export Full Incident PDF Report
            </button>
          </div>
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
          <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Evidence Feature Contribution Weights (SHAP Analysis)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {p.evidence.map((e, i) => (
              <EvidenceCard key={i} evidence={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
