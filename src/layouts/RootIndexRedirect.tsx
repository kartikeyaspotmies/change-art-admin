import { Navigate } from 'react-router-dom';
import { useAuthStatus, useSessionUser } from '@modules/auth/stores/auth-store';
import { pathForRole } from '@/router';

/**
 * The `/` index. Redirects to the role-canonical home if authenticated,
 * or to `/login` otherwise. Renders nothing while the auth bootstrap is
 * still in flight so we don't flash the wrong page.
 */
export function RootIndexRedirect() {
  const status = useAuthStatus();
  const user = useSessionUser();

  if (status === 'idle' || status === 'authenticating') {
    return <FullPageLoader />;
  }

  if (status === 'authenticated' && user) {
    return <Navigate to={pathForRole(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
}

function FullPageLoader() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="glass rounded-2xl px-6 py-4 text-sm text-text-muted">Loading…</div>
    </div>
  );
}
