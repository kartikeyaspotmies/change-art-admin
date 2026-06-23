import { useMemo, useState } from 'react';
import {
  GreetingHero,
  JobFilterBar,
  JobTable,
  Pagination,
  SectionHeader,
  StatGrid,
  applyJobFilters,
  EMPTY_FILTERS,
  QUOTE_STATUS_OPTIONS,
  type JobFilters,
} from '@modules/shared-ui';
import { useAdminJobViews } from '../../modules/admin-panel/hooks/use-admin-jobs';
import { useAdminClients } from '../../modules/admin-panel/hooks/use-admin-clients';

const FETCH_SIZE = 100;
const PER_PAGE   = 20;

export function AdminNewQuotesPage() {
  const { jobs, isLoading, isError } = useAdminJobViews({ per_page: FETCH_SIZE });
  const clientsQuery = useAdminClients();
  const clients = clientsQuery.data?.items ?? [];

  const [pendingFilters, setPendingFilters]   = useState<JobFilters>(EMPTY_FILTERS);
  const [awaitingFilters, setAwaitingFilters] = useState<JobFilters>(EMPTY_FILTERS);
  const [pendingPage, setPendingPage]         = useState(1);
  const [awaitingPage, setAwaitingPage]       = useState(1);

  const quoteJobs      = useMemo(() => jobs.filter((j) => j.stage === 'quote'), [jobs]);
  const artwork        = useMemo(() => quoteJobs.filter((j) => j.order === 'Artwork'), [quoteJobs]);
  const digit          = useMemo(() => quoteJobs.filter((j) => j.order === 'Digitizing'), [quoteJobs]);

  const basePending    = useMemo(() => quoteJobs.filter((j) => j.status === 'Quote Submitted'), [quoteJobs]);
  const baseAwaiting   = useMemo(() => quoteJobs.filter((j) => j.status === 'Quote Approved'),  [quoteJobs]);

  // Apply filters independently on respective base sets
  const pending        = useMemo(() => applyJobFilters(basePending, pendingFilters), [basePending, pendingFilters]);
  const awaitingClient = useMemo(() => applyJobFilters(baseAwaiting, awaitingFilters), [baseAwaiting, awaitingFilters]);

  const pendingPages   = Math.ceil(pending.length / PER_PAGE);
  const awaitingPages  = Math.ceil(awaitingClient.length / PER_PAGE);

  const pendingPageItems  = useMemo(
    () => pending.slice((pendingPage - 1) * PER_PAGE, pendingPage * PER_PAGE),
    [pending, pendingPage],
  );
  const awaitingPageItems = useMemo(
    () => awaitingClient.slice((awaitingPage - 1) * PER_PAGE, awaitingPage * PER_PAGE),
    [awaitingClient, awaitingPage],
  );

  function handlePendingFiltersChange(next: JobFilters) {
    setPendingFilters(next);
    setPendingPage(1);
  }

  function handleAwaitingFiltersChange(next: JobFilters) {
    setAwaitingFilters(next);
    setAwaitingPage(1);
  }

  if (isError) {
    return (
      <div className="page">
        <GreetingHero title="Quote Requests" subtitle="Incoming quote requests across all CS." />
        <div className="flex items-center justify-center py-16 text-[var(--crimson)] text-sm">
          Failed to load quotes. Please refresh and try again.
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <GreetingHero
        title="Quote Requests"
        subtitle="Incoming quote requests across all CS — track turnaround pressure, value, and conversion rate."
      />

      <StatGrid
        stats={[
          { accent: 'crimson', label: 'Pending Review',  value: isLoading ? '…' : basePending.length },
          { accent: 'amber',   label: 'Awaiting Client', value: isLoading ? '…' : baseAwaiting.length },
          { accent: 'blue',    label: 'Artwork',         value: isLoading ? '…' : artwork.length },
          { accent: 'teal',    label: 'Digitizing',      value: isLoading ? '…' : digit.length },
        ]}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-text-faint text-sm">
          Loading quotes…
        </div>
      ) : (
        <>
          <SectionHeader title="Pending Your Review" />
          <JobTable
            jobs={pendingPageItems}
            showActions
            defaultView="grid"
            emptyLabel="No pending quotes match the current filters."
            quoteView
            toolbarSlot={
              <JobFilterBar
                filters={pendingFilters}
                onChange={handlePendingFiltersChange}
                statusOptions={[]}
                clients={clients}
              />
            }
          />
          {pending.length > 0 && (
            <Pagination
              page={pendingPage}
              totalPages={pendingPages}
              total={pending.length}
              perPage={PER_PAGE}
              onPageChange={setPendingPage}
            />
          )}

          {baseAwaiting.length > 0 && (
            <div className="mt-6">
              <SectionHeader title="Price Sent — Awaiting Client" />
              <JobTable
                jobs={awaitingPageItems}
                showActions
                defaultView="grid"
                quoteView
                emptyLabel="No awaiting client quotes match the current filters."
                toolbarSlot={
                  <JobFilterBar
                    filters={awaitingFilters}
                    onChange={handleAwaitingFiltersChange}
                    statusOptions={[]}
                    clients={clients}
                  />
                }
              />
              {awaitingClient.length > 0 && (
                <Pagination
                  page={awaitingPage}
                  totalPages={awaitingPages}
                  total={awaitingClient.length}
                  perPage={PER_PAGE}
                  onPageChange={setAwaitingPage}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
