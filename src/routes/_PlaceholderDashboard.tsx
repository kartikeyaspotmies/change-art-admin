import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useSessionUser } from '@modules/auth/stores/auth-store';
import { cn } from '@lib/utils';
import type { ReactNode } from 'react';

export interface StatCardSpec {
  id: string;
  label: string;
  value: string | number;
  delta?: string;
  accent: 'crimson' | 'gold' | 'teal' | 'green' | 'blue' | 'purple' | 'amber';
}

interface PlaceholderDashboardProps {
  role: string;
  stats: StatCardSpec[];
  specRef: string;
  intro: ReactNode;
}

/**
 * Shared placeholder used by every role's Phase 2c dashboard page. Each
 * per-role page passes its own stat tiles + intro copy. The "Implementation
 * landing in F-FE-XXX" callout points at the spec file so a developer
 * picking up the feature knows exactly which doc to load.
 *
 * Replaced screen-by-screen as each feature lands via its spec.
 */
export function PlaceholderDashboard({ role, stats, specRef, intro }: PlaceholderDashboardProps) {
  const user = useSessionUser();
  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <div className="anim-fade-in space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[22px] font-extrabold tracking-tight">
            Hi {firstName}
            <span className="text-crimson">.</span>
          </h2>
          <p className="text-[13px] text-text-muted mt-1 max-w-[60ch]">{intro}</p>
        </div>
        <div className="badge purple" aria-label={`Role: ${role}`}>
          {role}
        </div>
      </header>

      <section
        aria-label="Quick stats"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {stats.map((s) => (
          <article
            key={s.id}
            className={cn(
              'glass rounded-2xl p-4 relative overflow-hidden transition hover:-translate-y-0.5',
            )}
          >
            <div
              aria-hidden
              className={cn(
                'absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30 -translate-y-6 translate-x-6',
                accentBg(s.accent),
              )}
            />
            <div className="text-[10.5px] uppercase tracking-[0.14em] font-bold text-text-muted">
              {s.label}
            </div>
            <div className="mt-1.5 flex items-end gap-2">
              <div className="text-[26px] font-extrabold leading-none font-mono">{s.value}</div>
              {s.delta ? (
                <div className="text-[11px] text-status-green flex items-center gap-0.5 mb-1">
                  <ArrowUpRight aria-hidden className="w-3 h-3" /> {s.delta}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="panel-title">Coming up next</div>
          <ul className="text-[13px] space-y-2.5 text-text-muted">
            <li>• Real data wired from the backend's role-scoped endpoints.</li>
            <li>• Status timeline using <code className="font-mono text-text">@contracts/JobStatus</code>.</li>
            <li>• File uploads via tus + presigned URLs.</li>
            <li>• Real-time updates pushed through the SocketProvider.</li>
          </ul>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="panel-title">Implementation</div>
          <div className="text-[12.5px] text-text-muted space-y-2">
            <p>
              This page is a placeholder while the feature is specced. The full implementation
              ships under:
            </p>
            <p>
              <code className="font-mono text-text bg-white/5 px-2 py-1 rounded text-[11.5px]">
                {specRef}
              </code>
            </p>
            <p className="text-text-faint pt-2 flex items-center gap-1.5">
              <Sparkles aria-hidden className="w-3.5 h-3.5" /> Generated via the
              feature-spec-author subagent.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function accentBg(accent: StatCardSpec['accent']): string {
  switch (accent) {
    case 'crimson':
      return 'bg-crimson';
    case 'gold':
      return 'bg-gold';
    case 'teal':
      return 'bg-status-teal';
    case 'green':
      return 'bg-status-green';
    case 'blue':
      return 'bg-status-blue';
    case 'purple':
      return 'bg-status-purple';
    case 'amber':
      return 'bg-status-amber';
    default:
      return 'bg-text-muted';
  }
}
