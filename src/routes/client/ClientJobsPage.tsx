import { useMemo, useState } from 'react';
import { GreetingHero, JobTable, Pills, StatGrid, JOBS, type PillItem } from '@modules/shared-ui';

const CLIENT_ID = 'C001';

export function ClientJobsPage() {
  const myJobs = useMemo(() => JOBS.filter((j) => j.clientId === CLIENT_ID), []);
  const [filter, setFilter] = useState('all');

  const active = myJobs.filter((j) => j.stage !== 'delivered' && j.stage !== 'quote');
  const review = myJobs.filter((j) => j.status === 'In QC' || j.status === 'Quote Approved');
  const amend = myJobs.filter((j) => j.project === 'Amend');
  const delivered = myJobs.filter((j) => j.stage === 'delivered');

  const pills: PillItem[] = [
    { id: 'all', label: 'All', count: myJobs.length },
    { id: 'active', label: 'Active', count: active.length },
    { id: 'review', label: 'Awaiting You', count: review.length },
    { id: 'amend', label: 'Modifications', count: amend.length },
    { id: 'delivered', label: 'Delivered', count: delivered.length },
  ];

  const filtered =
    filter === 'all'
      ? myJobs
      : filter === 'active'
        ? active
        : filter === 'review'
          ? review
          : filter === 'amend'
            ? amend
            : delivered;

  return (
    <div className="page">
      <GreetingHero
        title="My Projects"
        subtitle="Every project we're handling for you — status timeline, latest preview, and outstanding actions."
      />

      <StatGrid
        stats={[
          { accent: 'blue', label: 'In Production', value: active.length },
          { accent: 'amber', label: 'Awaiting Your Review', value: review.length },
          { accent: 'crimson', label: 'Modifications', value: amend.length },
          { accent: 'green', label: 'Delivered (mo.)', value: delivered.length },
        ]}
      />

      <Pills items={pills} activeId={filter} onSelect={setFilter} />

      <JobTable jobs={filtered} defaultView="grid" />
    </div>
  );
}
