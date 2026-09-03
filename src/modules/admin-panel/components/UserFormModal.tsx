import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Pencil, UserX, Eye, EyeOff, Plus, User, Briefcase } from 'lucide-react';
import { ConfirmModal, CountryPicker, DatePicker } from '@modules/shared-ui';
import { UserRole, UserSubType } from '@contracts';
import type { IUser } from '@contracts';
import { useCreateUser, useDeactivateUser, useUpdateUser } from '../hooks/use-admin-users';
import { useAdminUsers } from '../hooks/use-admin-jobs';
import { useSessionUser } from '@modules/auth/stores/auth-store';

export type UserModalMode = 'view' | 'edit' | 'create';

interface UserFormModalProps {
  mode: UserModalMode;
  user: IUser | null;
  onClose: () => void;
}

// Internal staff roles — CLIENT is intentionally excluded (clients live in the
// Clients tab, not User Management). ADMIN is commented out: Admin accounts
// are no longer assignable from this dropdown (create or edit) — they can
// only be provisioned directly, not through the User Management UI.
const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: UserRole.CS, label: 'Client Servicing' },
  { value: UserRole.TEAM_LEAD, label: 'Team Lead' },
  { value: UserRole.DESIGNER, label: 'Designer' },
  { value: UserRole.DIGITATOR, label: 'Digitizor' },
  { value: UserRole.SEWOUT, label: 'Sewout' },
  { value: UserRole.QC, label: 'QC Reviewer' },
  // { value: UserRole.ADMIN, label: 'Admin' },
];

// Only these roles carry a Junior / Senior sub-type.
const SUBTYPE_ROLES = new Set<UserRole>([UserRole.DESIGNER, UserRole.DIGITATOR]);

const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const SHIFT_OPTIONS: { value: string; label: string }[] = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'GENERAL', label: 'General' },
  { value: 'EVENING', label: 'Evening' },
  { value: 'NIGHT', label: 'Night' },
];

const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;
const NOTES_MAX = 250;
const WORK_REMARKS_MAX = 200;

// Mirrors the backend's password policy (change-art-backend/src/modules/auth/password-policy.ts)
// so weak passwords are caught here instead of round-tripping to the server.
const PASSWORD_REQUIREMENTS: { label: string; test: (p: string) => boolean }[] = [
  { label: 'at least 8 characters', test: (p) => p.length >= 8 },
  { label: 'one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'one lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'one number', test: (p) => /[0-9]/.test(p) },
  { label: 'one special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function passwordStrengthError(password: string): string | null {
  const failed = PASSWORD_REQUIREMENTS.filter((r) => !r.test(password));
  if (failed.length === 0) return null;
  return `Password must include ${failed.map((r) => r.label).join(', ')}.`;
}

// Labels for roles that may already exist on a user record even though they
// aren't assignable via ROLE_OPTIONS (e.g. ADMIN).
const NON_ASSIGNABLE_ROLE_LABELS: Partial<Record<UserRole, string>> = {
  [UserRole.ADMIN]: 'Admin',
};

function roleLabel(role: UserRole): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? NON_ASSIGNABLE_ROLE_LABELS[role] ?? role;
}

function subTypeLabel(sub: UserSubType | null): string {
  if (!sub) return '—';
  return sub.charAt(0) + sub.slice(1).toLowerCase();
}

function nameInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  subType: UserSubType | '';
  isActive: boolean;
  // Personal information
  phone: string;
  dateOfBirth: string;
  gender: string;
  employeeId: string;
  joiningDate: string;
  // Work information
  department: string;
  reportingToId: string;
  workLocation: string;
  shift: string;
  workRemarks: string;
  // Office network (IP whitelist)
  ipWhitelist: string[];
  maxActiveSessions: string;
  // Notes
  notes: string;
}

function initialState(mode: UserModalMode, user: IUser | null): FormState {
  if (mode === 'create' || !user) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: UserRole.DESIGNER,
      subType: '',
      isActive: true,
      phone: '',
      dateOfBirth: '',
      gender: '',
      employeeId: '',
      joiningDate: '',
      department: '',
      reportingToId: '',
      workLocation: '',
      shift: '',
      workRemarks: '',
      ipWhitelist: [],
      maxActiveSessions: '1',
      notes: '',
    };
  }
  const [firstName, ...rest] = user.name.trim().split(/\s+/);
  return {
    firstName: firstName ?? '',
    lastName: rest.join(' '),
    email: user.email,
    password: '',
    role: user.role,
    subType: (user.sub_type as UserSubType | null) ?? '',
    isActive: user.is_active,
    phone: user.phone ?? '',
    dateOfBirth: user.date_of_birth ?? '',
    gender: user.gender ?? '',
    employeeId: user.employee_id ?? '',
    joiningDate: user.joining_date ?? '',
    department: user.department ?? '',
    reportingToId: user.reporting_to_id ?? '',
    workLocation: user.work_location ?? '',
    shift: user.shift ?? '',
    workRemarks: user.work_remarks ?? '',
    ipWhitelist: user.ip_whitelist ?? [],
    maxActiveSessions: user.max_active_sessions != null ? String(user.max_active_sessions) : 'unlimited',
    notes: user.notes ?? '',
  };
}

export function UserFormModal({ mode, user, onClose }: UserFormModalProps) {
  const [editing, setEditing] = useState(mode !== 'view' && user?.role !== UserRole.ADMIN);
  const [form, setForm] = useState<FormState>(() => initialState(mode, user));
  const [error, setError] = useState<string | null>(null);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [ipInput, setIpInput] = useState('');
  const [ipError, setIpError] = useState<string | null>(null);

  const sessionUser = useSessionUser();
  const create = useCreateUser();
  const update = useUpdateUser();
  const deactivate = useDeactivateUser();
  const { data: managerOptions } = useAdminUsers({ per_page: 200 });
  const saving = create.isPending || update.isPending;
  const isSelf = !!user && !!sessionUser && user.id === sessionUser.id;

  function addIp() {
    const value = ipInput.trim();
    if (!value) return;
    if (!IPV4_RE.test(value)) return setIpError('Enter a valid IPv4 address, e.g. 49.123.45.10');
    if (form.ipWhitelist.includes(value)) return setIpError('That IP is already whitelisted.');
    set('ipWhitelist', [...form.ipWhitelist, value]);
    setIpInput('');
    setIpError(null);
  }

  function removeIp(ip: string) {
    set('ipWhitelist', form.ipWhitelist.filter((v) => v !== ip));
  }

  // Reset the form whenever the modal target changes.
  useEffect(() => {
    setForm(initialState(mode, user));
    setEditing(mode !== 'view' && user?.role !== UserRole.ADMIN);
    setError(null);
    setShowPassword(false);
    setIpInput('');
    setIpError(null);
  }, [mode, user]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirmingDeactivate) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, confirmingDeactivate]);

  const isCreate = mode === 'create';
  const showSubType = SUBTYPE_ROLES.has(form.role);
  // Admin accounts cannot be edited from this modal at all — matches the
  // User Management table, which already hides the row-level Edit/Reset/
  // Delete actions for Admin rows.
  const isAdminTarget = !isCreate && user?.role === UserRole.ADMIN;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reportingManagerOptions = useMemo(
    () => (managerOptions?.items ?? []).filter((m) => m.id !== user?.id),
    [managerOptions, user],
  );

  const viewRows: [string, string][] = useMemo(() => {
    if (!user) return [];
    const rows: [string, string][] = [
      ['Full Name', user.name],
      ['Email', user.email],
      ['Role', roleLabel(user.role)],
      ['Sub-Type', subTypeLabel((user.sub_type as UserSubType | null) ?? null)],
      ['Status', user.is_active ? 'Active' : 'Inactive'],
    ];
    if (user.phone) rows.push(['Phone', user.phone]);
    if (user.date_of_birth) rows.push(['Date of Birth', user.date_of_birth]);
    if (user.gender) rows.push(['Gender', user.gender.charAt(0) + user.gender.slice(1).toLowerCase()]);
    if (user.employee_id) rows.push(['Employee ID', user.employee_id]);
    if (user.joining_date) rows.push(['Joining Date', user.joining_date]);
    if (user.department) rows.push(['Department', user.department]);
    if (user.reporting_to_id) {
      const manager = (managerOptions?.items ?? []).find((m) => m.id === user.reporting_to_id);
      rows.push(['Reporting To', manager?.name ?? '—']);
    }
    if (user.work_location) rows.push(['Work Location', user.work_location]);
    if (user.shift) rows.push(['Shift', user.shift.charAt(0) + user.shift.slice(1).toLowerCase()]);
    if (user.work_remarks) rows.push(['Remarks', user.work_remarks]);
    if (user.ip_whitelist.length) rows.push(['Office Network (IP Whitelist)', user.ip_whitelist.join(', ')]);
    if (user.notes) rows.push(['Notes', user.notes]);
    return rows;
  }, [user, managerOptions]);

  function handleSave() {
    setError(null);

    if (!form.firstName.trim()) return setError('First name is required.');
    if (!form.lastName.trim()) return setError('Last name is required.');
    const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    const subTypeValue: UserSubType | null = showSubType && form.subType ? (form.subType as UserSubType) : null;

    const profileFields = {
      phone: form.phone.trim() ? `${countryCode} ${form.phone.trim()}` : null,
      date_of_birth: form.dateOfBirth || null,
      gender: form.gender || null,
      employee_id: form.employeeId.trim() || null,
      joining_date: form.joiningDate || null,
      department: form.department.trim() || null,
      reporting_to_id: form.reportingToId || null,
      work_location: form.workLocation.trim() || null,
      shift: form.shift || null,
      work_remarks: form.workRemarks.trim() || null,
      ip_whitelist: form.ipWhitelist,
      max_active_sessions: form.maxActiveSessions === 'unlimited' ? null : Number(form.maxActiveSessions),
      notes: form.notes.trim() || null,
    };

    if (isCreate) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        return setError('A valid email is required.');
      if (!form.phone.trim()) return setError('Phone number is required.');
      if (!form.employeeId.trim()) return setError('Employee ID is required.');
      if (!form.joiningDate) return setError('Joining date is required.');
      if (!form.department.trim()) return setError('Department is required.');
      if (!form.workLocation.trim()) return setError('Work location is required.');
      const passwordError = passwordStrengthError(form.password);
      if (passwordError) return setError(passwordError);
      create.mutate(
        {
          email: form.email.trim().toLowerCase(),
          name,
          password: form.password,
          role: form.role,
          is_active: form.isActive,
          ...(subTypeValue ? { sub_type: subTypeValue } : {}),
          ...profileFields,
          joining_date: form.joiningDate,
          department: form.department.trim(),
          work_location: form.workLocation.trim(),
        },
        { onSuccess: onClose },
      );
      return;
    }

    if (!user) return;
    update.mutate(
      {
        id: user.id,
        body: {
          name,
          role: form.role,
          sub_type: subTypeValue,
          is_active: form.isActive,
          ...profileFields,
        },
      },
      { onSuccess: onClose },
    );
  }

  function handleDeactivate() {
    if (!user) return;
    deactivate.mutate(user.id, {
      onSuccess: () => {
        setConfirmingDeactivate(false);
        onClose();
      },
      onError: () => setConfirmingDeactivate(false),
    });
  }

  const title = isCreate ? 'New User' : user?.name ?? '';

  const modal = (
    <div
      className="modal-overlay open"
      onClick={undefined}
      role="dialog"
      aria-modal
      aria-label={isCreate ? 'Create user' : `User: ${user?.name}`}
    >
      <div className="modal" style={{ maxWidth: 920, width: '90vw' }}>

        {/* Header */}
        <div className="modal-top">
          {!isCreate && user ? (
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-crimson), var(--color-crimson-dim))' }}
              aria-hidden
            >
              {nameInitials(user.name)}
            </span>
          ) : null}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="modal-title">{title || 'New User'}</div>
            {!isCreate && user ? (
              <div className="modal-tags">
                <span className="badge gray">{roleLabel(user.role)}</span>
                {user.sub_type ? (
                  <span className={`badge ${user.sub_type === UserSubType.SENIOR ? 'crimson' : 'blue'}`}>
                    {subTypeLabel(user.sub_type as UserSubType)}
                  </span>
                ) : null}
                <span className={`badge ${user.is_active ? 'green' : 'gray'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ) : (
              <div className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Create an internal staff account.
              </div>
            )}
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X className="w-3.5 h-3.5" aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {!editing && user ? (
            <>
              <div className="m-sec-title">User Details</div>
              {viewRows.map(([key, val]) => (
                <div key={key} className="f-row">
                  <div className="f-key">{key}</div>
                  <div className="f-val">{val}</div>
                </div>
              ))}
            </>
          ) : (
            <div className="pb-1 space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ── Personal Information Card ── */}
                <div className="bg-white border border-slate-200/90 rounded-[5px] p-3.5 shadow-xs">
                  <div className="m-sec-title font-semibold text-[#2563eb] text-xs flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
                    <User className="w-3.5 h-3.5 text-[#2563eb]" aria-hidden /> Personal Information
                  </div>
                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5">
                    <div>
                      <label className="fl">First Name *</label>
                      <input
                        className="fi"
                        value={form.firstName}
                        onChange={(e) => set('firstName', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label className="fl">Last Name *</label>
                      <input
                        className="fi"
                        value={form.lastName}
                        onChange={(e) => set('lastName', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>

                    <div>
                      <label className="fl">Email Address *</label>
                      <input
                        className="fi"
                        type="email"
                        value={form.email}
                        disabled={!isCreate}
                        onChange={(e) => set('email', e.target.value)}
                        placeholder="Enter email address"
                        style={!isCreate ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                      />
                    </div>

                    <div>
                      <label className="fl">Phone Number *</label>
                      <div className="flex items-center rounded-[5px] border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-[#2563eb] transition-all overflow-visible">
                        {/* Segment 1: Custom CountryPicker Popover with Search */}
                        <CountryPicker value={countryCode} onChange={setCountryCode} />

                        {/* Segment 2: Dial Code */}
                        <div className="bg-slate-50 border-r border-slate-200 px-2 py-1 shrink-0 flex items-center justify-center min-w-[42px]">
                          <span className="text-[11px] font-semibold text-slate-700">{countryCode}</span>
                        </div>

                        {/* Segment 3: Input Field */}
                        <input
                          className="w-full py-1 px-2.5 text-xs bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => set('phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="fl">Date of Birth</label>
                      <DatePicker
                        value={form.dateOfBirth}
                        onChange={(v) => set('dateOfBirth', v)}
                        maxDate={new Date()}
                      />
                    </div>

                    <div>
                      <label className="fl">Gender</label>
                      <select className="fi" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                        <option value="">Select gender</option>
                        {GENDER_OPTIONS.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="fl">Employee ID *</label>
                      <input
                        className="fi"
                        value={form.employeeId}
                        onChange={(e) => set('employeeId', e.target.value)}
                        placeholder="Enter employee ID (manual entry)"
                      />
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Enter unique Employee ID
                      </p>
                    </div>

                    <div>
                      <label className="fl">Joining Date *</label>
                      <DatePicker
                        value={form.joiningDate}
                        onChange={(v) => set('joiningDate', v)}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Work Information Card ── */}
                <div className="bg-white border border-slate-200/90 rounded-[5px] p-3.5 shadow-xs">
                  <div className="m-sec-title font-semibold text-[#2563eb] text-xs flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
                    <Briefcase className="w-3.5 h-3.5 text-[#2563eb]" aria-hidden /> Work Information
                  </div>
                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5">
                    <div>
                      <label className="fl">Department *</label>
                      <input
                        className="fi"
                        value={form.department}
                        onChange={(e) => set('department', e.target.value)}
                        placeholder="Select department"
                      />
                    </div>

                    <div>
                      <label className="fl">Role *</label>
                      <select
                        className="fi"
                        value={form.role}
                        onChange={(e) => set('role', e.target.value as UserRole)}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {showSubType ? (
                      <div>
                        <label className="fl">Sub-Type</label>
                        <select
                          className="fi"
                          value={form.subType}
                          onChange={(e) => set('subType', e.target.value as UserSubType | '')}
                        >
                          <option value="">— None —</option>
                          <option value={UserSubType.JUNIOR}>Junior</option>
                          <option value={UserSubType.SENIOR}>Senior</option>
                        </select>
                      </div>
                    ) : null}

                    <div>
                      <label className="fl">Reporting To</label>
                      <select
                        className="fi"
                        value={form.reportingToId}
                        onChange={(e) => set('reportingToId', e.target.value)}
                      >
                        <option value="">Select reporting manager</option>
                        {reportingManagerOptions.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="fl">Work Location *</label>
                      <input
                        className="fi"
                        value={form.workLocation}
                        onChange={(e) => set('workLocation', e.target.value)}
                        placeholder="Select work location"
                      />
                    </div>

                    <div>
                      <label className="fl">Shift</label>
                      <select className="fi" value={form.shift} onChange={(e) => set('shift', e.target.value)}>
                        <option value="">Select shift</option>
                        {SHIFT_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="fl">Remarks (Optional)</label>
                      <textarea
                        className="fi fi-ta"
                        style={{ minHeight: 34, height: 34 }}
                        value={form.workRemarks}
                        maxLength={WORK_REMARKS_MAX}
                        onChange={(e) => set('workRemarks', e.target.value)}
                        placeholder="Enter remarks"
                      />
                      <p className="text-[10px] mt-0.5 text-right" style={{ color: 'var(--text-muted)' }}>
                        {form.workRemarks.length} / {WORK_REMARKS_MAX}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Row 2: Left Card (Office Network & Max Sessions) | Right Card (Account Status, Password & Notes) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ── Left Card (50%): Office Network & Max Active Sessions ── */}
                <div className="bg-white border border-slate-200/90 rounded-[5px] p-3.5 shadow-xs space-y-3">
                  {/* Office Network (IP Whitelist) */}
                  <div>
                    <label className="fl">
                      Office Network (IP Whitelist) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-[5px] focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-[#2563eb] transition-all">
                      <input
                        className="flex-1 border-none focus:outline-none text-xs py-1 px-2 bg-transparent text-slate-800 placeholder:text-slate-400"
                        value={ipInput}
                        onChange={(e) => {
                          setIpInput(e.target.value);
                          setIpError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addIp();
                          }
                        }}
                        placeholder="Add your office's public IP address(es)"
                      />
                      <button
                        type="button"
                        onClick={addIp}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-[#2563eb] text-xs font-semibold rounded-[4px] border border-slate-200 shadow-2xs transition-colors shrink-0"
                      >
                        <Plus className="w-3 h-3 text-[#2563eb]" aria-hidden /> Add IP
                      </button>
                    </div>
                    {ipError ? <p className="text-[10px] text-red-500 mt-0.5">{ipError}</p> : null}
                    {form.ipWhitelist.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 items-center mt-1.5">
                        {form.ipWhitelist.map((ip) => (
                          <span
                            key={ip}
                            className="inline-flex items-center gap-1.5 bg-blue-50/70 text-[#2563eb] text-xs px-2 py-0.5 rounded-[4px] font-mono border border-blue-200/80 font-medium"
                          >
                            {ip}
                            <button
                              type="button"
                              onClick={() => removeIp(ip)}
                              aria-label={`Remove ${ip}`}
                              className="text-blue-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" aria-hidden />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-0.5">No IP addresses added yet</p>
                    )}
                  </div>

                  {/* Max Active Sessions */}
                  <div>
                    <label className="fl">
                      Max Active Sessions <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="fi font-medium text-slate-800"
                      value={form.maxActiveSessions}
                      onChange={(e) => set('maxActiveSessions', e.target.value)}
                    >
                      <option value="1">1 (Single Session)</option>
                      <option value="2">2 Concurrent Sessions</option>
                      <option value="3">3 Concurrent Sessions</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-0.5">Maximum allowed concurrent login sessions</p>
                  </div>
                </div>

                {/* ── Right Card (50%): Account Status, Temporary Password & Notes ── */}
                <div className="bg-white border border-slate-200/90 rounded-[5px] p-3.5 shadow-xs space-y-2.5">
                  <div>
                    <div className="m-sec-title font-semibold text-[#2563eb] text-xs flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-100">
                      Account Status
                    </div>
                    <select
                      className="fi"
                      value={form.isActive ? 'active' : 'inactive'}
                      onChange={(e) => set('isActive', e.target.value === 'active')}
                      disabled={isSelf}
                      title={isSelf ? 'You cannot deactivate your own account' : undefined}
                      style={isSelf ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                    >
                      <option value="active">Active</option>
                      {!isSelf ? <option value="inactive">Inactive</option> : null}
                    </select>

                    {isCreate ? (
                      <div className="mt-2">
                        <label className="fl">Temporary Password *</label>
                        <div className="relative">
                          <input
                            className="fi pr-8"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={(e) => set('password', e.target.value)}
                            placeholder="Min 8 characters"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-base transition-colors"
                            onClick={() => setShowPassword((v) => !v)}
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? (
                              <EyeOff className="w-3.5 h-3.5" aria-hidden />
                            ) : (
                              <Eye className="w-3.5 h-3.5" aria-hidden />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <div className="m-sec-title font-semibold text-[#2563eb] text-xs flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-100">
                      Notes (Optional)
                    </div>
                    <textarea
                      className="fi fi-ta"
                      style={{ minHeight: 34, height: 34 }}
                      value={form.notes}
                      maxLength={NOTES_MAX}
                      onChange={(e) => set('notes', e.target.value)}
                      placeholder="Enter notes about this staff…"
                    />
                    <p className="text-[10px] mt-0.5 text-right" style={{ color: 'var(--text-muted)' }}>
                      {form.notes.length} / {NOTES_MAX}
                    </p>
                  </div>
                </div>
              </div>

              {error ? (
                <div
                  className="text-[12px] px-3 py-2 rounded-md mt-3"
                  style={{ color: '#fca5a5', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)' }}
                >
                  {error}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-actions">
          {editing ? (
            <>
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn btn-crimson" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : isCreate ? 'Create User' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              {user && user.is_active && !isSelf ? (
                <button
                  type="button"
                  className="btn btn-red"
                  onClick={() => setConfirmingDeactivate(true)}
                  style={{ marginRight: 'auto' }}
                >
                  <UserX className="w-3.5 h-3.5" aria-hidden />
                  Deactivate
                </button>
              ) : null}
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Close
              </button>
              {!isAdminTarget ? (
                <button type="button" className="btn btn-crimson" onClick={() => setEditing(true)}>
                  <Pencil className="w-3.5 h-3.5" aria-hidden />
                  Edit
                </button>
              ) : null}
            </>
          )}
        </div>

      </div>

      <ConfirmModal
        open={confirmingDeactivate}
        tone="destructive"
        title="Deactivate user?"
        description={
          <>
            This signs <strong>{user?.name}</strong> out and marks their account inactive. Their job
            history is kept, and you can re-activate them later by editing the user.
          </>
        }
        confirmLabel="Deactivate"
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmingDeactivate(false)}
      />
    </div>
  );

  return createPortal(modal, document.body);
}
