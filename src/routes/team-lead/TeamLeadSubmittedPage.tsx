import { GreetingHero, JobTable, SectionHeader, StatGrid, JOBS } from '@modules/shared-ui';

export function TeamLeadSubmittedPage() {
  const inProgress = JOBS.filter((j) => j.stage === 'junior' || j.stage === 'senior');
  const inSewout = JOBS.filter((j) => j.stage === 'sewout');
  const inQc = JOBS.filter((j) => j.stage === 'qc');
  const submittedJuniors = JOBS.filter((j) => j.subType === 'Junior' && j.stage === 'junior');
  const submittedSeniors = JOBS.filter((j) => j.subType === 'Senior' && j.stage === 'qc');

  return (
    <div className="page">
      <GreetingHero
        title="Submitted Tasks"
        subtitle="Every work item currently moving through the team — current owner, stage, and time-in-stage."
      />

      <StatGrid
        stats={[
          { accent: 'amber', label: 'In Production', value: inProgress.length },
          { accent: 'teal', label: 'In Sewout', value: inSewout.length },
          { accent: 'purple', label: 'In QC', value: inQc.length },
          { accent: 'green', label: 'Forwarded to QC', value: submittedSeniors.length },
        ]}
      />

      <SectionHeader title="Junior — Submitted to Team Lead" />
      <JobTable jobs={submittedJuniors} defaultView="table" />

      <div className="mt-6">
        <SectionHeader title="Senior — Submitted to QC" />
        <JobTable jobs={submittedSeniors} defaultView="table" />
      </div>
    </div>
  );
}
