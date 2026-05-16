import { GreetingHero, JobTable, StatGrid, JOBS } from '@modules/shared-ui';

export function CSProjectsPage() {
  const open = JOBS.filter((j) => j.stage !== 'delivered');
  const ready = JOBS.filter((j) => j.status === 'In QC');
  const amend = JOBS.filter((j) => j.project === 'Amend');

  return (
    <div className="page">
      <GreetingHero
        title="All Projects"
        subtitle="Browse every active, delivered, and amendment job across the CS pipeline."
      />

      <StatGrid
        stats={[
          { accent: 'blue', label: 'Total Projects', value: JOBS.length },
          { accent: 'amber', label: 'Open', value: open.length },
          { accent: 'teal', label: 'Ready to Deliver', value: ready.length },
          { accent: 'purple', label: 'Amendments', value: amend.length },
        ]}
      />

      <JobTable jobs={JOBS} showActions defaultView="grid" />
    </div>
  );
}
