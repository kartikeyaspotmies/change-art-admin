import { useMemo, useState } from 'react';
import {
  GreetingHero,
  JobTable,
  StatGrid,
  Pills,
  JOBS,
  type PillItem,
} from '@modules/shared-ui';

export function CSNewJobsPage() {
  const allJobs = useMemo(
    () => JOBS.filter((j) => j.stage !== 'quote' && j.stage !== 'delivered'),
    [],
  );
  const inProd = useMemo(() => allJobs.filter((j) => j.stage === 'junior'), [allJobs]);
  const srReview = useMemo(() => allJobs.filter((j) => j.stage === 'senior'), [allJobs]);
  const inQc = useMemo(() => allJobs.filter((j) => j.stage === 'qc'), [allJobs]);
  const sewout = useMemo(() => allJobs.filter((j) => j.stage === 'sewout'), [allJobs]);

  const [filter, setFilter] = useState<string>('all');

  const pills: PillItem[] = [
    { id: 'all', label: 'All', count: allJobs.length },
    { id: 'In Production', label: 'In Production', count: inProd.length },
    { id: 'Senior Review', label: 'Senior Review', count: srReview.length },
    { id: 'In QC', label: 'In QC', count: inQc.length },
    { id: 'Sewout', label: 'Sewout', count: sewout.length },
  ];

  const filtered = filter === 'all' ? allJobs : allJobs.filter((j) => j.status === filter);

  return (
    <div className="page">
      <GreetingHero
        title="New Jobs"
        subtitle="All active production jobs — track status, assign, and manage the pipeline."
      />

      <StatGrid
        stats={[
          { accent: 'teal', label: 'Total Active', value: allJobs.length },
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
