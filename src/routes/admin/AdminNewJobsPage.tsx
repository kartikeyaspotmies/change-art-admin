import { useMemo, useState } from 'react';
import { GreetingHero, JobTable, Pills, StatGrid, JOBS, type PillItem } from '@modules/shared-ui';

export function AdminNewJobsPage() {
  const active = useMemo(
    () => JOBS.filter((j) => j.stage !== 'quote' && j.stage !== 'delivered'),
    [],
  );
  const [filter, setFilter] = useState('all');

  const inProd = active.filter((j) => j.stage === 'junior');
  const srReview = active.filter((j) => j.stage === 'senior');
  const inQc = active.filter((j) => j.stage === 'qc');
  const sewout = active.filter((j) => j.stage === 'sewout');

  const pills: PillItem[] = [
    { id: 'all', label: 'All', count: active.length },
    { id: 'In Production', label: 'In Production', count: inProd.length },
    { id: 'Senior Review', label: 'Senior Review', count: srReview.length },
    { id: 'In QC', label: 'In QC', count: inQc.length },
    { id: 'Sewout', label: 'Sewout', count: sewout.length },
  ];

  const filtered = filter === 'all' ? active : active.filter((j) => j.status === filter);

  return (
    <div className="page">
      <GreetingHero
        title="New Jobs"
        subtitle="All active production jobs across CS — track status, assign, and unblock at-risk work."
      />

      <StatGrid
        stats={[
          { accent: 'teal', label: 'Total Active', value: active.length },
          { accent: 'amber', label: 'In Production', value: inProd.length },
          { accent: 'blue', label: 'Senior Review', value: srReview.length },
          { accent: 'green', label: 'In QC', value: inQc.length },
        ]}
      />

      <Pills items={pills} activeId={filter} onSelect={setFilter} />
      <JobTable jobs={filtered} showActions defaultView="grid" />
    </div>
  );
}
