import { Callout, GreetingHero, JobTable, StatGrid, JOBS } from '@modules/shared-ui';

export function CSAmendmentsPage() {
  const amendJobs = JOBS.filter((j) => j.project === 'Amend');

  return (
    <div className="page">
      <GreetingHero
        title="Amendments"
        subtitle="Client-requested post-delivery changes. Route them back to design or digitisation and track SLA on rework."
      />

      <StatGrid
        stats={[
          { accent: 'crimson', label: 'Open', value: amendJobs.length },
          {
            accent: 'blue',
            label: 'Routed Back',
            value: amendJobs.filter((j) => j.stage === 'junior' || j.stage === 'senior').length,
          },
          {
            accent: 'green',
            label: 'Resolved (mo.)',
            value: 8,
          },
          { accent: 'purple', label: 'Avg. Turnaround', value: '6.4h' },
        ]}
      />

      <Callout tone="amber">
        Amendment requests follow the original SLA priority. Confirm scope with the client before
        routing rework to avoid double passes.
      </Callout>

      <div className="mt-3">
        <JobTable
          jobs={amendJobs}
          showActions
          defaultView="grid"
          emptyLabel="No amendments — all good!"
        />
      </div>
    </div>
  );
}
