import { Link } from 'react-router-dom';
import { useIsAuthenticated, useSessionUser } from '@modules/auth/stores/auth-store';
import { pathForRole } from '@/router';

export function NotFoundPage() {
  const authed = useIsAuthenticated();
  const user = useSessionUser();
  const homePath = authed && user ? pathForRole(user.role) : '/login';
  const homeLabel = authed ? 'Back to dashboard' : 'Back to sign in';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-heavy rounded-2xl px-9 py-11 max-w-[440px] w-full anim-login text-center">
        <div className="text-[44px] font-extrabold tracking-tight">
          404<span className="text-crimson">.</span>
        </div>
        <h1 className="text-[15px] font-bold mt-1">Page not found</h1>
        <p className="text-[12.5px] text-text-muted mt-2 mb-6">
          That URL doesn't match any route in your role's permission set, or the page hasn't been built yet.
        </p>
        <Link to={homePath} className="btn btn-crimson w-full justify-center">
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
