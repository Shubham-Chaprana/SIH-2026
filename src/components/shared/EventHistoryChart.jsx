import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateEventHistory } from '../../data/mockData';

export default function EventHistoryChart({ event }) {
  const data = useMemo(() => generateEventHistory(event), [event.properties.id]);

  return (
    <div className="h-[140px] w-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: '#9C9C91' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}h`}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9C9C91' }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E8E6E0',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            labelFormatter={(v) => `Hour ${v}`}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#D97706"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            name="Temp (K)"
          />
          <Line
            type="monotone"
            dataKey="frp"
            stroke="#7C3AED"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            name="FRP (MW)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
