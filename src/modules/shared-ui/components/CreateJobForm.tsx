import { useState, type FormEvent } from 'react';
import { Send, Save, Upload, Sparkles, Stamp, Brush, Package } from 'lucide-react';
import { CLIENTS, byRole, type TeamMember } from '../mocks';

interface CreateJobFormProps {
  /** 'quote' creates a quote request; 'order' submits a confirmed order. */
  mode: 'quote' | 'order';
  /** Called after successful submit (after the toast). */
  onSubmit?: (id: string) => void;
}

const ORDER_TYPES = [
  { id: 'artwork', label: 'Artwork', sub: 'Logo, Vector, Illustration', icon: Brush },
  { id: 'digitizing', label: 'Digitizing', sub: 'Embroidery conversion', icon: Stamp },
  { id: 'swatches', label: 'Swatches', sub: 'Physical sample review', icon: Sparkles },
  { id: 'extras', label: 'Patches & Extras', sub: 'Custom patches, Name drops', icon: Package },
];

/**
 * Multi-section create-job form — used by both CS and Admin Create Quote /
 * Place Order pages. Mirrors the demo's 5-section layout.
 */
export function CreateJobForm({ mode, onSubmit }: CreateJobFormProps) {
  const isOrder = mode === 'order';
  const [clientId, setClientId] = useState('');
  const [orderType, setOrderType] = useState('artwork');
  const [error, setError] = useState<string | null>(null);

  const designers: TeamMember[] = [...byRole('senior_designer'), ...byRole('jr_designer')];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!clientId) return setError('Please select or enter a client');
    if (!fd.get('design')) return setError('Design name is required');
    if (!fd.get('budget')) return setError(`${isOrder ? 'Agreed price' : 'Budget'} is required`);
    if (!fd.get('brief')) return setError('Design brief is required');
    setError(null);
    const newId = `J-2025-${String(50 + Math.floor(Math.random() * 50)).padStart(4, '0')}`;
    onSubmit?.(newId);
    form.reset();
    setClientId('');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[760px] mx-auto">
      <section className="panel p-7">
        <FormStep n={1} title="Client Details">
          <label className="fl">Select Existing Client</label>
          <select
            className="fi mb-2.5"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          >
            <option value="">— Search or select an existing client —</option>
            {CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company} — {c.name} ({c.id})
              </option>
            ))}
            <option value="new">+ Enter New Client</option>
          </select>

          {clientId === 'new' ? (
            <div
              style={{
                background: 'rgba(196,30,58,0.04)',
                border: '1px dashed rgba(196,30,58,0.25)',
                borderRadius: 10,
                padding: 16,
              }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-crimson mb-3">
                New Client Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field name="newClientName" label="Client Name *" placeholder="e.g. Ravi Kumar" />
                <Field
                  name="newClientCompany"
                  label="Company Name *"
                  placeholder="e.g. Ravi Textiles"
                />
                <Field
                  name="newClientContact"
                  label="Contact Number"
                  placeholder="+91 98765 43210"
                />
                <Field
                  name="newClientEmail"
                  label="Email Address"
                  type="email"
                  placeholder="client@company.com"
                />
                <Field name="newClientCity" label="Location / City" placeholder="e.g. Hyderabad" />
                <Select
                  name="newClientPayment"
                  label="Payment Method"
                  options={['Bank Transfer', 'Credit', 'Cash', 'Card']}
                />
              </div>
            </div>
          ) : null}
        </FormStep>

        <FormStep n={2} title="Select Order Type">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
            {ORDER_TYPES.map(({ id, label, sub, icon: Icon }) => {
              const active = orderType === id;
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => setOrderType(id)}
                  className="text-center cursor-pointer transition rounded-xl p-3"
                  style={{
                    border: `1px solid ${active ? 'var(--color-crimson)' : 'var(--glass-border)'}`,
                    background: active ? 'rgba(196,30,58,0.08)' : 'rgba(255,255,255,0.02)',
                  }}
                  aria-pressed={active}
                >
                  <Icon className="w-6 h-6 mx-auto mb-1.5 text-text" aria-hidden />
                  <div className="text-[12px] font-bold text-text">{label}</div>
                  <div className="text-[10.5px] text-text-muted">{sub}</div>
                </button>
              );
            })}
          </div>
          <Select
            name="service"
            label="Specific Service *"
            options={[
              'Logo Design / Vectorisation',
              'Screen Print Artwork',
              'Offset / Digital Print Artwork',
              'Sublimation Artwork',
              'Embroidery Digitizing',
              '3D Puff Digitizing',
              'Sewout Sample',
              'Name Drop / Number Set',
            ]}
          />
        </FormStep>

        <FormStep n={3} title="Job Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field name="design" label="Design Name *" placeholder="e.g. Winter Collection Print" />
            <Select
              name="process"
              label="Process Type"
              options={[
                '— Select —',
                'Screen Printing',
                'Digital Printing',
                'Offset Printing',
                'Sublimation',
                'Flex Printing',
                'Others',
              ]}
            />
            <Select
              name="complexity"
              label="Design Complexity"
              defaultValue="Medium"
              options={['Simple', 'Medium', 'Super Medium', 'Complex', 'Super Complex']}
            />
            <Select
              name="priority"
              label="Priority"
              defaultValue="Normal"
              options={['Normal', 'Rush', 'Super Rush']}
            />
            <Field name="colors" label="Number of Colors" type="number" defaultValue="4" min={1} max={12} />
            <Field
              name="eta"
              label="Expected Delivery (hours)"
              type="number"
              defaultValue="8"
              min={2}
            />
            <Field
              name="budget"
              label={`${isOrder ? 'Agreed Price ($)' : 'Client Budget ($)'} *`}
              type="number"
              placeholder="e.g. 150"
            />
            <Field
              name="refNote"
              label={isOrder ? 'Invoice Number' : 'Internal Reference Note'}
              placeholder={isOrder ? 'e.g. INV-2025-001' : 'Optional internal note'}
            />
            <div className="md:col-span-2">
              <label className="fl">Design Brief / Description *</label>
              <textarea
                className="fi fi-ta"
                name="brief"
                style={{ minHeight: 90 }}
                placeholder="Describe the design requirements, color codes, reference links, and any specific instructions…"
              />
            </div>
          </div>
        </FormStep>

        <FormStep
          n={4}
          title={
            <>
              Assign to Designer{' '}
              <span className="text-[10px] font-normal text-text-muted normal-case ml-1">
                (Optional — can be assigned later)
              </span>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {designers.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition"
                style={{ border: '1px solid var(--glass-border)' }}
              >
                <input
                  type="radio"
                  name="assignee"
                  value={m.id}
                  style={{ accentColor: 'var(--color-crimson)' }}
                />
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: 'rgba(196,30,58,0.15)', color: 'var(--color-crimson)' }}
                >
                  {m.initials}
                </span>
                <span className="flex-1">
                  <span className="block text-[12.5px] font-semibold text-text">{m.name}</span>
                  <span className="block text-[11px] text-text-muted">{m.roleLabel}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[10.5px]">
                  <span className={`status-dot ${m.status}`} aria-hidden />
                  <span
                    style={{
                      color:
                        m.status === 'available'
                          ? 'var(--color-green)'
                          : m.status === 'busy'
                            ? 'var(--color-crimson)'
                            : 'var(--color-amber)',
                    }}
                  >
                    {labelStatus(m.status)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </FormStep>

        <FormStep n={5} title="Upload Reference Files" lastStep>
          <div
            className="border border-dashed rounded-xl text-center p-7 cursor-pointer transition"
            style={{ borderColor: 'rgba(196,30,58,0.3)' }}
          >
            <Upload className="w-6 h-6 mx-auto mb-2 text-text" aria-hidden />
            <div className="text-[13px] font-semibold text-text">
              Drop files here or <span className="text-crimson">browse</span>
            </div>
            <div className="text-[11.5px] text-text-muted mt-1">
              PDF, AI, PSD, PNG, SVG, JPG, DST, EMB — max 500 MB per file
            </div>
          </div>
        </FormStep>

        {error ? (
          <div
            className="text-[12px] mb-3 px-3 py-2 rounded-md"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div
          className="flex gap-2.5 justify-end pt-2 mt-2"
          style={{ borderTop: '1px solid var(--glass-border)' }}
        >
          <button type="button" className="btn btn-outline">
            <Save aria-hidden className="w-4 h-4" />
            <span>Save Draft</span>
          </button>
          <button type="submit" className="btn btn-crimson">
            <Send aria-hidden className="w-4 h-4" />
            <span>{isOrder ? 'Submit Order' : 'Submit Quote Request'}</span>
          </button>
        </div>
      </section>
    </form>
  );
}

function FormStep({
  n,
  title,
  children,
  lastStep = false,
}: {
  n: number;
  title: React.ReactNode;
  children: React.ReactNode;
  lastStep?: boolean;
}) {
  return (
    <div
      className="mb-7 pb-6"
      style={{ borderBottom: lastStep ? 'none' : '1px solid var(--glass-border)' }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: 'var(--color-crimson)' }}
        >
          {n}
        </div>
        <div className="text-[13.5px] font-bold text-text uppercase tracking-wider">{title}</div>
      </div>
      {children}
    </div>
  );
}

function Field({
  name,
  label,
  ...rest
}: {
  name: string;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="fl" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} className="fi" {...rest} />
    </div>
  );
}

function Select({
  name,
  label,
  options,
  ...rest
}: {
  name: string;
  label: string;
  options: string[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="fl" htmlFor={name}>
        {label}
      </label>
      <select id={name} name={name} className="fi" {...rest}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function labelStatus(s: TeamMember['status']): string {
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
