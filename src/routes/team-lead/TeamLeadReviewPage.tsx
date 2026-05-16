import { Check, X } from 'lucide-react';
import {
  Callout,
  GreetingHero,
  JobTable,
  StatGrid,
  JOBS,
  type Job,
} from '@modules/shared-ui';

export function TeamLeadReviewPage() {
  // Junior submissions awaiting senior/TL approval — proxy: stage=junior + not in production.
  const submissions = JOBS.filter((j) => j.subType === 'Junior' && j.stage === 'junior');

  return (
    <div className="page">
      <GreetingHero
        title="Junior Designer Submissions"
        subtitle="Verify and approve junior work before it forwards to QC."
      />

      <StatGrid
        stats={[
          { accent: 'crimson', label: 'Awaiting Review', value: submissions.length },
          { accent: 'green', label: 'Approved Today', value: 0 },
          { accent: 'amber', label: 'Returned Today', value: 0 },
          { accent: 'purple', label: 'Avg. Review Time', value: '24m' },
        ]}
      />

      <Callout tone="info">
        Approve forwards the submission to QC. Reject returns to the junior with structured
        feedback.
      </Callout>

      <div className="mt-3">
        <JobTable
          jobs={submissions}
          defaultView="grid"
          renderActions={(j) => <ReviewActions job={j} />}
          emptyLabel="Nothing awaiting review."
        />
      </div>
    </div>
  );
}

function ReviewActions({ job }: { job: Job }) {
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
