import type { ReactNode } from 'react';
import { cn } from '@lib/utils';

export type StatAccent = 'crimson' | 'gold' | 'teal' | 'green' | 'blue' | 'purple' | 'amber';

export interface StatCardProps {
  accent: StatAccent;
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  deltaDirection?: 'up' | 'down' | 'none';
  /** Icon rendered in the top-right corner (lucide-react element). */
  icon?: ReactNode;
}

export function StatCard({
  accent,
  label,
  value,
  delta,
  deltaDirection = 'none',
  icon,
}: StatCardProps) {
  return (
    <article className={cn('stat-card', accent)}>
      {icon ? <span className="stat-ico" aria-hidden>{icon}</span> : null}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta ? (
        <div className={cn('stat-delta', deltaDirection !== 'none' && deltaDirection)}>{delta}</div>
      ) : null}
    </article>
  );
}

interface StatGridProps {
  stats: StatCardProps[];
  className?: string;
}

export function StatGrid({ stats, className }: StatGridProps) {
  return (
    <section className={cn('stats-grid', className)} aria-label="Stats">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </section>
  );
}
