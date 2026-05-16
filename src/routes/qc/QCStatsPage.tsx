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

export function QCStatsPage() {
  const [range, setRange] = useState<DashRange>('This Month');
  const m = DASH_METRICS[range].qc;

  return (
    <div className="page">
      <GreetingHero
        title="QC Dashboard"
        subtitle="Operational view — throughput, defect categories, reviewer breakdown."
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
          { accent: 'crimson', label: 'Pending Review', value: m.pending },
          { accent: 'green', label: 'Approved', value: m.app },
          { accent: 'amber', label: 'Rejected', value: m.rej },
          { accent: 'purple', label: 'Avg. Review Time', value: m.time },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel title="Rejection Reasons">
          <MiniBars
            items={[
              { label: 'Colour', value: 7 },
              { label: 'Alignment', value: 5 },
              { label: 'Resolution', value: 3 },
              { label: 'Stitch Error', value: 4 },
              { label: 'Brief Mismatch', value: 2 },
              { label: 'Other', value: 1 },
            ]}
          />
        </Panel>

        <Panel title="7-Day Rejection Rate">
          <BarChart
            items={[
              { label: 'M', value: 4, height: 30 },
              { label: 'T', value: 6, height: 50 },
              { label: 'W', value: 3, height: 25 },
              { label: 'T', value: 7, height: 60 },
              { label: 'F', value: 5, height: 40 },
              { label: 'S', value: 8, height: 70, highlight: true },
              { label: 'S', value: 2, height: 18 },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
