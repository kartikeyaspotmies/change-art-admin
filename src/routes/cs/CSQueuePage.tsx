import { useMemo, useState } from 'react';
import { GreetingHero, JobTable, Pills, JOBS, type PillItem } from '@modules/shared-ui';

export function CSQueuePage() {
  const artworkJobs = useMemo(() => JOBS.filter((j) => j.order === 'Artwork'), []);

  const inQuote = artworkJobs.filter((j) => j.stage === 'quote');
  const inProd = artworkJobs.filter((j) => j.stage === 'junior' || j.stage === 'senior');
  const inQc = artworkJobs.filter((j) => j.stage === 'qc');
  const amend = artworkJobs.filter((j) => j.project === 'Amend');

  const [filter, setFilter] = useState('all');
  const pills: PillItem[] = [
    { id: 'all', label: 'All', count: artworkJobs.length },
    { id: 'Quote Submitted', label: 'Quote', count: inQuote.length },
    { id: 'In Production', label: 'In Production', count: inProd.length },
    { id: 'In QC', label: 'In QC', count: inQc.length },
    { id: 'Amend', label: 'Amend', count: amend.length },
  ];

  const filtered =
    filter === 'all'
      ? artworkJobs
      : filter === 'Amend'
        ? amend
        : artworkJobs.filter((j) => j.status === filter);

  return (
    <div className="page">
      <GreetingHero
        title="Artwork Order Queue"
        subtitle="Live production queue for artwork orders. Filter by stage to focus your attention."
      />
      <Pills items={pills} activeId={filter} onSelect={setFilter} />
      <JobTable jobs={filtered} showActions defaultView="grid" />
    </div>
  );
}
