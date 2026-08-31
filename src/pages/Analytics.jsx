import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { CATEGORY_COLORS, RISK_COLORS, mockGeoJSON } from '../data/mockData';
import { getCategoryShort } from '../utils/formatters';
import ChartCard from '../components/shared/ChartCard';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#FFFFFF',
    border: '1px solid #E8E6E0',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', monospace",
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
};

export default function Analytics() {
  const events = mockGeoJSON.features;

  // Thermal anomalies over time (last 30 days, grouped by day)
  const timelineData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const count = Math.round(3 + Math.random() * 12);
      days.push({ day: label, anomalies: count });
    }
    return days;
  }, []);

  // Classification distribution
  const classDistribution = useMemo(() => {
    const counts = {};
    events.forEach((e) => {
      const cat = e.properties.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: getCategoryShort(name),
      fullName: name,
      value,
    }));
  }, [events]);

  // Risk distribution
  const riskDistribution = useMemo(() => {
    const tiers = ['Critical', 'High', 'Moderate', 'Low'];
    return tiers.map((tier) => ({
      tier,
      count: events.filter((e) => e.properties.risk_tier === tier).length,
    }));
  }, [events]);

  // Persistent sources trend
  const persistentTrend = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        day: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        count: Math.round(2 + Math.random() * 8),
      });
    }
    return days;
  }, []);

  // Top high-risk regions
  const topRegions = useMemo(() => {
    const regionScores = {};
    events.forEach((e) => {
      const r = e.properties.region;
      if (!regionScores[r]) regionScores[r] = { region: r, avgRisk: 0, count: 0, total: 0 };
      regionScores[r].total += e.properties.risk_score;
      regionScores[r].count += 1;
    });
    return Object.values(regionScores)
      .map((r) => ({ ...r, avgRisk: Math.round(r.total / r.count) }))
      .sort((a, b) => b.avgRisk - a.avgRisk)
      .slice(0, 7);
  }, [events]);

  // Multi-category trend
  const categoryTrend = useMemo(() => {
    const days = [];
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        day: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        Industrial: Math.round(1 + Math.random() * 5),
        Agricultural: Math.round(Math.random() * 4),
        Wildfire: Math.round(Math.random() * 3),
      });
    }
    return days;
  }, []);

  return (
    <div className="h-full overflow-y-auto p-5 md:p-6">
      <div className="mb-6">
        <h1 className="text-[clamp(1.5rem,2vw,2rem)] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">Analytics</h1>
        <p className="mt-1 text-[15px] leading-[1.6] text-[var(--color-text-secondary)]">
          Thermal anomaly trends and classification breakdown
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Thermal Anomalies Over Time */}
        <ChartCard title="Thermal Anomalies Over Time" span="full">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9C9C91' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#9C9C91' }} tickLine={false} axisLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="anomalies" stroke="#D97706" strokeWidth={2} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Classification Distribution */}
        <ChartCard title="Classification Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={classDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                strokeWidth={0}
              >
                {classDistribution.map((entry) => (
                  <Cell key={entry.fullName} fill={CATEGORY_COLORS[entry.fullName] || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', fontFamily: "'Inter', sans-serif" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Risk Distribution */}
        <ChartCard title="Risk Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskDistribution} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" vertical={false} />
              <XAxis dataKey="tier" tick={{ fontSize: 10, fill: '#9C9C91' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9C9C91' }} tickLine={false} axisLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {riskDistribution.map((entry) => (
                  <Cell key={entry.tier} fill={RISK_COLORS[entry.tier]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Persistent Thermal Sources Trend */}
        <ChartCard title="Persistent Sources Trend" span="full">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={persistentTrend} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9C9C91' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#9C9C91' }} tickLine={false} axisLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} name="Persistent Sources" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top High-Risk Regions */}
        <ChartCard title="Top High-Risk Regions">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topRegions} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9C9C91' }} tickLine={false} axisLine={false} />
              <YAxis dataKey="region" type="category" tick={{ fontSize: 10, fill: '#6B6B63' }} tickLine={false} axisLine={false} width={80} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="avgRisk" fill="#EA580C" radius={[0, 4, 4, 0]} maxBarSize={16} name="Avg Risk Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Trend Comparison */}
        <ChartCard title="Industrial vs Agricultural vs Wildfire Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={categoryTrend} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9C9C91' }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: '#9C9C91' }} tickLine={false} axisLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="Industrial" stroke="#D97706" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Agricultural" stroke="#6B7C3A" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Wildfire" stroke="#991B1B" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
