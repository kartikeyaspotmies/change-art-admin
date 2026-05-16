import { useSessionUser } from '@modules/auth/stores/auth-store';
import { Send, Camera } from 'lucide-react';
import {
  Callout,
  GreetingHero,
  JobTable,
  Panel,
  SectionHeader,
  StatGrid,
  JOBS,
  type Job,
} from '@modules/shared-ui';

export function SewoutDashboardPage() {
  const user = useSessionUser();
  const firstName = user?.name.split(' ')[0] ?? 'Vinay';

  const pending = JOBS.filter((j) => j.stage === 'sewout');
  const submittedQc = JOBS.filter((j) => j.order === 'Digitizing + Sewout' && j.stage === 'qc');

  return (
    <div className="page">
      <GreetingHero
        title={`Hi ${firstName}`}
        subtitle="Sewout queue. Run stitch files on the machine, photograph the result, and forward to QC."
      />

      <StatGrid
        stats={[
          { accent: 'crimson', label: 'Pending Sewout', value: pending.length },
          { accent: 'amber', label: 'On Machine Now', value: 1 },
          { accent: 'purple', label: 'Submitted to QC', value: submittedQc.length },
          { accent: 'green', label: 'Done (wk.)', value: 5 },
        ]}
      />

      <Callout tone="info">
        Each sewout needs a thread match log, runtime, stitch count, and a photo of the finished
        embroidery before you forward it to QC.
      </Callout>

      <div className="two-col mt-3">
        <div>
          <SectionHeader title="Pending Sewouts" />
          <JobTable
            jobs={pending}
            defaultView="grid"
            renderActions={(j) => <SewoutActions job={j} />}
            emptyLabel="Nothing on the queue."
          />
        </div>

        <div className="flex flex-col gap-3">
          <Panel title="This Week">
            <ul className="text-[12.5px] text-text-muted space-y-2">
              <li><span className="font-mono text-text">5</span> sewouts logged</li>
              <li><span className="font-mono text-text">14.2k</span> avg. stitch count</li>
              <li><span className="font-mono text-text">100%</span> photo coverage</li>
            </ul>
          </Panel>
          <Panel title="Machine Status">
            <ul className="text-[12.5px] text-text-muted space-y-2">
              <li>Tajima A — <span className="text-text">running</span></li>
              <li>Tajima B — <span className="text-text">idle</span></li>
              <li>Brother PR — <span className="text-text">maintenance</span></li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function SewoutActions({ job }: { job: Job }) {
  return (
    <div className="job-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="btn btn-outline"
        aria-label={`Upload photo for ${job.id}`}
        onClick={() => alert(`Photo upload for ${job.id}`)}
      >
        <Camera aria-hidden className="w-3.5 h-3.5" />
        Photo
      </button>
      <button
        type="button"
        className="btn btn-crimson"
        aria-label={`Submit ${job.id}`}
        onClick={() => alert(`Submit ${job.id} to QC`)}
      >
        <Send aria-hidden className="w-3.5 h-3.5" />
        To QC
      </button>
    </div>
  );
}
