import { GreetingHero, Panel, StatGrid } from '@modules/shared-ui';

export function AdminSettingsPage() {
  return (
    <div className="page">
      <GreetingHero
        title="Platform Settings"
        subtitle="Pricing catalogue, SLA tiers, role permissions, notification routing, and integrations."
      />

      <StatGrid
        stats={[
          { accent: 'blue', label: 'Pricing Version', value: 'v3.2' },
          { accent: 'teal', label: 'SLA Tiers', value: 4 },
          { accent: 'purple', label: 'Integrations', value: 6 },
          { accent: 'gold', label: 'Last Audit', value: '2 days ago' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel title="Pricing Catalogue">
          <ul className="text-[12.5px] text-text-muted space-y-2">
            <li>• Base rates per order type</li>
            <li>• Complexity multipliers</li>
            <li>• Rush + Super Rush surcharges</li>
            <li>• Client-specific overrides</li>
          </ul>
        </Panel>

        <Panel title="SLA Tiers">
          <ul className="text-[12.5px] text-text-muted space-y-2">
            <li><span className="font-mono text-text">Normal</span> — 24h response</li>
            <li><span className="font-mono text-text">Rush</span> — 12h response</li>
            <li><span className="font-mono text-text">Super Rush</span> — 4h response</li>
            <li><span className="font-mono text-text">VIP Client</span> — 2h response</li>
          </ul>
        </Panel>

        <Panel title="Role Permissions">
          <ul className="text-[12.5px] text-text-muted space-y-2">
            <li>• 8 roles configured</li>
            <li>• Sub-types: Junior, Senior</li>
            <li>• Admin override scope</li>
            <li>• Audit log retention: 90 days</li>
          </ul>
        </Panel>

        <Panel title="Integrations">
          <ul className="text-[12.5px] text-text-muted space-y-2">
            <li>• Firebase Cloud Messaging — push</li>
            <li>• tus + S3 — file uploads</li>
            <li>• Email ingestion — quote requests</li>
            <li>• Better Auth — sessions</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
