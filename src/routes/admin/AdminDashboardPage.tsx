import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSessionUser } from '@modules/auth/stores/auth-store';
import {
  Callout,
  GreetingHero,
  JobTable,
  Pagination,
  Pills,
  CsStatGrid,
  TodaysOverviewPanel,
  RecentActivityPanel,
  EmailInboxCta,
  JobFilterBar,
  EMPTY_FILTERS,
  JOB_STATUS_OPTIONS,
  applyJobFilters,
  type PillItem,
  type OverviewItem,
  type ActivityItem,
  type JobFilters,
} from '@modules/shared-ui';
import { CheckCircle2, Cog, Send, Sparkles, PlusCircle, SlidersHorizontal, Briefcase, MessageSquareText, FileText, SquarePen, Users, Clock, TrendingUp, Inbox } from 'lucide-react';
import { cn } from '@lib/utils';
import {
  useAdminJobViews,
} from '../../modules/admin-panel/hooks/use-admin-jobs';
import { useAdminClients } from '../../modules/admin-panel/hooks/use-admin-clients';
import { useUnreadCount } from '@modules/notifications/hooks/use-notifications';
import { getCardExpiryStatus, resolveClientCardExpiry } from '@lib/card-expiry';

const PER_PAGE = 12;

type FilterId = 'all' | 'In Production' | 'In QC' | 'Sewout' | 'Dispatched';
type SortOrder = 'newest' | 'oldest';

export function AdminDashboardPage() {
  const user = useSessionUser();
  const firstName = user?.name.split(' ')[0] ?? 'Admin';
  const [filter, setFilter] = useState<FilterId>('all');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [extraFilters, setExtraFilters] = useState<JobFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const { jobs, isLoading } = useAdminJobViews({ per_page: 200 });
  const { data: unreadData } = useUnreadCount();
  // per_page: 1 — we only need meta.total for the "Total Clients" stat; no items are used.
  const { data: clientsData } = useAdminClients({ per_page: 1 });
  // per_page: 500 — needed to populate the filter drawer's client dropdown with all client names.
  const filterClientsQuery = useAdminClients({ per_page: 500 });
  const filterClients = filterClientsQuery.data?.items ?? [];
  // Separate fetch (up to 100 clients) to scan for cards expired/expiring soon —
  // mirrors the same "fetch a page, compute client-side" pattern used for jobs above.
  const { data: clientsForExpiryCheck } = useAdminClients({ per_page: 100 });
  const expiringCards = useMemo(() => {
    const items = clientsForExpiryCheck?.items ?? [];
    return items
      .map((c) => ({ client: c, status: getCardExpiryStatus(resolveClientCardExpiry(c)) }))
      .filter((c): c is { client: (typeof items)[number]; status: 'expired' | 'expiring_soon' } =>
        c.status === 'expired' || c.status === 'expiring_soon',
      );
  }, [clientsForExpiryCheck]);
  const expiredCount = expiringCards.filter((c) => c.status === 'expired').length;
  const expiringSoonCount = expiringCards.filter((c) => c.status === 'expiring_soon').length;

  const active = useMemo(
    () => jobs.filter((j) => j.stage !== 'quote' && j.stage !== 'delivered' && j.status !== 'Cancelled'),
    [jobs],
  );
  const inProd = useMemo(
    () => jobs.filter((j) => j.stage === 'junior' || j.stage === 'senior'),
    [jobs],
  );
  const inQc = useMemo(() => jobs.filter((j) => j.stage === 'qc'), [jobs]);
  const delivered = useMemo(() => jobs.filter((j) => j.stage === 'delivered'), [jobs]);
  const newQuotesAll = useMemo(() => jobs.filter((j) => j.stage === 'quote'), [jobs]);

  const totalClients = clientsData?.meta.total ?? 0;
  const totalActive = active.length;

  // Missed Deadlines: active jobs whose ETA window has already elapsed
  const missedDeadlines = useMemo(() => {
    const now = Date.now();
    return active.filter((j) => {
      const deadline = new Date(j.created).getTime() + (j.etaHours ?? 0) * 3_600_000;
      return deadline < now;
    }).length;
  }, [active]);

  const onTimeRate = totalActive + delivered.length > 0
    ? Math.round((delivered.length / Math.max(totalActive + delivered.length, 1)) * 100)
    : null;

  const live = useMemo(() => active.filter((j) => j.project === 'Live'), [active]);
  const liveQuote = useMemo(() => active.filter((j) => j.project === 'Live Quote'), [active]);
  const quote = useMemo(() => active.filter((j) => j.project === 'Quote'), [active]);
  const amend = useMemo(() => active.filter((j) => j.project === 'Amend'), [active]);
  const readyToDispatch = useMemo(() => active.filter((j) => j.status === 'Ready to Deliver' || j.status === 'In QC'), [active]);

  const pills: PillItem[] = [
    { id: 'all', label: 'All', count: jobs.length },
    { id: 'Live', label: 'Live', count: live.length, dotColor: '#22c55e' },
    { id: 'Live Quote', label: 'Live Quote', count: liveQuote.length, dotColor: '#3b82f6' },
    { id: 'Quote', label: 'Quote', count: quote.length, dotColor: '#a855f7' },
    { id: 'Amend', label: 'Amend', count: amend.length, dotColor: '#f97316' },
    { id: 'In Production', label: 'In Production', count: inProd.length, dotColor: '#f59e0b' },
    { id: 'Ready to Dispatch', label: 'Ready to Dispatch', count: readyToDispatch.length, dotColor: '#14b8a6' },
  ];

  const pillFilteredJobs = useMemo(() => {
    switch (filter as string) {
      case 'Live': return live;
      case 'Live Quote': return liveQuote;
      case 'Quote': return quote;
      case 'Amend': return amend;
      case 'In Production': return inProd;
      case 'Ready to Dispatch': return readyToDispatch;
      default: return jobs;
    }
  }, [filter, jobs, live, liveQuote, quote, amend, inProd, readyToDispatch]);

  const filteredJobs = useMemo(() => {
    const withExtraFilters = applyJobFilters(pillFilteredJobs, extraFilters);
    return [...withExtraFilters].sort((a, b) => {
      const diff = new Date(b.created).getTime() - new Date(a.created).getTime();
      return sort === 'newest' ? diff : -diff;
    });
  }, [pillFilteredJobs, extraFilters, sort]);

  // Reset to page 1 whenever the active filter/sort/pill selection changes,
  // so a stale page number from a longer list doesn't leave the view empty.
  useEffect(() => {
    setPage(1);
  }, [filter, extraFilters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PER_PAGE));
  const pageJobs = useMemo(
    () => filteredJobs.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filteredJobs, page],
  );

  const overviewItems: OverviewItem[] = [
    { id: 'total-clients', label: 'Total Clients', value: totalClients, href: '/admin/clients', icon: <Users className="w-3.5 h-3.5" />, accent: '#3b82f6' },
    { id: 'new-quotes', label: 'New Quote Requests', value: newQuotesAll.length, href: '/admin/new-quotes', icon: <FileText className="w-3.5 h-3.5" />, accent: '#a855f7' },
    { id: 'in-production', label: 'In Production', value: inProd.length, href: '/admin/jobs?filter=In+Production', icon: <Cog className="w-3.5 h-3.5" />, accent: '#f97316' },
    { id: 'in-qc', label: 'In QC', value: inQc.length, href: '/admin/jobs?filter=In+QC', icon: <CheckCircle2 className="w-3.5 h-3.5" />, accent: '#14b8a6' },
    { id: 'missed-deadlines', label: 'Missed Deadlines', value: missedDeadlines, tone: missedDeadlines > 0 ? 'danger' : 'default', href: '/admin/jobs', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'on-time-rate', label: 'On-Time Rate', value: onTimeRate ?? 0, href: '/admin/jobs?filter=Dispatched', icon: <TrendingUp className="w-3.5 h-3.5" />, accent: '#22c55e' },
  ];

  const recentActivity: ActivityItem[] = useMemo(
    () =>
      [...jobs]
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
        .slice(0, 5)
        .map((job) => {
          const { icon, accent } = activityIcon(job.status);
          return {
            id: job.id,
            icon,
            accent,
            title: job.status,
            subtitle: job.design,
            time: relativeTime(job.created),
          };
        }),
    [jobs],
  );

  const loading = (v: number | string) => (isLoading ? '…' : v);

  return (
    <div className="page">
      <GreetingHero
        title={`Good ${getGreeting()}, ${firstName}`}
        subtitle="Platform-wide overview. Full access to all modules."
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/admin/create-quote"
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              New Quote
            </Link>
            <Link
              to="/admin/place-order"
              className="btn btn-crimson"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              <Send className="w-3.5 h-3.5" aria-hidden />
              Place Order
            </Link>
          </div>
        }
      />

      <CsStatGrid
        stats={[
          {
            accent: 'cs-green',
            tag: 'Live',
            description: 'Direct Orders',
            value: loading(live.length),
            statusText: 'Waiting Assignment',
            icon: <Briefcase />,
            href: '/admin/jobs?project=Live',
          },
          {
            accent: 'cs-blue',
            tag: 'Live Quote',
            description: 'Quote Approved Jobs',
            value: loading(liveQuote.length),
            statusText: 'Waiting Assignment',
            icon: <MessageSquareText />,
            href: '/admin/jobs?project=Live+Quote',
          },
          {
            accent: 'cs-purple',
            tag: 'Quote',
            description: 'Awaiting Quote / Approval',
            value: loading(quote.length),
            statusText: 'Pending Response',
            icon: <FileText />,
            href: '/admin/new-quotes',
          },
          {
            accent: 'cs-orange',
            tag: 'Amend',
            description: 'Revision Requested',
            value: loading(amend.length),
            statusText: 'Pending Assignment',
            icon: <SquarePen />,
            href: '/admin/jobs?project=Amend',
          },
          {
            accent: 'cs-amber',
            tag: 'In Production',
            description: 'Jobs In Progress',
            value: loading(inProd.length),
            statusText: 'On Production',
            icon: <Cog />,
            href: '/admin/jobs?filter=In+Production',
          },
          {
            accent: 'cs-teal',
            tag: 'Ready to Dispatch',
            description: 'Upload & Dispatch',
            value: loading(readyToDispatch.length),
            statusText: 'Ready to Send',
            icon: <Send />,
            href: '/admin/jobs?filter=Ready+to+Dispatch',
          },
        ]}
      />

      <div className="two-col">
        <div>
          <div className="pills-control-bar">
            <div className="pills-scroll-wrapper">
              <Pills items={pills} activeId={filter} onSelect={(id) => setFilter(id as FilterId)} className="dashboard-pills mb-0" />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 pills-actions">
              <select
                className="btn btn-outline"
                style={{ padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
                aria-label="Sort jobs"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <button
                type="button"
                className={cn('filter-toggle-btn', showFilters && 'active')}
                onClick={() => setShowFilters((v) => !v)}
                aria-pressed={showFilters}
              >
                <SlidersHorizontal className="w-3 h-3" aria-hidden />
                Filter
              </button>
            </div>
          </div>

          {showFilters ? (
            <JobFilterBar
              filters={extraFilters}
              onChange={setExtraFilters}
              statusOptions={JOB_STATUS_OPTIONS}
              clients={filterClients}
              className="mb-3"
            />
          ) : null}

          <div className="mt-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-text-faint text-sm">Loading…</div>
            ) : (
              <JobTable jobs={pageJobs} defaultView="grid" showActions withControls={false} minimalColumns />
            )}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={filteredJobs.length}
            perPage={PER_PAGE}
            onPageChange={setPage}
          />
        </div>

        <div className="flex flex-col gap-3">
          <TodaysOverviewPanel items={overviewItems} viewAllHref="/admin/jobs" />
          <RecentActivityPanel items={recentActivity} />
          <EmailInboxCta href="/admin/email-inbox" unreadCount={unreadData?.count ?? 0} />

          {expiringCards.length > 0 ? (
            <Callout tone={expiredCount > 0 ? 'crimson' : 'amber'}>
              {expiredCount > 0 && expiringSoonCount > 0
                ? `${expiredCount} client card${expiredCount === 1 ? '' : 's'} expired, ${expiringSoonCount} expiring within 30 days. `
                : expiredCount > 0
                  ? `${expiredCount} client card${expiredCount === 1 ? '' : 's'} already expired. `
                  : `${expiringSoonCount} client card${expiringSoonCount === 1 ? '' : 's'} expiring within 30 days. `}
              <Link to="/admin/clients" className="underline underline-offset-2">
                Review clients →
              </Link>
            </Callout>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function activityIcon(status: string): { icon: ReactNode; accent: string } {
  if (status === 'Quote Submitted') return { icon: <FileText className="w-3.5 h-3.5" />, accent: '#a855f7' };
  if (status === 'Order Placed') return { icon: <Inbox className="w-3.5 h-3.5" />, accent: '#3b82f6' };
  if (status === 'In Production') return { icon: <Cog className="w-3.5 h-3.5" />, accent: '#f97316' };
  if (status === 'In QC') return { icon: <CheckCircle2 className="w-3.5 h-3.5" />, accent: '#14b8a6' };
  if (status === 'Dispatched') return { icon: <Send className="w-3.5 h-3.5" />, accent: '#22c55e' };
  return { icon: <PlusCircle className="w-3.5 h-3.5" />, accent: '#6366f1' };
}

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
