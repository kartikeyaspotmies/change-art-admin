import type { ReactNode } from 'react';
import { cn } from '@lib/utils';

interface PanelProps {
  title?: ReactNode;
  /** Optional element rendered to the right of the title (e.g. View All link). */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Glass panel — the demo's primary content container.
 * Use SectionHeader for groups of panels that share a heading row.
 */
export function Panel({ title, action, className, children }: PanelProps) {
  return (
    <section className={cn('panel', className)}>
      {title ? (
        <header className="panel-title flex items-center justify-between">
          <span>{title}</span>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('sec-header', className)}>
      <h2 className="sec-title">{title}</h2>
      {action ? <div className="sec-action">{action}</div> : null}
    </div>
  );
}
