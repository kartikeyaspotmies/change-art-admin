import { GreetingHero, JobTable, SectionHeader, StatGrid, JOBS } from '@modules/shared-ui';

export function AdminNewQuotesPage() {
  const pending = JOBS.filter((j) => j.stage === 'quote' && j.status === 'Quote Submitted');
  const awaitingClient = JOBS.filter((j) => j.stage === 'quote' && j.status === 'Quote Approved');
  const artwork = JOBS.filter((j) => j.stage === 'quote' && j.order === 'Artwork');
  const digit = JOBS.filter((j) => j.stage === 'quote' && j.order === 'Digitizing');

  return (
    <div className="page">
      <GreetingHero
        title="Quote Requests"
        subtitle="Incoming quote requests across all CS — track turnaround pressure, value, and conversion rate."
      />

      <StatGrid
        stats={[
          { accent: 'crimson', label: 'Pending Review', value: pending.length },
          { accent: 'amber', label: 'Awaiting Client', value: awaitingClient.length },
          { accent: 'blue', label: 'Artwork', value: artwork.length },
          { accent: 'teal', label: 'Digitizing', value: digit.length },
        ]}
      />

      {pending.length ? (
        <>
          <SectionHeader title="Pending Your Review" />
          <JobTable jobs={pending} showActions defaultView="grid" />
        </>
      ) : null}

      {awaitingClient.length ? (
        <div className="mt-6">
          <SectionHeader title="Price Sent — Awaiting Client" />
          <JobTable jobs={awaitingClient} showActions defaultView="grid" />
        </div>
      ) : null}
    </div>
  );
}
