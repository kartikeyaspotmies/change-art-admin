import { Bell } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@lib/utils';

/**
 * Notification bell — opens a slide-down panel. The unread count is a stub
 * in Phase 1; F-FE-014 wires it to `useNotifications()` + WebSocket events.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unread = 0; // TODO(F-FE-014): bind to TanStack Query selector

  return (
    <div className="relative">
      <button
        type="button"
        className="btn btn-outline !p-2 relative"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell aria-hidden className="w-4 h-4" />
        {unread > 0 ? (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center px-1 text-white"
            style={{ background: 'var(--color-crimson)' }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className={cn(
            'absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)]',
            'glass-heavy rounded-2xl p-4 z-40',
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[12px] font-bold uppercase tracking-wider">Notifications</h2>
            <button
              type="button"
              className="text-[11px] text-text-muted hover:text-crimson transition"
            >
              Mark all read
            </button>
          </div>
          <div className="text-[12px] text-text-muted text-center py-8" aria-live="polite">
            You're all caught up.
          </div>
        </div>
      ) : null}
    </div>
  );
}
