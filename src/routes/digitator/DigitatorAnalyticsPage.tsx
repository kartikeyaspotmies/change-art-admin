import {
  BarChart,
  GreetingHero,
  MiniBars,
  Panel,
  StatGrid,
} from '@modules/shared-ui';

export function DigitatorAnalyticsPage() {
  return (
    <div className="page">
      <GreetingHero
        title="My Performance"
        subtitle="Files cut, approval rate, stitch-count accuracy, and trend over time."
      />

      <StatGrid
        stats={[
          { accent: 'green', label: 'Files (mo.)', value: 28 },
          { accent: 'blue', label: 'Avg. Time / File', value: '4.6h' },
          { accent: 'teal', label: 'Approval Rate', value: '96%' },
          { accent: 'amber', label: 'Avg. Stitch Count', value: '14.2k' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel title="Files by Order Type">
          <MiniBars
            items={[
              { label: 'Digitizing', value: 18, color: 'var(--color-teal)' },
              { label: 'Digit. + Sewout', value: 10, color: 'var(--color-purple)' },
            ]}
          />
        </Panel>

        <Panel title="Rejection Reasons">
          <MiniBars
            items={[
              { label: 'Stitch Error', value: 2 },
              { label: 'Density', value: 1 },
              { label: 'Underlay', value: 1 },
            ]}
          />
        </Panel>

        <Panel title="This Week" className="lg:col-span-2">
          <BarChart
            items={[
              { label: 'Mon', value: 1, height: 25 },
              { label: 'Tue', value: 3, height: 60 },
              { label: 'Wed', value: 2, height: 40 },
              { label: 'Thu', value: 4, height: 80 },
              { label: 'Fri', value: 5, height: 100, highlight: true },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
