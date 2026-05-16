import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@modules/auth/stores/auth-store';
import { authService } from '@modules/auth/services';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Bootstraps the auth store on mount by asking the server who we are. The
 * session cookie is HTTP-only, so the only way to know is to ask.
 *
 * On sign-out (triggered elsewhere via `useSignOut`), this provider clears
 * the TanStack Query cache so a previous user's data does not leak into
 * the next session.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;
    setStatus('authenticating');

    authService
      .fetchSession()
      .then((user) => {
        if (cancelled) return;
        setUser(user);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, [setUser, setStatus]);

  // When the user becomes unauthenticated, drop any cached server data.
  useEffect(() => {
    return useAuthStore.subscribe((state, prevState) => {
      if (prevState.status === 'authenticated' && state.status === 'unauthenticated') {
        queryClient.clear();
      }
    });
  }, [queryClient]);

  return <>{children}</>;
}
