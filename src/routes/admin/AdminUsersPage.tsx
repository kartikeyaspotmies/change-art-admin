import { Pencil } from 'lucide-react';
import { GreetingHero, Panel, StatGrid, TEAM, type TeamMember } from '@modules/shared-ui';

export function AdminUsersPage() {
  return (
    <div className="page">
      <GreetingHero
        title="User Management"
        subtitle="Create accounts, assign roles, gate permissions, and audit access changes."
      />

      <StatGrid
        stats={[
          { accent: 'blue', label: 'Total Users', value: TEAM.length },
          {
            accent: 'green',
            label: 'Active',
            value: TEAM.filter((u) => u.status !== 'offline').length,
          },
          { accent: 'amber', label: 'Pending Invites', value: 0 },
          {
            accent: 'crimson',
            label: 'Admins',
            value: TEAM.filter((u) => u.role === 'admin').length,
          },
        ]}
      />

      <Panel title="All Users">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Active Jobs</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((u) => (
                <tr key={u.id}>
                  <td><span className="ref-code">{u.id}</span></td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="user-av">{u.initials}</span>
                      <span className="font-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-text-muted">{u.roleLabel}</td>
                  <td>
                    <span className="flex items-center gap-1.5 text-[11.5px]">
                      <span className={`status-dot ${u.status}`} aria-hidden />
                      {statusLabel(u.status)}
                    </span>
                  </td>
                  <td className="font-mono">{u.jobs}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="btn btn-outline" aria-label={`Edit ${u.name}`}>
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

function statusLabel(s: TeamMember['status']): string {
  switch (s) {
    case 'available':
      return 'Available';
    case 'busy':
      return 'Busy';
    case 'in_progress':
      return 'In Progress';
    default:
      return 'Offline';
  }
}
