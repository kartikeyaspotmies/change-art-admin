import { Menu, Moon, Sparkles, Sun } from 'lucide-react';
import { useTheme } from '@providers/ThemeProvider';
import { Theme } from '@contracts';
import { useSessionUser } from '@modules/auth/stores/auth-store';
import { initials } from '@lib/utils';
import { NotificationBell } from './NotificationBell';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onOpenMobileNav: () => void;
}

/**
 * Top app bar — page title + AI search placeholder + bell + theme + avatar.
 * The "Ask AI…" input is intentionally non-functional in v1 per FE-D-002;
 * a tooltip explains it to keyboard users so they don't waste effort.
 */
export function Topbar({ title, subtitle, onOpenMobileNav }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const user = useSessionUser();

  return (
    <header
      className="sticky top-0 z-30 h-[var(--topbar-h)] px-4 md:px-6 flex items-center gap-3 border-b border-glass-border glass"
      aria-label="Top bar"
    >
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="md:hidden btn btn-outline !p-2"
        aria-label="Open navigation"
      >
        <Menu aria-hidden className="w-4 h-4" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="text-[15px] font-bold leading-none truncate">{title}</h1>
        {subtitle ? (
          <p className="text-[11px] text-text-muted mt-0.5 truncate">{subtitle}</p>
        ) : null}
      </div>

      {/* AI search placeholder — non-functional in v1, see FE-D-002 */}
      <label className="hidden lg:flex items-center gap-2 max-w-[320px] flex-1 relative" htmlFor="ai-search">
        <Sparkles aria-hidden className="w-3.5 h-3.5 text-text-faint absolute left-3" />
        <input
          id="ai-search"
          type="text"
          placeholder="Ask AI…  (coming soon)"
          disabled
          aria-disabled="true"
          title="AI search is coming in a future release"
          className="inp !pl-9 !py-2 !text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </label>

      <NotificationBell />

      <button
        type="button"
        onClick={toggleTheme}
        className="btn btn-outline !p-2"
        aria-label={theme === Theme.DARK ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === Theme.DARK ? (
          <Sun aria-hidden className="w-4 h-4" />
        ) : (
          <Moon aria-hidden className="w-4 h-4" />
        )}
      </button>

      {user ? (
        <div
          className="hidden md:flex items-center gap-2 pl-3 ml-1 border-l border-glass-border"
          aria-label="Account"
        >
          <div
            aria-hidden
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--color-crimson), var(--color-crimson-dim))',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}
          >
            {initials(user.name)}
          </div>
          <div className="leading-tight">
            <div className="text-[12px] font-semibold truncate max-w-[140px]">{user.name}</div>
            <div className="text-[10.5px] text-text-muted truncate max-w-[140px]">
              {user.email}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
