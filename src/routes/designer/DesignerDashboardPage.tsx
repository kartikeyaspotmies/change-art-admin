import { useSessionUser } from '@modules/auth/stores/auth-store';
import { Send } from 'lucide-react';
import { UserSubType } from '@contracts';
import {
  GreetingHero,
  JobTable,
  Panel,
  SectionHeader,
  StatGrid,
  JOBS,
  type Job,
} from '@modules/shared-ui';

export function DesignerDashboardPage() {
  const user = useSessionUser();
  const firstName = user?.name.split(' ')[0] ?? 'Kavya';
  const myName = user?.name ?? 'Kavya Reddy';
  const isSenior = user?.sub_type === UserSubType.SENIOR;

  // Senior pulls senior-stage tasks; junior pulls junior-stage tasks.
  const myTasks = JOBS.filter(
    (j) =>
      j.assignedTo === myName &&
      ((isSenior && (j.stage === 'senior' || j.stage === 'qc')) ||
        (!isSenior && j.stage === 'junior')),
  );

  // Fallback so the page isn't empty if the logged-in user doesn't match the mocks.
  const tasks = myTasks.length
    ? myTasks
    : JOBS.filter((j) =>
        isSenior ? j.stage === 'senior' || j.stage === 'qc' : j.stage === 'junior',
      ).slice(0, 4);

  return (
    <div className="page">
      <GreetingHero
        title={`Hi ${firstName}`}
        subtitle={
          isSenior
            ? "Your active design tasks. Submit completed work to QC, or review your juniors' submissions."
            : 'Pick up assigned briefs, execute, and submit to your senior for review.'
        }
      />

      <StatGrid
        stats={[
          { accent: 'crimson', label: 'My Active', value: tasks.length },
          {
            accent: 'amber',
            label: 'In Progress',
            value: tasks.filter((j) => j.status === 'In Production').length,
          },
          {
            accent: 'purple',
            label: isSenior ? 'Awaiting QC' : 'Senior Review',
            value: tasks.filter((j) => (isSenior ? j.stage === 'qc' : j.stage === 'senior')).length,
          },
          { accent: 'green', label: 'Completed (wk.)', value: isSenior ? 6 : 4 },
        ]}
      />

      <div className="two-col">
        <div>
          <SectionHeader title="My Active Tasks" />
          <JobTable
            jobs={tasks}
            defaultView="grid"
            renderActions={(j) => <SubmitButton job={j} />}
            emptyLabel="No tasks assigned right now."
          />
        </div>

        <div className="flex flex-col gap-3">
          <Panel title="This Week">
            <ul className="text-[12.5px] text-text-muted space-y-2">
              <li><span className="font-mono text-text">12</span> jobs completed</li>
              <li><span className="font-mono text-text">3.8h</span> avg. turnaround</li>
              <li><span className="font-mono text-text">94%</span> approval rate</li>
            </ul>
          </Panel>
          <Panel title="Quick Actions">
            <ul className="text-[12.5px] space-y-2 text-text-muted">
              <li>• Submit completed file → {isSenior ? 'QC' : 'Senior'}</li>
              <li>• Request brief clarification</li>
              <li>• Log break / out-of-desk</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ job }: { job: Job }) {
  return (
    <div className="job-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="btn btn-crimson"
        aria-label={`Submit ${job.id}`}
        onClick={() => alert(`Submit flow for ${job.id}`)}
      >
        <Send aria-hidden className="w-3.5 h-3.5" />
        Submit
      </button>
    </div>
  );
}
