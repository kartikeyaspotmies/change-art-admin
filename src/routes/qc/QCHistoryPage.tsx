import { GreetingHero, JobTable, StatGrid, JOBS } from '@modules/shared-ui';

export function QCHistoryPage() {
  // Mock: every delivered job has passed QC at some point.
  const decisions = JOBS.filter((j) => j.stage === 'delivered' || j.stage === 'qc');

  return (
    <div className="page">
      <GreetingHero
        title="QC History"
        subtitle="Searchable log of every QC decision — approvals, rejections, feedback attached, and downstream outcome."
      />

      <StatGrid
        stats={[
          { accent: 'blue', label: 'Decisions (wk.)', value: 22 },
          {
            accent: 'green',
            label: 'Approved (mo.)',
            value: JOBS.filter((j) => j.stage === 'delivered').length,
          },
          { accent: 'crimson', label: 'Rejected (mo.)', value: 4 },
          { accent: 'purple', label: 'Avg. Turnaround', value: '18m' },
        ]}
      />

      <JobTable jobs={decisions} defaultView="table" emptyLabel="No history yet." />
    </div>
  );
}
