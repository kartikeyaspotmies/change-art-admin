import { Check, X } from 'lucide-react';
import {
  Callout,
  GreetingHero,
  JobTable,
  StatGrid,
  JOBS,
  DASH_METRICS,
  type Job,
} from '@modules/shared-ui';

export function QCDashboardPage() {
  // QC index renders the Review Queue (matches the demo's qc-queue page).
  const queue = JOBS.filter((j) => j.stage === 'qc');
  const m = DASH_METRICS['This Month'].qc;

  return (
    <div className="page">
      <GreetingHero
        title="Review Queue"
        subtitle="Submissions awaiting your QC decision. Approve to release, reject to return with structured feedback."
      />

      <StatGrid
        stats={[
          { accent: 'crimson', label: 'Pending Review', value: queue.length },
          { accent: 'green', label: 'Approved Today', value: m.app },
          { accent: 'amber', label: 'Rejected Today', value: m.rej },
          { accent: 'purple', label: 'Avg. Turnaround', value: m.time },
        ]}
      />

      <Callout tone="info">
        Open each submission to check colour, alignment, resolution, and brief match. Rejections
        capture structured reasons so the designer can self-serve the fix.
      </Callout>

      <div className="mt-3">
        <JobTable
          jobs={queue}
          defaultView="grid"
          renderActions={(j) => <QCActions job={j} />}
          emptyLabel="Queue is empty."
        />
      </div>
    </div>
  );
}

function QCActions({ job }: { job: Job }) {
  return (
    <div className="job-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="btn btn-red"
        aria-label={`Reject ${job.id}`}
        onClick={() => alert(`Reject ${job.id}`)}
      >
        <X aria-hidden className="w-3.5 h-3.5" />
        Reject
      </button>
      <button
        type="button"
        className="btn btn-green"
        aria-label={`Approve ${job.id}`}
        onClick={() => alert(`Approve ${job.id}`)}
      >
        <Check aria-hidden className="w-3.5 h-3.5" />
        Approve
      </button>
    </div>
  );
}
