import { GreetingHero, JobTable, StatGrid, JOBS } from '@modules/shared-ui';

export function SewoutHistoryPage() {
  const sewoutJobs = JOBS.filter(
    (j) => j.order === 'Digitizing + Sewout' && (j.stage === 'qc' || j.stage === 'delivered'),
  );

  return (
    <div className="page">
      <GreetingHero
        title="Sewout History"
        subtitle="Every sewout you've recorded — thread match, stitch count, runtime, and the photo proof attached."
      />

      <StatGrid
        stats={[
          { accent: 'blue', label: 'This Week', value: 5 },
          { accent: 'teal', label: 'This Month', value: 17 },
          { accent: 'green', label: 'Approved Rate', value: '97%' },
          { accent: 'amber', label: 'Returned', value: 1 },
        ]}
      />

      <JobTable jobs={sewoutJobs} defaultView="table" emptyLabel="No history yet." />
    </div>
  );
}
