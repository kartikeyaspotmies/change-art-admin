import { useSessionUser } from '@modules/auth/stores/auth-store';
import { Sparkles, Send, ClipboardList, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Callout,
  GreetingHero,
  JobTable,
  Panel,
  SectionHeader,
  StatGrid,
  JOBS,
} from '@modules/shared-ui';

// Client mock: pretend Ravi Textiles is logged in.
const CLIENT_ID = 'C001';

export function ClientDashboardPage() {
  const user = useSessionUser();
  const firstName = user?.name.split(' ')[0] ?? 'Ravi';

  const myJobs = JOBS.filter((j) => j.clientId === CLIENT_ID);
  const active = myJobs.filter((j) => j.stage !== 'delivered' && j.stage !== 'quote');
  const quotes = myJobs.filter((j) => j.stage === 'quote');
  const delivered = myJobs.filter((j) => j.stage === 'delivered');
  const amendments = myJobs.filter((j) => j.project === 'Amend');

  return (
    <div className="page">
      <GreetingHero
        title={`Hi ${firstName}`}
        subtitle="Track your active projects, review pending quotes, and download completed deliveries."
      />

      <StatGrid
        stats={[
          { accent: 'crimson', label: 'Active Projects', value: active.length },
          { accent: 'gold', label: 'Pending Quotes', value: quotes.length },
          { accent: 'teal', label: 'Delivered (mo.)', value: delivered.length },
          { accent: 'amber', label: 'Modifications', value: amendments.length },
        ]}
      />

      <div className="two-col">
        <div>
          <SectionHeader
            title="Active Projects"
            action={<Link to="/client/jobs">View All →</Link>}
          />
          <JobTable
            jobs={active.slice(0, 4)}
            defaultView="grid"
            withControls={false}
            emptyLabel="No active projects."
          />

          {quotes.length ? (
            <div className="mt-6">
              <SectionHeader
                title="Pending Your Approval"
                action={<Link to="/client/quote">View All →</Link>}
              />
              <Callout tone="amber">
                You have {quotes.length} quote{quotes.length === 1 ? '' : 's'} awaiting review.
              </Callout>
              <div className="mt-3">
                <JobTable jobs={quotes} defaultView="table" withControls={false} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <Panel title="Quick Actions">
            <div className="flex flex-col gap-2.5">
              <Link to="/client/quote" className="btn btn-crimson w-full">
                <Sparkles aria-hidden className="w-4 h-4" />
                Request a Quote
              </Link>
              <Link to="/client/place-order" className="btn btn-outline w-full">
                <Send aria-hidden className="w-4 h-4" />
                Place an Order
              </Link>
              <Link to="/client/jobs" className="btn btn-outline w-full">
                <ClipboardList aria-hidden className="w-4 h-4" />
                My Projects
              </Link>
              <Link to="/client/tracking" className="btn btn-outline w-full">
                <Package aria-hidden className="w-4 h-4" />
                Delivered Files
              </Link>
            </div>
          </Panel>

          <Panel title="Recent Activity">
            <ul className="text-[12.5px] space-y-2 text-text-muted">
              <li>• <span className="text-text">J-2025-0044</span> is now in production.</li>
              <li>• <span className="text-text">J-2025-0033</span> delivered — files ready.</li>
              <li>• Quote sent for <span className="text-text">Festival Banner Set</span>.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
