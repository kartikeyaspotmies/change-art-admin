import { useSessionUser } from '@modules/auth/stores/auth-store';
import { Save } from 'lucide-react';
import { GreetingHero, Panel, StatGrid, CLIENTS } from '@modules/shared-ui';

const CLIENT_ID = 'C001';

export function ClientProfilePage() {
  const user = useSessionUser();
  const me = CLIENTS.find((c) => c.id === CLIENT_ID) ?? CLIENTS[0];

  return (
    <div className="page">
      <GreetingHero
        title="My Profile"
        subtitle="Manage your company details, billing address, brand preferences, and notifications."
      />

      <StatGrid
        stats={[
          { accent: 'teal', label: 'Profile Complete', value: '92%' },
          { accent: 'blue', label: 'Team Members', value: 1 },
          { accent: 'gold', label: 'Billing Method', value: me.payment ?? '—' },
          { accent: 'purple', label: 'Account Tier', value: 'Standard' },
        ]}
      />

      <form
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          alert('Profile saved (demo)');
        }}
      >
        <Panel title="Company Details">
          <div className="space-y-3">
            <Field label="Company Name" defaultValue={me.company} />
            <Field label="Primary Contact" defaultValue={me.name} />
            <Field label="Phone" defaultValue={me.contact} />
            <Field label="Email" type="email" defaultValue={me.email ?? user?.email ?? ''} />
            <Field label="City" defaultValue={me.city ?? ''} />
          </div>
        </Panel>

        <Panel title="Billing & Preferences">
          <div className="space-y-3">
            <div>
              <label className="fl">Payment Method</label>
              <select className="fi" defaultValue={me.payment}>
                {['Bank Transfer', 'Credit', 'Cash', 'Card'].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <Field label="GST / Tax ID" placeholder="Optional" />
            <div>
              <label className="fl">Default Priority</label>
              <select className="fi" defaultValue="Normal">
                <option>Normal</option>
                <option>Rush</option>
                <option>Super Rush</option>
              </select>
            </div>
            <div>
              <label className="fl">Notification Channel</label>
              <select className="fi" defaultValue="Email + In-app">
                <option>Email only</option>
                <option>In-app only</option>
                <option>Email + In-app</option>
              </select>
            </div>
          </div>
        </Panel>

        <div className="lg:col-span-2 flex justify-end">
          <button type="submit" className="btn btn-crimson">
            <Save aria-hidden className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="fl">{label}</label>
      <input className="fi" {...rest} />
    </div>
  );
}
