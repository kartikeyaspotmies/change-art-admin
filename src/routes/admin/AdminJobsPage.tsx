import { useMemo, useState } from 'react';
import { GreetingHero, JobTable, Pills, JOBS, type PillItem } from '@modules/shared-ui';

export function AdminJobsPage() {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return JOBS;
    if (filter === 'Artwork') return JOBS.filter((j) => j.order === 'Artwork');
    if (filter === 'Digitizing') return JOBS.filter((j) => j.order === 'Digitizing');
    if (filter === 'Sewout')
      return JOBS.filter((j) => j.order === 'Digitizing + Sewout' || j.order === 'Sewout');
    return JOBS;
  }, [filter]);

  const pills: PillItem[] = [
    { id: 'all', label: 'All', count: JOBS.length },
    { id: 'Artwork', label: 'Artwork', count: JOBS.filter((j) => j.order === 'Artwork').length },
    { id: 'Digitizing', label: 'Digitizing', count: JOBS.filter((j) => j.order === 'Digitizing').length },
    {
      id: 'Sewout',
      label: 'Sewout',
      count: JOBS.filter((j) => j.order === 'Digitizing + Sewout').length,
    },
  ];

  return (
    <div className="page">
      <GreetingHero
        title="All Jobs"
        subtitle="Every job across the platform — search by client, stage, owner, or revenue band."
      />
      <Pills items={pills} activeId={filter} onSelect={setFilter} />
      <JobTable jobs={filtered} showActions defaultView="grid" />
    </div>
  );
}
