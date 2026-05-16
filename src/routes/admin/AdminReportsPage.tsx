import { Download } from 'lucide-react';
import { GreetingHero, Panel, StatGrid } from '@modules/shared-ui';

interface ReportRow {
  id: string;
  title: string;
  category: 'Revenue' | 'Operations' | 'Quality' | 'Team';
  schedule: 'On demand' | 'Weekly' | 'Monthly';
  formats: Array<'CSV' | 'PDF'>;
}

const REPORTS: ReportRow[] = [
  { id: 'R001', title: 'Revenue by Client',         category: 'Revenue',   schedule: 'Monthly',   formats: ['CSV', 'PDF'] },
  { id: 'R002', title: 'Revenue by Order Type',     category: 'Revenue',   schedule: 'Monthly',   formats: ['CSV', 'PDF'] },
  { id: 'R003', title: 'Jobs by Order Type',        category: 'Operations',schedule: 'Weekly',    formats: ['CSV'] },
  { id: 'R004', title: 'SLA Adherence',             category: 'Operations',schedule: 'Weekly',    formats: ['CSV', 'PDF'] },
  { id: 'R005', title: 'Designer Performance',      category: 'Team',      schedule: 'Monthly',   formats: ['CSV', 'PDF'] },
  { id: 'R006', title: 'QC Rejection Reasons',      category: 'Quality',   schedule: 'Weekly',    formats: ['CSV'] },
  { id: 'R007', title: 'Junior → Senior Returns',   category: 'Quality',   schedule: 'Weekly',    formats: ['CSV'] },
  { id: 'R008', title: 'Active Pipeline Snapshot',  category: 'Operations',schedule: 'On demand', formats: ['CSV'] },
  { id: 'R009', title: 'Client Churn Risk',         category: 'Revenue',   schedule: 'Monthly',   formats: ['CSV', 'PDF'] },
];

export function AdminReportsPage() {
  return (
    <div className="page">
      <GreetingHero
        title="Reports"
        subtitle="Operational reports — revenue, throughput, SLA adherence, team utilisation, defect rates."
      />

      <StatGrid
        stats={[
          { accent: 'gold', label: 'Revenue (mo.)', value: '₹2.84L' },
          { accent: 'green', label: 'SLA Adherence', value: '94%' },
          { accent: 'blue', label: 'Team Utilisation', value: '78%' },
          { accent: 'crimson', label: 'Defect Rate', value: '6%' },
        ]}
      />

      <Panel title="Available Reports">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Category</th>
                <th>Schedule</th>
                <th>Formats</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.title}</td>
                  <td><span className={`badge ${categoryAccent(r.category)}`}>{r.category}</span></td>
                  <td className="text-text-muted">{r.schedule}</td>
                  <td>
                    <span className="flex gap-1.5">
                      {r.formats.map((f) => (
                        <span key={f} className="badge gray">
                          {f}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="btn btn-outline" aria-label={`Download ${r.title}`}>
                      <Download aria-hidden className="w-3.5 h-3.5" />
                      Run
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function categoryAccent(c: ReportRow['category']): string {
  switch (c) {
    case 'Revenue':
      return 'green';
    case 'Operations':
      return 'blue';
    case 'Quality':
      return 'purple';
    case 'Team':
      return 'amber';
  }
}
