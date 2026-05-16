import { Pencil } from 'lucide-react';
import { GreetingHero, Panel, StatGrid, CLIENTS } from '@modules/shared-ui';

export function CSClientsPage() {
  return (
    <div className="page">
      <GreetingHero
        title="Client Records"
        subtitle="Master list of every client account — contact details, account health, lifetime volume, and recent activity."
      />

      <StatGrid
        stats={[
          { accent: 'blue', label: 'Active Accounts', value: CLIENTS.length },
          { accent: 'green', label: 'New (mo.)', value: 1 },
          { accent: 'crimson', label: 'At Risk', value: 0 },
          {
            accent: 'gold',
            label: 'Top Volume',
            value: CLIENTS.reduce((top, c) => ((c.jobs ?? 0) > (top.jobs ?? 0) ? c : top), CLIENTS[0])
              .company,
          },
        ]}
      />

      <Panel title="All Clients">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Contact Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Payment</th>
                <th>Jobs</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {CLIENTS.map((c) => (
                <tr key={c.id}>
                  <td><span className="ref-code">{c.id}</span></td>
                  <td className="font-semibold">{c.name}</td>
                  <td className="text-text-muted">{c.company}</td>
                  <td className="font-mono text-[11.5px] text-text-muted">{c.contact}</td>
                  <td className="text-text-muted">{c.email}</td>
                  <td><span className="badge gray">{c.payment}</span></td>
                  <td className="font-mono">{c.jobs}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="btn btn-outline" aria-label={`Edit ${c.name}`}>
                      <Pencil aria-hidden className="w-3.5 h-3.5" />
                      Edit
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
