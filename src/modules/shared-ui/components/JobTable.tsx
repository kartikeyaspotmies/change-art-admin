import { useMemo, useState, type ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@lib/utils';
import { jobImage, type Job } from '../mocks/jobs';

type JobView = 'grid' | 'list' | 'table';

interface JobTableProps {
  jobs: Job[];
  /** Default view; user can flip with the toggle. */
  defaultView?: JobView;
  /** Show built-in search input + view toggle (defaults true). */
  withControls?: boolean;
  /** Show the View/Edit action buttons on each row/card. */
  showActions?: boolean;
  /** Called when a row/card/list item is clicked. */
  onOpen?: (job: Job) => void;
  /** Override the row's Actions cell — runs the user's render fn instead. */
  renderActions?: (job: Job) => ReactNode;
  /** Empty-state copy when there are 0 jobs (after filter). */
  emptyLabel?: string;
}

/**
 * Toggle-able job listing — table / grid / list views matching the demo's
 * `jobTable()` helper. Owns its own search + view state.
 */
export function JobTable({
  jobs,
  defaultView = 'grid',
  withControls = true,
  showActions = false,
  onOpen,
  renderActions,
  emptyLabel = 'No jobs found',
}: JobTableProps) {
  const [view, setView] = useState<JobView>(defaultView);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      [j.id, j.ref, j.client, j.design, j.summary, j.order, j.status, j.priority]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [jobs, query]);

  if (!jobs.length) {
    return (
      <div className="jobs-root" data-view={view}>
        <EmptyState label={emptyLabel} />
      </div>
    );
  }

  const renderRowActions = renderActions ?? (showActions ? defaultActions(onOpen) : undefined);

  return (
    <div className="jobs-root" data-view={view}>
      {withControls ? (
        <div className="tbl-top">
          <input
            type="text"
            className="tbl-search"
            placeholder="Search jobs, clients, designs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search jobs"
          />
          <div className="view-toggle" role="tablist" aria-label="Job views">
            {(['grid', 'list', 'table'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                className={cn(view === v && 'on')}
                onClick={() => setView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        <>
          <TableView jobs={filtered} onOpen={onOpen} renderRowActions={renderRowActions} />
          <GridView jobs={filtered} onOpen={onOpen} renderRowActions={renderRowActions} />
          <ListView jobs={filtered} onOpen={onOpen} renderRowActions={renderRowActions} />
        </>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-text-faint">
      <Inbox aria-hidden className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function defaultActions(onOpen?: (job: Job) => void) {
  return function ActionsCell(j: Job) {
    return (
      <div className="job-actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => onOpen?.(j)}
          aria-label={`View ${j.id}`}
        >
          View
        </button>
      </div>
    );
  };
}

function statusBadgeAccent(status: string): string {
  const map: Record<string, string> = {
    'In QC': 'teal',
    'In Production': 'amber',
    'Senior Review': 'purple',
    Sewout: 'purple',
    Delivered: 'green',
    'Quote Submitted': 'blue',
    'Quote Approved': 'amber',
    'Pending Client Confirm': 'amber',
    Cancelled: 'gray',
    Amend: 'amber',
    'In Review': 'purple',
  };
  return map[status] || 'gray';
}

function orderBadgeAccent(order: string): string {
  const map: Record<string, string> = {
    Artwork: 'blue',
    Digitizing: 'teal',
    'Digitizing + Sewout': 'purple',
    Sewout: 'purple',
  };
  return map[order] || 'gray';
}

function priorityClass(priority: string): string {
  const map: Record<string, string> = {
    Normal: 'normal',
    Rush: 'rush',
    'Super Rush': 'super-rush',
  };
  return map[priority] || 'normal';
}

function Badge({ children, accent }: { children: ReactNode; accent: string }) {
  return <span className={cn('badge', accent)}>{children}</span>;
}

function PriorityChip({ priority }: { priority: string }) {
  return <span className={cn('priority-badge', priorityClass(priority))}>{priority}</span>;
}

function TableView({
  jobs,
  onOpen,
  renderRowActions,
}: {
  jobs: Job[];
  onOpen?: (job: Job) => void;
  renderRowActions?: (job: Job) => ReactNode;
}) {
  return (
    <div className="table-view">
      <table className="data-table">
        <thead>
          <tr>
            <th>Job ID / Ref</th>
            <th>Design</th>
            <th>Preview</th>
            <th>Client</th>
            <th>Order</th>
            <th>Priority</th>
            <th>Status</th>
            <th>ETA</th>
            {renderRowActions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} onClick={() => onOpen?.(j)}>
              <td>
                <div className="job-cell">
                  <img
                    className="job-thumb"
                    src={jobImage(j, 0, 160, 120)}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="ref-code">{j.id}</span>
                    <div className="text-[9.5px] text-text-faint mt-0.5">{j.ref}</div>
                  </div>
                </div>
              </td>
              <td className="font-semibold">{j.design}</td>
              <td>
                <img
                  className="table-preview"
                  src={jobImage(j, 1, 220, 160)}
                  alt={`${j.design} preview`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </td>
              <td className="text-text-muted">{j.client}</td>
              <td><Badge accent={orderBadgeAccent(j.order)}>{j.order}</Badge></td>
              <td><PriorityChip priority={j.priority} /></td>
              <td><Badge accent={statusBadgeAccent(j.status)}>{j.status}</Badge></td>
              <td className="font-mono text-[11.5px] text-text-muted">{j.eta}</td>
              {renderRowActions ? <td>{renderRowActions(j)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GridView({
  jobs,
  onOpen,
  renderRowActions,
}: {
  jobs: Job[];
  onOpen?: (job: Job) => void;
  renderRowActions?: (job: Job) => ReactNode;
}) {
  return (
    <div className="grid-view">
      {jobs.map((j) => (
        <article
          key={j.id}
          className="job-card"
          onClick={() => onOpen?.(j)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpen?.(j);
            }
          }}
        >
          <div className="jc-img">
            <img
              src={jobImage(j, 2, 400, 300)}
              alt={j.design}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="jc-body">
            <div className="jc-title">{j.design}</div>
            <div className="jc-desc">{j.summary}</div>
            <div className="jc-meta">
              <span>{j.client}</span>
              <Badge accent={orderBadgeAccent(j.order)}>{j.order}</Badge>
              <PriorityChip priority={j.priority} />
            </div>
            {renderRowActions ? renderRowActions(j) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function ListView({
  jobs,
  onOpen,
  renderRowActions,
}: {
  jobs: Job[];
  onOpen?: (job: Job) => void;
  renderRowActions?: (job: Job) => ReactNode;
}) {
  return (
    <div className="list-view">
      {jobs.map((j) => (
        <div
          key={j.id}
          className="list-item"
          onClick={() => onOpen?.(j)}
          role="button"
          tabIndex={0}
        >
          <div className="list-thumb">
            <img
              src={jobImage(j, 3, 120, 120)}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="list-body">
            <div className="font-bold text-[13px]">{j.design}</div>
            <div className="text-text-muted text-[11.5px] leading-snug">{j.summary}</div>
            <div className="text-text-muted text-[12px] flex items-center gap-2 flex-wrap">
              <span>{j.client}</span>
              <Badge accent={orderBadgeAccent(j.order)}>{j.order}</Badge>
              <Badge accent={statusBadgeAccent(j.status)}>{j.status}</Badge>
            </div>
            {renderRowActions ? renderRowActions(j) : null}
          </div>
          <div className="font-mono text-[11px] text-text-faint">{j.eta}</div>
        </div>
      ))}
    </div>
  );
}
