import { useState } from 'react';
import {
  BarChart,
  GreetingHero,
  MiniBars,
  Panel,
  StatGrid,
  DASH_METRICS,
  DASH_RANGES,
  type DashRange,
} from '@modules/shared-ui';

export function DesignerAnalyticsPage() {
  const [range, setRange] = useState<DashRange>('This Month');
  const m = DASH_METRICS[range].ds;

  return (
    <div className="page">
      <GreetingHero
        title="My Performance"
        subtitle="Throughput, approval rate, and trend over time."
        action={
          <select
            className="btn btn-outline"
            style={{ padding: '8px 12px' }}
            value={range}
            onChange={(e) => setRange(e.target.value as DashRange)}
            aria-label="Time range"
          >
            {DASH_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        }
      />

      <StatGrid
        stats={[
          { accent: 'green', label: 'Completed', value: m.comp },
          { accent: 'blue', label: 'Avg. Time / Job', value: m.time },
          { accent: 'crimson', label: 'QC Rejection Rate', value: m.qcRej },
          { accent: 'amber', label: 'Junior Rejection Rate', value: m.jrRej },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel title="Jobs by Category">
          <MiniBars
            items={[
              { label: 'Artwork', value: 18, color: 'var(--color-blue)' },
              { label: 'Digitizing', value: 12, color: 'var(--color-teal)' },
              { label: 'Sewout', value: 4, color: 'var(--color-amber)' },
              { label: 'Amendments', value: 2, color: 'var(--color-crimson)' },
            ]}
          />
        </Panel>

        <Panel title="QC Rejection Reasons">
          <MiniBars
            items={[
              { label: 'Colour', value: 5 },
              { label: 'Alignment', value: 3 },
              { label: 'Resolution', value: 2 },
              { label: 'Brief Mismatch', value: 1 },
            ]}
          />
        </Panel>

        <Panel title="This Week" className="lg:col-span-2">
          <BarChart
            items={[
              { label: 'Mon', value: 2, height: 30 },
              { label: 'Tue', value: 4, height: 60 },
              { label: 'Wed', value: 3, height: 45 },
              { label: 'Thu', value: 5, height: 85 },
              { label: 'Fri', value: 6, height: 100, highlight: true },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
