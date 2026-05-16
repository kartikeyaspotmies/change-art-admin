import { Callout, GreetingHero, JobTable, StatGrid, JOBS } from '@modules/shared-ui';

export function CSDeliverPage() {
  const inQc = JOBS.filter((j) => j.stage === 'qc');
  const delivered = JOBS.filter((j) => j.stage === 'delivered');

  return (
    <div className="page">
      <GreetingHero
        title="Ready to Deliver"
        subtitle="Jobs that have cleared QC and are ready to release to the client."
      />

      <StatGrid
        stats={[
          { accent: 'teal', label: 'Ready Now', value: inQc.length, delta: 'QC approved' },
          { accent: 'amber', label: 'Awaiting Files', value: 0 },
          {
            accent: 'green',
            label: 'Delivered Today',
            value: delivered.filter((j) => isToday(j.created)).length,
          },
          { accent: 'blue', label: 'Delivered (mo.)', value: delivered.length },
        ]}
      />

      <Callout tone="info">
        Confirm the final files, agreed price, and delivery channel before releasing. Once
        delivered, the client receives the artwork bundle and an invoice link.
      </Callout>

      <div className="mt-3">
        <JobTable jobs={inQc} showActions defaultView="grid" emptyLabel="Nothing ready to deliver" />
      </div>
    </div>
  );
}

function isToday(ts: string): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
