import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@lib/utils';
import { Panel } from './Panel';

export interface OverviewItem {
  id: string;
  label: string;
  value: number;
  /** 'danger' renders the value in red, e.g. for overdue counts. */
  tone?: 'default' | 'danger';
  href?: string;
  /** Leading icon rendered in a small pastel circle, matching the reference dashboard. */
  icon?: ReactNode;
  /** Accent hex colour driving the icon + label colour, e.g. '#3b82f6'. */
  accent?: string;
}

interface TodaysOverviewPanelProps {
  items: OverviewItem[];
  viewAllHref?: string;
}

/** "Today's Overview" panel — a compact icon/label/count list, per the reference dashboard. */
export function TodaysOverviewPanel({ items, viewAllHref }: TodaysOverviewPanelProps) {
  return (
    <Panel
      title="Today's Overview"
      action={viewAllHref ? <Link to={viewAllHref}>View All</Link> : undefined}
    >
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => {
          const dangerAccent = '#ef4444';
          const accent = item.tone === 'danger' ? dangerAccent : item.accent;
          const row = (
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="flex items-center gap-2.5 min-w-0">
                {item.icon ? (
                  <span
                    aria-hidden
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: accent ? `${accent}20` : 'rgba(148, 163, 184, 0.15)',
                      color: accent ?? 'var(--text-muted)',
                    }}
                  >
                    {item.icon}
                  </span>
                ) : null}
                <span
                  className={cn('truncate', item.tone !== 'danger' && 'text-text-muted')}
                  style={item.tone === 'danger' ? { color: dangerAccent } : undefined}
                >
                  {item.label}
                </span>
              </span>
              <span
                className={cn(
                  'font-semibold flex-shrink-0',
                  item.tone === 'danger' ? 'text-[var(--color-red)]' : 'text-[var(--text-main)]',
                )}
              >
                {item.value}
              </span>
            </div>
          );
          return (
            <li key={item.id}>
              {item.href ? (
                <Link to={item.href} className="block hover:opacity-70 transition">
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export interface ActivityItem {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  time: string;
  /** Accent hex colour for the icon circle, e.g. '#3b82f6'. Defaults to the crimson brand colour. */
  accent?: string;
}

interface RecentActivityPanelProps {
  items: ActivityItem[];
  viewAllHref?: string;
}

/** "Recent Activity" panel — a small icon + title/subtitle + relative-time timeline. */
export function RecentActivityPanel({ items, viewAllHref }: RecentActivityPanelProps) {
  return (
    <Panel
      title="Recent Activity"
      action={viewAllHref ? <Link to={viewAllHref}>View All</Link> : undefined}
    >
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={
                item.accent
                  ? { background: `${item.accent}20`, color: item.accent }
                  : { background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-crimson)' }
              }
            >
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium text-[var(--text-main)] truncate">{item.title}</div>
              <div className="text-[11px] text-text-faint truncate">{item.subtitle}</div>
            </div>
            <span className="flex-shrink-0 text-[10.5px] text-text-faint whitespace-nowrap">{item.time}</span>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="text-[12px] text-text-faint py-2">No recent activity.</li>
        ) : null}
      </ul>
    </Panel>
  );
}

interface EmailInboxCtaProps {
  href: string;
  unreadCount: number;
}

/** "Go to Email Inbox" CTA panel, matching the bottom-right block in the reference. */
export function EmailInboxCta({ href, unreadCount }: EmailInboxCtaProps) {
  return (
    <Link
      to={href}
      className="rounded-xl px-4 py-3.5 flex items-center gap-3 text-white transition hover:opacity-90"
      style={{ background: 'linear-gradient(135deg, var(--color-crimson), var(--color-crimson-dim))' }}
    >
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold">Go to Email Inbox</span>
        <span className="block text-[11.5px] opacity-85">
          You have {unreadCount} unread email{unreadCount === 1 ? '' : 's'}
        </span>
      </span>
      <ChevronRight aria-hidden className="w-4 h-4 flex-shrink-0" />
    </Link>
  );
}
