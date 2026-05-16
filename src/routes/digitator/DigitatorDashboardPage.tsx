import { useSessionUser } from '@modules/auth/stores/auth-store';
import { Send } from 'lucide-react';
import {
  GreetingHero,
  JobTable,
  Panel,
  SectionHeader,
  StatGrid,
  JOBS,
  type Job,
} from '@modules/shared-ui';

export function DigitatorDashboardPage() {
  const user = useSessionUser();
  const firstName = user?.name.split(' ')[0] ?? 'Arjun';

  // Show all digitising-flavoured stages as our active set.
  const digitizingActive = JOBS.filter(
    (j) =>
      (j.order === 'Digitizing' || j.order === 'Digitizing + Sewout') &&
      j.stage !== 'delivered' &&
      j.stage !== 'quote',
  );

  return (
    <div className="page">
      <GreetingHero
        title={`Hi ${firstName}`}
        subtitle="Your active digitising tasks. Cut stitch files, dispatch to sewout, and handle QC returns."
      />

      <StatGrid
        stats={[
          { accent: 'crimson', label: 'My Active', value: digitizingActive.length },
          {
            accent: 'amber',
            label: 'In Progress',
            value: digitizingActive.filter((j) => j.status === 'In Production').length,
          },
          {
            accent: 'teal',
            label: 'In Sewout',
            value: digitizingActive.filter((j) => j.stage === 'sewout').length,
          },
          { accent: 'green', label: 'Files (wk.)', value: 8 },
        ]}
      />

      <div className="two-col">
        <div>
          <SectionHeader title="My Active Tasks" />
          <JobTable
            jobs={digitizingActive}
            defaultView="grid"
            renderActions={(j) => <DispatchButton job={j} />}
            emptyLabel="No digitising tasks right now."
          />
        </div>

        <div className="flex flex-col gap-3">
          <Panel title="This Week">
            <ul className="text-[12.5px] text-text-muted space-y-2">
              <li><span className="font-mono text-text">8</span> files completed</li>
              <li><span className="font-mono text-text">4.6h</span> avg. turnaround</li>
              <li><span className="font-mono text-text">96%</span> approval rate</li>
            </ul>
          </Panel>
          <Panel title="Quick Actions">
            <ul className="text-[12.5px] space-y-2 text-text-muted">
              <li>• Dispatch to sewout</li>
              <li>• Submit directly to QC (no sewout)</li>
              <li>• Open stitch file in editor</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function DispatchButton({ job }: { job: Job }) {
  const isSewout = job.order === 'Digitizing + Sewout';
  return (
    <div className="job-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="btn btn-crimson"
        aria-label={`Submit ${job.id}`}
        onClick={() => alert(`${isSewout ? 'Dispatch to Sewout' : 'Submit to QC'} for ${job.id}`)}
      >
        <Send aria-hidden className="w-3.5 h-3.5" />
        {isSewout ? 'To Sewout' : 'To QC'}
      </button>
    </div>
  );
}
