import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  Callout,
  GreetingHero,
  JobTable,
  StatGrid,
  JOBS,
  type Job,
  RequestModificationModal,
} from '@modules/shared-ui';

const CLIENT_ID = 'C001';

export function ClientTrackingPage() {
  const [modifyingJob, setModifyingJob] = useState<Job | null>(null);
  const delivered = JOBS.filter((j) => j.clientId === CLIENT_ID && j.stage === 'delivered');

  return (
    <div className="page">
      {/* <GreetingHero
        title="Delivered"
        subtitle="Browse your delivered artwork — download final files, request modifications, or reorder."
      /> */}

      {/* <StatGrid
        stats={[
          { accent: 'green', label: 'Delivered (mo.)', value: delivered.length },
          { accent: 'teal', label: 'Delivered (yr.)', value: delivered.length },
          { accent: 'gold', label: 'Pending Download', value: 1 },
          { accent: 'purple', label: 'Archived', value: 0 },
        ]}
      /> */}

      {/* <Callout tone="green">
        Final files are available in original format and print-ready PDF. Modifications can be
        requested up to 14 days after delivery at no charge.
      </Callout> */}

      <div className="mt-3">
        <h2 className="text-[18px] font-bold text-text-main mb-4 border-b border-[var(--glass-border)] pb-3">
          Delivered Jobs
        </h2>
        <JobTable
          jobs={delivered}
          variant="delivered"
          withControls={false}
          renderActions={(j) => (
            <DownloadButton job={j} onModify={() => setModifyingJob(j)} />
          )}
          emptyLabel="Nothing delivered yet."
        />
      </div>

      <RequestModificationModal
        job={modifyingJob}
        onClose={() => setModifyingJob(null)}
        onSubmit={() => {
          alert('Modification request submitted.');
        }}
      />
    </div>
  );
}

function DownloadButton({ job, onModify }: { job: Job; onModify: () => void }) {
  return (
    <div className="job-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="btn btn-outline !rounded-full"
        style={{ padding: '8px 16px', fontSize: 12.5 }}
        aria-label={`Download files for ${job.id}`}
        onClick={() => alert(`Download files for ${job.id}`)}
      >
        Download Files
      </button>
      <button
        type="button"
        className="btn btn-crimson !rounded-full"
        style={{ padding: '8px 16px', fontSize: 12.5 }}
        aria-label={`Request modification for ${job.id}`}
        onClick={onModify}
      >
        Request Modification
      </button>
    </div>
  );
}
