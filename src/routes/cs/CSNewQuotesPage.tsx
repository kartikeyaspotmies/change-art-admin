import { GreetingHero, JobTable, StatGrid, Callout, SectionHeader, JOBS } from '@modules/shared-ui';
import { Inbox, Clock } from 'lucide-react';

export function CSNewQuotesPage() {
  const pending = JOBS.filter((j) => j.stage === 'quote' && j.status === 'Quote Submitted');
  const awaitingClient = JOBS.filter((j) => j.stage === 'quote' && j.status === 'Quote Approved');

  return (
    <div className="page">
      <GreetingHero
        title="Quote Requests"
        subtitle="Review incoming quotes, set your agency price, and send to the client for confirmation."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <StatGrid
          stats={[
            {
              accent: 'crimson',
              label: 'Awaiting Your Review',
              value: pending.length,
              delta: 'Open your price & send to client',
              deltaDirection: 'down',
              icon: <Inbox aria-hidden />,
            },
          ]}
        />
        <StatGrid
          stats={[
            {
              accent: 'amber',
              label: 'Awaiting Client Confirm',
              value: awaitingClient.length,
              delta: 'Price sent — client to confirm',
              icon: <Clock aria-hidden />,
            },
          ]}
        />
      </div>

      {pending.length ? (
        <>
          <SectionHeader title="Pending Your Review & Pricing" />
          <Callout tone="info">
            Click a job to open it, review the brief and files, then set your agency price and send
            it to the client.
          </Callout>
          <div className="mt-3">
            <JobTable jobs={pending} showActions defaultView="table" />
          </div>
        </>
      ) : (
        <Callout tone="green">All caught up — no quotes pending review.</Callout>
      )}

      {awaitingClient.length ? (
        <div className="mt-6">
          <SectionHeader
            title={<span style={{ color: '#fcd34d' }}>Price Sent — Awaiting Client Confirmation</span>}
          />
          <JobTable jobs={awaitingClient} showActions defaultView="table" />
        </div>
      ) : null}
    </div>
  );
}
