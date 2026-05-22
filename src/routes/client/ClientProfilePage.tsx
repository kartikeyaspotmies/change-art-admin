import { useState } from 'react';
import { useSessionUser } from '@modules/auth/stores/auth-store';
import { Save, Calendar, Info, Edit2 } from 'lucide-react';
import { GreetingHero, Panel, StatGrid, CLIENTS, MiniBars, JOBS } from '@modules/shared-ui';

const CLIENT_ID = 'C001';

export function ClientProfilePage() {
  const user = useSessionUser();
  const me = CLIENTS.find((c) => c.id === CLIENT_ID) ?? CLIENTS[0];
  const [isEditing, setIsEditing] = useState(false);

  // Dynamic metrics derived from mocks/jobs.ts
  const myJobs = JOBS.filter((j) => j.clientId === CLIENT_ID);
  const totalJobsCount = myJobs.length;
  const deliveredJobsCount = myJobs.filter((j) => j.stage === 'delivered').length;
  const activeJobsCount = myJobs.filter((j) => j.stage !== 'delivered').length;

  const artworkCount = myJobs.filter((j) => j.order === 'Artwork').length;
  const digitizingCount = myJobs.filter((j) => j.order.includes('Digitizing')).length;
  const printCount = myJobs.filter((j) => j.order.includes('Sewout') || j.order === 'Sewout').length;

  // Format dynamic dates
  const memberSinceStr = me.created
    ? new Date(me.created + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    : 'April 12, 2024';

  const clientSinceStr = me.created
    ? new Date(me.created + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    : 'April 2024';

  return (
    <div className="page">
      {/* 
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
      */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Profile Card (Read-Only) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[var(--glass-border)]">
            {/* Banner */}
            <div className="p-8 relative overflow-hidden" style={{ background: '#1e293b' }}>
              <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-white opacity-[0.03] translate-x-4 -translate-y-4" />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-crimson)] flex items-center justify-center text-white text-[22px] font-bold">
                  {me.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-white text-[20px] font-bold leading-tight">{me.name}</h2>
                  <p className="text-slate-400 text-[13px] mt-1">{me.company} Pvt. Ltd. · {me.city}, India</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[12px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Client since {clientSinceStr}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info Details List */}
            <div className="p-6 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-3 text-[13px]">
                <span className="text-slate-500 font-medium">Client ID</span>
                <span className="font-bold text-slate-800" style={{ color: 'var(--color-blue-dark)' }}>{me.id}</span>
              </div>
              <div className="flex justify-between items-center py-3 text-[13px]">
                <span className="text-slate-500 font-medium">Full Name</span>
                <span className="text-slate-800">{me.name}</span>
              </div>
              <div className="flex justify-between items-center py-3 text-[13px]">
                <span className="text-slate-500 font-medium">Company</span>
                <span className="text-slate-800">{me.company} Pvt. Ltd.</span>
              </div>
              <div className="flex justify-between items-center py-3 text-[13px]">
                <span className="text-slate-500 font-medium">Contact</span>
                <span className="text-slate-800">{me.name}</span>
              </div>
              <div className="flex justify-between items-center py-3 text-[13px]">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="text-slate-800">{me.city}, Telangana, IN</span>
              </div>
              <div className="flex justify-between items-center py-3 text-[13px]">
                <span className="text-slate-500 font-medium">Member Since</span>
                <span className="text-slate-800">{memberSinceStr}</span>
              </div>
            </div>

            {/* Read-Only Alert Box */}
            <div className="px-6 pb-6">
              <div
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: 'var(--color-info-bg)', border: '1px solid var(--color-info-border)', color: 'var(--color-blue-dark)' }}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden style={{ color: 'var(--color-blue)' }} />
                <div className="text-[12.5px] leading-relaxed">
                  This profile is read-only. To update your information, please contact your Client Servicing representative.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Summary & Billing Preferences */}
        <div className="flex flex-col gap-6">
          {/* Account Summary Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--glass-border)]">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" />
              <h3 className="font-bold text-slate-800 text-[14px]">Account Summary</h3>
            </div>

            {/* Metric Boxes */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <div className="text-[28px] font-extrabold text-slate-800 leading-tight">{totalJobsCount}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Jobs</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <div className="text-[28px] font-extrabold text-slate-800 leading-tight">{deliveredJobsCount}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Delivered</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <div className="text-[28px] font-extrabold text-slate-800 leading-tight">{activeJobsCount}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active</div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="text-slate-800">
              <MiniBars
                items={[
                  { label: 'Artwork', value: artworkCount, color: 'var(--color-navy-ink)' },
                  { label: 'Digitizing', value: digitizingCount, color: 'var(--color-crimson)' },
                  { label: 'Print', value: printCount, color: 'var(--color-gold)' }
                ]}
              />
            </div>
          </div>

          {/* Editable Billing & Preferences Form */}
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Profile saved (demo)');
              setIsEditing(false);
            }}
          >
            {/* Commented out Company Details Panel as it's replaced by Read-only card */}
            {/* 
            <Panel title="Company Details">
              <div className="space-y-3">
                <Field label="Company Name" defaultValue={me.company} disabled={!isEditing} />
                <Field label="Primary Contact" defaultValue={me.name} disabled={!isEditing} />
                <Field label="Phone" defaultValue={me.contact} disabled={!isEditing} />
                <Field label="Email" type="email" defaultValue={me.email ?? user?.email ?? ''} disabled={!isEditing} />
                <Field label="City" defaultValue={me.city ?? ''} disabled={!isEditing} />
              </div>
            </Panel>
            */}

            <Panel
              title="Billing & Preferences"
              action={
                !isEditing && (
                  <button
                    type="button"
                    className="text-[13px] font-semibold text-[var(--color-crimson)] hover:text-[var(--color-crimson-bright)] transition flex items-center gap-1 ml-auto"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 aria-hidden className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )
              }
            >
              <div className="space-y-3">
                <div>
                  <label className="fl">Payment Method</label>
                  <select className="fi" defaultValue={me.payment} disabled={!isEditing}>
                    {['Bank Transfer', 'Credit', 'Cash', 'Card'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <Field label="GST / Tax ID" placeholder="Optional" disabled={!isEditing} />
                <div>
                  <label className="fl">Default Priority</label>
                  <select className="fi" defaultValue="Normal" disabled={!isEditing}>
                    <option>Normal</option>
                    <option>Rush</option>
                    <option>Super Rush</option>
                  </select>
                </div>
                <div>
                  <label className="fl">Notification Channel</label>
                  <select className="fi" defaultValue="Email + In-app" disabled={!isEditing}>
                    <option>Email only</option>
                    <option>In-app only</option>
                    <option>Email + In-app</option>
                  </select>
                </div>
              </div>
            </Panel>

            {isEditing && (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-crimson">
                  <Save aria-hidden className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
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
