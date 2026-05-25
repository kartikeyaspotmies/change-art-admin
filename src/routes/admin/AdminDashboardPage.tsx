import { useState } from 'react';
import { useSessionUser } from '@modules/auth/stores/auth-store';
import {
  BarChart,
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
import { CheckCircle2, Send } from 'lucide-react';
import type { Job } from '@modules/shared-ui/mocks/jobs';

export function AdminDashboardPage() {
  const user = useSessionUser();
  const firstName = user?.name.split(' ')[0] ?? 'Deepa';
  const [range, setRange] = useState<DashRange>('This Month');
  const m = DASH_METRICS[range].admin;

  const newJobs = JOBS.filter((j) => j.stage !== 'quote' && j.stage !== 'delivered').slice(0, 4);
  const newQuotes = JOBS.filter((j) => j.stage === 'quote').slice(0, 4);

  function adminActions(_j: Job) {
    return (
      <div className="job-actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn btn-outline">View</button>
        <button type="button" className="btn btn-crimson">Edit</button>
      </div>
    );
  }

  const totalActive = m.inProd + m.inQc;
  const prodPct = totalActive ? Math.round((m.inProd / totalActive) * 100) : 50;

  return (
    <div className="page">
      <GreetingHero
        title={`Good ${getGreeting()}, ${firstName}`}
        subtitle="Platform-wide overview. Full access to all modules."
        action={
          <select
            className="btn btn-outline"
            style={{ padding: '8px 12px', cursor: 'pointer' }}
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
        className="stats-grid-6"
        stats={[
          { accent: 'blue',   label: 'Open Jobs',      value: m.open },
          { accent: 'amber',  label: 'In Production',  value: m.inProd },
          { accent: 'teal',   label: 'In QC',          value: m.inQc },
          {
            accent: 'green',
            label: 'Ready to Deliver by Artist',
            value: m.readyByArtist,
            delta: 'Awaiting CS dispatch',
            deltaDirection: 'up',
            icon: <Send aria-hidden />,
          },
          {
            accent: 'purple',
            label: 'Ready to Deliver by QC',
            value: m.readyByQc,
            delta: 'QC signed off',
            deltaDirection: 'up',
            icon: <CheckCircle2 aria-hidden />,
          },
          {
            accent: 'crimson',
            label: 'Revenue (Selected)',
            value: <span style={{ fontSize: '20px' }}>{m.rev}</span>,
            delta: m.revSub,
            deltaDirection: 'up',
          },
        ]}
      />

      <div className="two-col">
        {/* Left — job tables */}
        <div>
          <SectionHeader
            title={<span style={{ color: '#5eead4' }}>New Jobs</span>}
            action={<a href="/admin/new-jobs">View All →</a>}
          />
          <JobTable jobs={newJobs} defaultView="grid" renderActions={adminActions} />

          <div className="mt-7">
            <SectionHeader
              title={<span style={{ color: '#fcd34d' }}>New Quote Requests</span>}
              action={<a href="/admin/new-quotes">View All →</a>}
            />
            <JobTable jobs={newQuotes} defaultView="grid" renderActions={adminActions} />
          </div>
        </div>

        {/* Right — stats panels */}
        <div className="flex flex-col gap-3">

          {/* Jobs Status */}
          <Panel>
            <div className="flex items-center gap-5">
              <div
                role="img"
                aria-label="Jobs status donut"
                style={{
                  width: 90, height: 90, borderRadius: '50%', flexShrink: 0,
                  background: `conic-gradient(var(--color-teal) 0% ${prodPct}%, var(--color-amber) ${prodPct}% 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{
                  width: 62, height: 62, borderRadius: '50%',
                  background: 'var(--glass-bg)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.15)',
                }}>
                  <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 18, fontWeight: 700, lineHeight: 1, color: 'var(--text-main)' }}>
                    {totalActive}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginTop: 2 }}>
                    Active
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2.5">
                  Jobs Status
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: 'var(--color-teal)' }} />
                    <span className="text-[12px] text-text-muted font-medium flex-1">In Production</span>
                    <span className="text-[12px] font-bold text-text-main">{m.inProd}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: 'var(--color-amber)' }} />
                    <span className="text-[12px] text-text-muted font-medium flex-1">In QC</span>
                    <span className="text-[12px] font-bold text-text-main">{m.inQc}</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Revenue Split */}
          <Panel title="Revenue Split">
            <div className="flex flex-col items-center gap-4">
              <div
                role="img"
                aria-label="Revenue split donut"
                style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: `conic-gradient(var(--color-crimson) 0% ${m.revSplit.art}%, var(--color-blue) ${m.revSplit.art}% ${m.revSplit.art + m.revSplit.dig}%, var(--color-gold) ${m.revSplit.art + m.revSplit.dig}% 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                }}
              >
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'var(--glass-bg)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.18)',
                }}>
                  <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 17, fontWeight: 700, lineHeight: 1, color: 'var(--text-main)' }}>
                    {m.rev}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginTop: 3 }}>
                    Period
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2">
                <div className="flex justify-between items-center px-2.5 py-2 rounded-lg"
                  style={{ background: 'rgba(196,30,58,0.06)', border: '1px solid rgba(196,30,58,0.12)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--color-crimson)' }} />
                    <span className="text-[12.5px] text-text-muted font-medium">Artwork</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[13.5px] text-text-main">{m.revSplit.art}%</span>
                    <span className="text-[11px] text-text-faint ml-1.5">(${m.revSplit.artVal})</span>
                  </div>
                </div>

                <div className="flex justify-between items-center px-2.5 py-2 rounded-lg"
                  style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--color-blue)' }} />
                    <span className="text-[12.5px] text-text-muted font-medium">Digitizing</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[13.5px] text-text-main">{m.revSplit.dig}%</span>
                    <span className="text-[11px] text-text-faint ml-1.5">(${m.revSplit.digVal})</span>
                  </div>
                </div>

                <div className="flex justify-between items-center px-2.5 py-2 rounded-lg"
                  style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.12)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--color-gold)' }} />
                    <span className="text-[12.5px] text-text-muted font-medium">+Sewout</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[13.5px] text-text-main">{m.revSplit.sew}%</span>
                    <span className="text-[11px] text-text-faint ml-1.5">(${m.revSplit.sewVal})</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Weekly Trend */}
          <Panel title="Weekly Trend">
            <BarChart
              items={[
                { label: 'Mon', value: 8,  height: 40 },
                { label: 'Tue', value: 11, height: 55 },
                { label: 'Wed', value: 7,  height: 35 },
                { label: 'Thu', value: 14, height: 70, color: 'var(--color-blue)' },
                { label: 'Fri', value: 20, height: 100, highlight: true },
              ]}
            />
          </Panel>

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
