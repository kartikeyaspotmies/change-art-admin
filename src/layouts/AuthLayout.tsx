import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStatus, useSessionUser } from '@modules/auth/stores/auth-store';
import { pathForRole } from '@/router';
import { config } from '@lib/config';

/**
 * Unauthenticated-routes shell. Houses the login / register / forgot-password
 * pages inside a centred glass card that mirrors the change_artwork demo's
 * #login-screen treatment.
 *
 * If the user is already authenticated, redirect to their canonical home —
 * the auth pages should never be reachable mid-session.
 */
export function AuthLayout() {
  const status = useAuthStatus();
  const user = useSessionUser();
  const location = useLocation();

  if (status === 'authenticating') {
    return null;
  }

  if (status === 'authenticated' && user) {
    const fallback = pathForRole(user.role);
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? fallback} replace />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative">
      <div className="w-full max-w-[460px] glass-heavy rounded-2xl px-9 py-11 anim-login">
        <header className="mb-7 flex items-center gap-3">
          <div
            aria-hidden
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-extrabold"
            style={{
              background: 'linear-gradient(135deg, var(--color-crimson), var(--color-crimson-dim))',
              boxShadow: '0 4px 20px var(--color-crimson-glow)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            C!
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-wide">{config.appName}</div>
            <div className="text-[11px] text-text-muted">Production lifecycle for creative agencies</div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
