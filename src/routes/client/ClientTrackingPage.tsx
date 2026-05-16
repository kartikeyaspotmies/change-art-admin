import { Download } from 'lucide-react';
import {
  Callout,
  GreetingHero,
  JobTable,
  StatGrid,
  JOBS,
  type Job,
} from '@modules/shared-ui';

const CLIENT_ID = 'C001';

export function ClientTrackingPage() {
  const delivered = JOBS.filter((j) => j.clientId === CLIENT_ID && j.stage === 'delivered');

  return (
    <div className="page">
      <GreetingHero
        title="Delivered"
        subtitle="Browse your delivered artwork — download final files, request modifications, or reorder."
      />

      <StatGrid
        stats={[
          { accent: 'green', label: 'Delivered (mo.)', value: delivered.length },
          { accent: 'teal', label: 'Delivered (yr.)', value: delivered.length },
          { accent: 'gold', label: 'Pending Download', value: 1 },
          { accent: 'purple', label: 'Archived', value: 0 },
        ]}
      />

      <Callout tone="green">
        Final files are available in original format and print-ready PDF. Modifications can be
        requested up to 14 days after delivery at no charge.
      </Callout>

      <div className="mt-3">
        <JobTable
          jobs={delivered}
          defaultView="grid"
          renderActions={(j) => <DownloadButton job={j} />}
          emptyLabel="Nothing delivered yet."
        />
      </div>
    </div>
  );
}

function DownloadButton({ job }: { job: Job }) {
  return (
    <div className="job-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="btn btn-outline"
        aria-label={`Download ${job.id}`}
        onClick={() => alert(`Download files for ${job.id}`)}
      >
        <Download aria-hidden className="w-3.5 h-3.5" />
        Files
      </button>
      <button
        type="button"
        className="btn btn-crimson"
        aria-label={`Request modification for ${job.id}`}
        onClick={() => alert(`Request modification for ${job.id}`)}
      >
        Modify
      </button>
    </div>
  );
}
