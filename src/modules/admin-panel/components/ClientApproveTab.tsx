import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import type { IClient } from '@contracts';
import { useApprovedClients, usePendingClients, useRejectedClients } from '../hooks/use-admin-clients';
import { ApproveClientModal } from './ApproveClientModal';
import { RejectClientModal } from './RejectClientModal';

type SubTab = 'pending' | 'approved' | 'rejected';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Row-click detail popup ───────────────────────────────────────────────────

interface ClientDetailPopupProps {
  client: IClient | null;
  subTab: SubTab;
  onClose: () => void;
  onApprove: (c: IClient) => void;
  onReject: (c: IClient) => void;
}

function ClientDetailPopup({ client, subTab, onClose, onApprove, onReject }: ClientDetailPopupProps) {
  useEffect(() => {
    if (!client) return undefined;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [client, onClose]);

  if (!client) return null;

  const isPending = subTab === 'pending';
  const isRejected = subTab === 'rejected';

  const statusBadge =
    subTab === 'pending' ? (
      <span className="badge gold">Pending</span>
    ) : subTab === 'approved' ? (
      <span className="badge green">Approved</span>
    ) : (
      <span className="badge gray">Rejected</span>
    );

  const modal = (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal
      aria-label="Client registration details"
    >
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            {client.client_id ? <div className="modal-job-id">{client.client_id}</div> : null}
            <div className="modal-title">{client.client_name}</div>
            <div className="modal-tags">
              {statusBadge}
              {client.company_name ? <span className="badge blue">{client.company_name}</span> : null}
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X className="w-3.5 h-3.5" aria-hidden />
          </button>
        </div>

        <div className="modal-body">
          <div className="m-sec-title">Registration Details</div>

          <div className="f-row">
            <div className="f-key">Email</div>
            <div className="f-val">{client.email}</div>
          </div>
          <div className="f-row">
            <div className="f-key">Phone</div>
            <div className="f-val">{client.contact_number || '—'}</div>
          </div>
          <div className="f-row">
            <div className="f-key">Company</div>
            <div className="f-val">{client.company_name || '—'}</div>
          </div>
          <div className="f-row">
            <div className="f-key">Location</div>
            <div className="f-val">{client.country || client.location || '—'}</div>
          </div>
          <div className="f-row">
            <div className="f-key">Currency</div>
            <div className="f-val">{client.currency || 'USD'}</div>
          </div>
          <div className="f-row">
            <div className="f-key">Signed up</div>
            <div className="f-val">{formatDate(client.created_at)}</div>
          </div>

          {/* Show rejection reason for rejected clients */}
          {isRejected && client.rejection_note ? (
            <>
              <div className="m-sec-title" style={{ marginTop: 14 }}>
                Rejection Reason
              </div>
              <div
                className="px-3 py-2 rounded-md text-[12px] italic"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-main)',
                }}
              >
                &ldquo;{client.rejection_note}&rdquo;
              </div>
            </>
          ) : null}
        </div>

        <div className="modal-actions">
          {isPending ? (
            <>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-red"
                onClick={() => {
                  onClose();
                  onReject(client);
                }}
              >
                <X className="w-3.5 h-3.5" aria-hidden />
                Reject
              </button>
              <button
                type="button"
                className="btn btn-crimson"
                onClick={() => {
                  onClose();
                  onApprove(client);
                }}
              >
                <Check className="w-3.5 h-3.5" aria-hidden />
                Approve
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ─── Client table ─────────────────────────────────────────────────────────────

function ClientTable({
  clients,
  subTab,
  isLoading,
  isError,
  emptyMessage,
  onRowClick,
  onApprove,
  onReject,
}: {
  clients: IClient[];
  subTab: SubTab;
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
  onRowClick: (c: IClient) => void;
  onApprove: (c: IClient) => void;
  onReject: (c: IClient) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-faint text-sm">
        Loading…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--crimson)] text-sm">
        Failed to load clients. Please refresh and try again.
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-text-faint text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Generated ID</th>
            <th>Name</th>
            <th>Company</th>
            <th>Email / Phone</th>
            <th>Location</th>
            <th>Signup Date</th>
            {subTab === 'pending' ? <th></th> : null}
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr
              key={c.id}
              onClick={() => onRowClick(c)}
              style={{ cursor: 'pointer' }}
              className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              <td>
                <span className="ref-code">{c.client_id}</span>
              </td>
              <td className="font-semibold">{c.client_name || c.contact_name}</td>
              <td className="text-text-muted">{c.company_name || '—'}</td>
              <td>
                <div className="text-[12px]">{c.email}</div>
                <div className="font-mono text-[11px] text-text-muted">{c.contact_number}</div>
              </td>
              <td className="text-text-muted">{c.country || c.location || '—'}</td>
              <td className="text-text-muted text-[12px]">
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              {subTab === 'pending' ? (
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => onReject(c)}
                    >
                      <X className="w-3.5 h-3.5" aria-hidden />
                      Reject
                    </button>
                    <button
                      type="button"
                      className="btn btn-crimson"
                      onClick={() => onApprove(c)}
                    >
                      <Check className="w-3.5 h-3.5" aria-hidden />
                      Approve
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main tab component ───────────────────────────────────────────────────────

export function ClientApproveTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('pending');
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [approvingClient, setApprovingClient] = useState<IClient | null>(null);
  const [rejectingClient, setRejectingClient] = useState<IClient | null>(null);

  const pending = usePendingClients();
  const approved = useApprovedClients();
  const rejected = useRejectedClients();

  const subTabs: { key: SubTab; label: string; count?: number }[] = [
    { key: 'pending', label: 'Pending', count: pending.data?.length },
    { key: 'approved', label: 'Approved', count: approved.data?.length },
    { key: 'rejected', label: 'Rejected', count: rejected.data?.length },
  ];

  const activeClients =
    activeSubTab === 'pending' ? pending : activeSubTab === 'approved' ? approved : rejected;

  return (
    <>
      {/* Sub-tab buttons — same btn-crimson / btn-outline style as Profile Requests */}
      <div className="flex items-center gap-2 mb-3">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`btn ${activeSubTab === tab.key ? 'btn-crimson' : 'btn-outline'}`}
            onClick={() => setActiveSubTab(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 ? (
              <span
                className="ml-1 inline-flex items-center justify-center rounded-full text-[10px] font-semibold px-1.5 py-0.5"
                style={{
                  background:
                    activeSubTab === tab.key
                      ? 'rgba(255,255,255,0.2)'
                      : tab.key === 'pending'
                        ? 'rgba(251,191,36,0.15)'
                        : tab.key === 'approved'
                          ? 'rgba(74,222,128,0.15)'
                          : 'rgba(248,113,113,0.15)',
                  color:
                    activeSubTab === tab.key
                      ? '#fff'
                      : tab.key === 'pending'
                        ? '#fbbf24'
                        : tab.key === 'approved'
                          ? '#4ade80'
                          : '#f87171',
                }}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <ClientTable
        clients={activeClients.data ?? []}
        subTab={activeSubTab}
        isLoading={activeClients.isLoading}
        isError={activeClients.isError}
        emptyMessage={
          activeSubTab === 'pending'
            ? 'No pending clients awaiting approval.'
            : activeSubTab === 'approved'
              ? 'No approved self-registered clients yet.'
              : 'No rejected client registrations.'
        }
        onRowClick={setSelectedClient}
        onApprove={setApprovingClient}
        onReject={setRejectingClient}
      />

      {/* Row-click detail popup */}
      <ClientDetailPopup
        client={selectedClient}
        subTab={activeSubTab}
        onClose={() => setSelectedClient(null)}
        onApprove={(c) => {
          setSelectedClient(null);
          setApprovingClient(c);
        }}
        onReject={(c) => {
          setSelectedClient(null);
          setRejectingClient(c);
        }}
      />

      {/* Approve modal — for pending rows */}
      <ApproveClientModal client={approvingClient} onClose={() => setApprovingClient(null)} />

      {/* Reject modal — for pending rows */}
      <RejectClientModal client={rejectingClient} onClose={() => setRejectingClient(null)} />
    </>
  );
}
