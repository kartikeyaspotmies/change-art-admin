import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { X, Save, ArrowLeft } from 'lucide-react';
import { cn } from '@lib/utils';
import type {
  Job,
  JobComplexity,
  JobOrderType,
  JobPriority,
  JobStatus,
} from '../mocks/jobs';

interface EditJobModalProps {
  job: Job | null;
  onClose: () => void;
  /** "Back" — return to the read-only detail view. */
  onBack?: (job: Job) => void;
  /** Persist the edited fields. Receives the original job + the edited values. */
  onSave?: (job: Job, changes: EditFields) => void;
}

const ORDER_OPTIONS: JobOrderType[] = ['Artwork', 'Digitizing', 'Digitizing + Sewout', 'Sewout'];
const PROCESS_OPTIONS = ['Screen Printing', 'Digital Printing', 'Offset Printing', 'Sublimation', 'Flex Printing', 'Others'];
const COMPLEXITY_OPTIONS: JobComplexity[] = ['Simple', 'Medium', 'Super Medium', 'Complex', 'Super Complex'];
const PRIORITY_OPTIONS: JobPriority[] = ['Normal', 'Rush', 'Super Rush'];
const STATUS_OPTIONS: JobStatus[] = ['Quote Submitted', 'In Production', 'Senior Review', 'Sewout', 'In QC', 'Delivered'];

export interface EditFields {
  design: string;
  client: string;
  order: JobOrderType;
  process: string;
  complexity: JobComplexity;
  priority: JobPriority;
  status: JobStatus;
  etaHours: number | null;
  colors: number | null;
  clientPrice: number | null;
  adminPrice: number | null;
  agreedPrice: number | null;
  notes: string;
}

interface FormState {
  design: string;
  client: string;
  order: JobOrderType;
  process: string;
  complexity: JobComplexity;
  priority: JobPriority;
  status: JobStatus;
  etaHours: string;
  colors: string;
  clientPrice: string;
  adminPrice: string;
  agreedPrice: string;
  notes: string;
}

function toForm(job: Job): FormState {
  return {
    design: job.design,
    client: job.client,
    order: job.order,
    process: job.process ?? '',
    complexity: job.complexity,
    priority: job.priority,
    status: STATUS_OPTIONS.includes(job.status) ? job.status : 'In Production',
    etaHours: job.etaHours ? String(job.etaHours) : '',
    colors: job.colors ? String(job.colors) : '',
    clientPrice: job.clientPrice != null ? String(job.clientPrice) : '',
    adminPrice: job.adminPrice != null ? String(job.adminPrice) : '',
    agreedPrice: job.agreedPrice != null ? String(job.agreedPrice) : '',
    notes: job.notes ?? '',
  };
}

function priorityClass(priority: string): string {
  const map: Record<string, string> = { Normal: 'normal', Rush: 'rush', 'Super Rush': 'super-rush' };
  return map[priority] ?? 'normal';
}

function orderAccent(order: string): string {
  const map: Record<string, string> = {
    Artwork: 'navy', Digitizing: 'teal',
    'Digitizing + Sewout': 'purple', Sewout: 'purple',
  };
  return map[order] ?? 'gray';
}

function statusAccent(status: string): string {
  const map: Record<string, string> = {
    'In QC': 'teal', 'In Production': 'amber', 'Senior Review': 'purple',
    Sewout: 'purple', Delivered: 'green', 'Quote Submitted': 'blue',
    'Quote Approved': 'amber', 'Pending Client Confirm': 'amber',
    Cancelled: 'gray', Amend: 'amber', 'In Review': 'purple',
  };
  return map[status] ?? 'gray';
}

const FIELD_CLS =
  'w-full rounded-lg px-3 py-2.5 text-[12.5px] outline-none transition border bg-white text-[#0D1B2A] border-[#E2E8F0] focus:border-[#B22234] focus:ring-2 focus:ring-[#B22234]/10';

export function EditJobModal({ job, onClose, onBack, onSave }: EditJobModalProps) {
  const [isIn, setIsIn] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (job) {
      setForm(toForm(job));
      const raf = requestAnimationFrame(() => setIsIn(true));
      return () => cancelAnimationFrame(raf);
    }
    setIsIn(false);
    return undefined;
  }, [job]);

  const handleClose = useCallback(() => {
    setIsIn(false);
    const t = setTimeout(() => onClose(), 220);
    return () => clearTimeout(t);
  }, [onClose]);

  useEffect(() => {
    if (!job) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [job]);

  useEffect(() => {
    if (!job) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [job, handleClose]);

  if (!job || !form) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const num = (v: string): number | null => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = () => {
    onSave?.(job, {
      design: form.design.trim() || job.design,
      client: form.client.trim() || job.client,
      order: form.order,
      process: form.process,
      complexity: form.complexity,
      priority: form.priority,
      status: form.status,
      etaHours: num(form.etaHours),
      colors: num(form.colors),
      clientPrice: num(form.clientPrice),
      adminPrice: num(form.adminPrice),
      agreedPrice: num(form.agreedPrice),
      notes: form.notes,
    });
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: isIn ? 'rgba(15,23,42,0.45)' : 'rgba(15,23,42,0)',
        backdropFilter: isIn ? 'blur(5px)' : 'blur(0px)',
        WebkitBackdropFilter: isIn ? 'blur(5px)' : 'blur(0px)',
        transition: 'all 240ms cubic-bezier(0.16,1,0.3,1)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Edit job: ${job.design}`}
        className="relative w-full max-w-[660px] max-h-[92vh] rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: '#fff',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
          transform: isIn ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)',
          opacity: isIn ? 1 : 0,
          transition: 'all 240ms cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #E8EDF5' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div
                className="flex items-center gap-2 mb-1.5"
                style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, fontWeight: 700, color: '#B22234', letterSpacing: '0.04em' }}
              >
                <span>{job.id}</span>
                <span style={{ color: '#CBD5E1' }}>·</span>
                <span>Edit Job</span>
              </div>
              <h2 className="text-[20px] font-extrabold leading-tight" style={{ color: '#0D1B2A' }}>
                {form.design || job.design}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className={cn('badge', orderAccent(form.order))}>{form.order}</span>
                <span className={cn('badge', statusAccent(form.status))}>{form.status}</span>
                <span className={cn('badge', job.project === 'Amend' ? 'amber' : 'gray')}>{job.project}</span>
                <span className={cn('priority-badge', priorityClass(form.priority))}>{form.priority}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition"
              style={{ border: '1px solid #E8EDF5', color: '#94A3B8' }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ background: '#fff' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
            {/* JOB INFORMATION */}
            <div>
              <SectionLabel>JOB INFORMATION</SectionLabel>
              <div className="grid gap-3">
                <Field label="Design Name">
                  <input className={FIELD_CLS} value={form.design} onChange={(e) => set('design', e.target.value)} />
                </Field>
                <Field label="Client">
                  <input className={FIELD_CLS} value={form.client} onChange={(e) => set('client', e.target.value)} />
                </Field>
                <Field label="Order Type">
                  <select className={FIELD_CLS} value={form.order} onChange={(e) => set('order', e.target.value as JobOrderType)}>
                    {ORDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Process Type">
                  <select className={FIELD_CLS} value={form.process} onChange={(e) => set('process', e.target.value)}>
                    <option value="">—</option>
                    {PROCESS_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Complexity">
                  <select className={FIELD_CLS} value={form.complexity} onChange={(e) => set('complexity', e.target.value as JobComplexity)}>
                    {COMPLEXITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select className={FIELD_CLS} value={form.priority} onChange={(e) => set('priority', e.target.value as JobPriority)}>
                    {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select className={FIELD_CLS} value={form.status} onChange={(e) => set('status', e.target.value as JobStatus)}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="ETA (hours)">
                  <input className={FIELD_CLS} type="number" min={1} value={form.etaHours} onChange={(e) => set('etaHours', e.target.value)} />
                </Field>
                <Field label="Number of Colors">
                  <input className={FIELD_CLS} type="number" min={1} max={12} value={form.colors} onChange={(e) => set('colors', e.target.value)} />
                </Field>
              </div>
            </div>

            {/* PRICING & NOTES */}
            <div>
              <SectionLabel>PRICING &amp; NOTES</SectionLabel>
              <div className="grid gap-3 mb-4">
                <Field label="Client Budget (₹)">
                  <input className={FIELD_CLS} type="number" placeholder="Client proposed budget" value={form.clientPrice} onChange={(e) => set('clientPrice', e.target.value)} />
                </Field>
                <Field label="Admin Counter-Offer (₹)">
                  <input className={FIELD_CLS} type="number" placeholder="Agency counter-offer" value={form.adminPrice} onChange={(e) => set('adminPrice', e.target.value)} />
                </Field>
                <Field label="Agreed / Final Price (₹)">
                  <input className={FIELD_CLS} type="number" placeholder="Final agreed price" value={form.agreedPrice} onChange={(e) => set('agreedPrice', e.target.value)} />
                </Field>
              </div>
              <Field label="Notes / Brief">
                <textarea
                  className={cn(FIELD_CLS, 'resize-y')}
                  style={{ minHeight: 130 }}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5"
          style={{ borderTop: '1px solid #E8EDF5', background: '#FAFBFD' }}
        >
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 12, padding: '7px 13px', gap: 6 }}
            onClick={() => (onBack ? onBack(job) : handleClose())}
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Back
          </button>
          <button
            type="button"
            className="btn btn-crimson"
            style={{ fontSize: 12, padding: '7px 13px', gap: 6, marginLeft: 'auto' }}
            onClick={handleSave}
          >
            <Save className="w-3.5 h-3.5" aria-hidden />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap shrink-0"
        style={{ color: '#94A3B8' }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: '#E8EDF5' }} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5" style={{ color: '#94A3B8' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
