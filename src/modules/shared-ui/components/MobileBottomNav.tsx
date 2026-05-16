import { NavLink } from 'react-router-dom';
import { useSessionUser } from '@modules/auth/stores/auth-store';
import { NAV_CONFIG } from '@modules/shared-ui/nav-config';
import { cn } from '@lib/utils';

/**
 * 5-slot bottom navigation for narrow viewports. Pulls items from
 * NAV_CONFIG[role].mobile so the bar reflects the demo's per-role
 * essentials, not the entire sidebar.
 */
export function MobileBottomNav() {
  const user = useSessionUser();
  if (!user) return null;

  const items = NAV_CONFIG[user.role].mobile.slice(0, 5);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 h-[var(--mobile-nav-h)] glass border-t border-glass-border flex items-center justify-around px-2 pb-[max(0px,env(safe-area-inset-bottom))]"
      aria-label="Bottom navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.to.split('/').length <= 2}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition',
                isActive ? 'text-white' : 'text-text-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  aria-hidden
                  className={cn('w-5 h-5', isActive && 'text-crimson')}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
