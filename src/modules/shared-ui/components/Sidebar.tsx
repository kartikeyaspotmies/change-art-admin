import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useSessionUser } from '@modules/auth/stores/auth-store';
import { NAV_CONFIG, type NavItem } from '@modules/shared-ui/nav-config';
import { authService } from '@modules/auth/services';
import { useAuthStore } from '@modules/auth/stores/auth-store';
import { cn, initials } from '@lib/utils';

interface SidebarProps {
  collapsedOnMobile: boolean;
  onNavigateMobile: () => void;
}

/**
 * Role-aware sidebar. Matches the demo's left-rail treatment:
 *   - 230px width on desktop, slide-in on mobile
 *   - Brand pill (role label), grouped nav sections, bottom user card
 *   - Active route uses gradient + left-edge accent stripe per index.css
 */
export function Sidebar({ collapsedOnMobile, onNavigateMobile }: SidebarProps) {
  const user = useSessionUser();
  const reset = useAuthStore((s) => s.reset);

  if (!user) return null;

  const navConfig = NAV_CONFIG[user.role];

  async function handleSignOut() {
    await authService.signOut();
    reset();
  }

  return (
    <aside
      className={cn(
        'fixed md:static top-0 left-0 z-40 h-full flex flex-col overflow-hidden transition-transform',
        'w-[var(--sidebar-w)] flex-shrink-0',
        'glass-heavy border-r border-glass-border',
        collapsedOnMobile ? '-translate-x-full md:translate-x-0' : 'translate-x-0',
      )}
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-glass-border relative">
        <div className="text-[26px] tracking-wider font-extrabold leading-none">
          CHANGE<span className="text-crimson">!</span>
        </div>
        <div className="text-[10px] mt-1 font-semibold uppercase tracking-[0.14em] text-text-faint">
          Production Platform
        </div>
        {/* Role pill */}
        <div
          className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2 border"
          style={{
            background:
              'linear-gradient(135deg, rgba(196,30,58,0.12), rgba(10,26,58,0.3))',
            borderColor: 'rgba(196,30,58,0.25)',
          }}
        >
          <span
            className="anim-pulse w-1.5 h-1.5 rounded-full bg-crimson flex-shrink-0"
            aria-hidden
          />
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#ff8a95]">
            {navConfig.label}
          </span>
        </div>
      </div>

      {/* Sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5" aria-label="Sections">
        {navConfig.sections.map((section) => (
          <div key={section.id} className="py-1">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-text-faint px-2 mb-1.5">
              {section.label}
            </div>
            <ul>
              {section.items.map((item) => (
                <SidebarItem key={item.id} item={item} onClick={onNavigateMobile} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="mt-auto p-4 border-t border-glass-border bg-black/15">
        <div className="flex items-center gap-2.5">
          <div
            aria-hidden
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-crimson), var(--color-crimson-dim))',
              border: '1.5px solid rgba(255,255,255,0.2)',
              boxShadow: '0 2px 12px var(--color-crimson-glow)',
            }}
          >
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold truncate">{user.name}</div>
            <div className="text-[10.5px] text-text-muted truncate">
              {navConfig.label}
              {user.sub_type ? ` · ${user.sub_type.toLowerCase()}` : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="ml-auto px-2 py-1.5 rounded-md border border-glass-border text-text-muted text-[11px] hover:border-crimson/50 hover:text-crimson transition"
            aria-label="Sign out"
          >
            <LogOut aria-hidden className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to.split('/').length <= 2}
        onClick={onClick}
        className={({ isActive }) => cn('nav-item', isActive && 'active')}
      >
        <Icon aria-hidden className="w-[15px] h-[15px] flex-shrink-0" />
        <span className="truncate">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 ? (
          <span
            className={cn('nav-badge', item.badgeAccent === 'amber' && 'amber')}
            aria-label={`${item.badge} new`}
          >
            {item.badge}
          </span>
        ) : null}
      </NavLink>
    </li>
  );
}
