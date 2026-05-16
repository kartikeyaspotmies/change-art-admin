import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, type ReactNode } from 'react';
import { ApiClientError } from '@lib/api-client';
import { ERROR_CODES } from '@contracts';
import { toastApiError } from '@lib/toast-error';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * TanStack Query provider. Defaults tuned for a real-time + WebSocket world:
 *   - Lower refetchOnWindowFocus (WS pushes invalidations instead).
 *   - Retries skipped for 4xx (broken request — retrying won't help).
 *   - Stale time 30s — short enough that re-mounts feel fresh, long enough
 *     to avoid hammering the API in tab-switch-heavy workflows.
 *
 * On session expiry the cache is cleared so a previous user's data does not
 * leak into the next user's view. Triggered by the AuthProvider, not here.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: (failureCount, err) => {
              if (err instanceof ApiClientError && err.status >= 400 && err.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
        queryCache: new QueryCache({
          onError: (err) => {
            // 401/403/404 are typically expected on first load for some roles.
            // Toast only on server errors or explicit conflict/lock cases.
            if (err instanceof ApiClientError) {
              const surfacedCodes: string[] = [
                ERROR_CODES.INTERNAL_ERROR,
                ERROR_CODES.CONFLICT,
                ERROR_CODES.JOB_CARD_LOCKED,
                ERROR_CODES.JOB_CARD_VERSION_MISMATCH,
                ERROR_CODES.STORAGE_ERROR,
                ERROR_CODES.RATE_LIMITED,
                ERROR_CODES.NETWORK_ERROR,
              ];
              if (surfacedCodes.includes(err.code)) {
                toastApiError(err);
              }
            }
          },
        }),
      }),
    [],
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
