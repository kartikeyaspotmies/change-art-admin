import { useState, type FormEvent } from 'react';
import { Send, Save, Upload, Brush, Stamp, Sparkles, Package } from 'lucide-react';

interface ClientBriefFormProps {
  /** 'quote' submits a quote request; 'order' places a confirmed order. */
  mode: 'quote' | 'order';
  onSubmit?: (id: string) => void;
}

const ORDER_TYPES = [
  { id: 'artwork', label: 'Artwork', sub: 'Logo, Vector, Illustration', icon: Brush },
  { id: 'digitizing', label: 'Digitizing', sub: 'Embroidery conversion', icon: Stamp },
  { id: 'swatches', label: 'Swatches', sub: 'Physical sample review', icon: Sparkles },
  { id: 'extras', label: 'Patches & Extras', sub: 'Custom patches, Name drops', icon: Package },
];

/**
 * Client-side brief form — same fields as the internal CreateJobForm but
 * trimmed to what a client supplies: brief, references, budget, target ETA.
 * Used by Client Portal's Request Quote and Place Order screens.
 */
export function ClientBriefForm({ mode, onSubmit }: ClientBriefFormProps) {
  const isOrder = mode === 'order';
  const [orderType, setOrderType] = useState('artwork');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!fd.get('design')) return setError('Project name is required');
    if (!fd.get('brief')) return setError('Please describe what you need');
    if (!fd.get('budget')) return setError('Budget helps us scope the work');
    setError(null);
    const newId = `Q-2025-${String(80 + Math.floor(Math.random() * 50)).padStart(4, '0')}`;
    onSubmit?.(newId);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[760px] mx-auto">
      <section className="panel p-7">
        <Section n={1} title="What do you need?">
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
        </Section>

        <Section n={2} title="Project Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field name="design" label="Project Name *" placeholder="e.g. Festival Banner Set" />
            <Field
              name="budget"
              label={`${isOrder ? 'Agreed Budget ($)' : 'Suggested Budget ($)'} *`}
              type="number"
              placeholder="e.g. 150"
            />
            <Field
              name="colors"
              label="Approx. Colors"
              type="number"
              defaultValue="3"
              min={1}
              max={12}
            />
            <Select
              name="priority"
              label="Priority"
              defaultValue="Normal"
              options={['Normal', 'Rush', 'Super Rush']}
            />
            <div className="md:col-span-2">
              <label className="fl">Brief / Description *</label>
              <textarea
                className="fi fi-ta"
                name="brief"
                style={{ minHeight: 110 }}
                placeholder="Describe what you need — design references, brand guidelines, colour codes, fabric or substrate, intended use, anything we should know…"
              />
            </div>
          </div>
        </Section>

        <Section n={3} title="Attach References" lastStep>
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
        </Section>

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
            Save Draft
          </button>
          <button type="submit" className="btn btn-crimson">
            <Send aria-hidden className="w-4 h-4" />
            {isOrder ? 'Place Order' : 'Send Request'}
          </button>
        </div>
      </section>
    </form>
  );
}

function Section({
  n,
  title,
  children,
  lastStep = false,
}: {
  n: number;
  title: string;
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
}: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
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
