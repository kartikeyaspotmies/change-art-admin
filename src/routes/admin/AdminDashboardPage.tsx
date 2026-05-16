import { useState } from 'react';
import { useSessionUser } from '@modules/auth/stores/auth-store';
import {
  BarChart,
  Callout,
  DonutChart,
  GreetingHero,
  JobTable,
  Panel,
  SectionHeader,
  StatGrid,
  DASH_METRICS,
  DASH_RANGES,
  JOBS,
  type DashRange,
} from '@modules/shared-ui';
import { ClipboardList, Cog, CheckCircle2, TrendingUp } from 'lucide-react';

export function AdminDashboardPage() {
  const user = useSessionUser();
  const firstName = user?.name.split(' ')[0] ?? 'Deepa';
  const [range, setRange] = useState<DashRange>('This Month');
  const m = DASH_METRICS[range].admin;

  const newJobs = JOBS.filter((j) => j.stage !== 'quote' && j.stage !== 'delivered').slice(0, 4);
  const newQuotes = JOBS.filter((j) => j.stage === 'quote').slice(0, 4);

  return (
    <div className="page">
      <GreetingHero
        title={`Good ${getGreeting()}, ${firstName}`}
        subtitle="Full visibility across the production lifecycle."
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
          { accent: 'crimson', label: 'Open Jobs', value: m.open, icon: <ClipboardList aria-hidden /> },
          { accent: 'amber', label: 'In Production', value: m.inProd, icon: <Cog aria-hidden /> },
          { accent: 'purple', label: 'In QC', value: m.inQc, icon: <CheckCircle2 aria-hidden /> },
          {
            accent: 'gold',
            label: 'Revenue',
            value: m.rev,
            delta: m.revSub,
            deltaDirection: 'up',
            icon: <TrendingUp aria-hidden />,
          },
        ]}
      />

      <div className="two-col">
        <div>
          <SectionHeader title="New Jobs" action={<a href="/admin/new-jobs">View All →</a>} />
          <JobTable jobs={newJobs} defaultView="table" withControls={false} />

          <div className="mt-6">
            <SectionHeader
              title="New Quotes"
              action={<a href="/admin/new-quotes">View All →</a>}
            />
            <JobTable jobs={newQuotes} defaultView="table" withControls={false} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Panel title="Revenue Split">
            <DonutChart
              centerValue={m.rev}
              centerLabel={range}
              slices={[
                { label: 'Artwork', value: m.revSplit.art, color: 'var(--color-navy-light)' },
                { label: 'Digitizing', value: m.revSplit.dig, color: 'var(--color-crimson)' },
                { label: 'Sewout', value: m.revSplit.sew, color: 'var(--color-amber)' },
              ]}
            />
            <div className="text-[11px] text-text-faint mt-3 grid grid-cols-3 gap-2">
              <span>Art: {m.revSplit.artVal}</span>
              <span>Dig: {m.revSplit.digVal}</span>
              <span>Sew: {m.revSplit.sewVal}</span>
            </div>
          </Panel>

          <Panel title="Weekly Throughput">
            <BarChart
              items={[
                { label: 'Mon', value: 4, height: 30 },
                { label: 'Tue', value: 7, height: 55 },
                { label: 'Wed', value: 5, height: 40 },
                { label: 'Thu', value: 9, height: 75 },
                { label: 'Fri', value: 12, height: 100, highlight: true },
              ]}
            />
          </Panel>

          <Callout tone="info">
            Quick win: 3 quotes have been awaiting CS pricing for &gt;48h.
          </Callout>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
