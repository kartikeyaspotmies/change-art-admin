import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@lib/query-keys';
import { toastApiError } from '@lib/toast-error';
import {
  notificationsService,
  type ListNotificationsFilters,
} from '../services/notifications.service';

export function useNotifications(filters: ListNotificationsFilters = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters as Record<string, unknown>),
    queryFn: () => notificationsService.list(filters),
    staleTime: 30 * 1000,
    enabled,
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const data = await notificationsService.unreadCount();
      if (import.meta.env.DEV) {
        // Surfaces the raw API response in the console so a "0 despite
        // notifications exist" mystery is easy to diagnose.
        console.info('[bell] unread-count fetched:', data);
      }
      return data;
    },
    staleTime: 30 * 1000,
    // The badge is kept live in real time by the NOTIFICATION_NEW socket
    // event (see SocketProvider), which optimistically increments this cache
    // entry — so we do NOT poll on an interval and we do NOT refetch on window
    // focus (which would re-hit /unread-count on every tab switch). The count
    // is fetched once on mount; opening the bell panel forces an explicit
    // reconciliation, and refetchOnReconnect (global default) covers a dropped
    // connection. This inherits the global refetchOnWindowFocus: false.
    enabled,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    // Optimistically tick the badge down by 1 the moment the user clicks
    // the checkmark, so the UI feels instant even with network latency.
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });
      const prev = qc.getQueryData<{ count: number }>(queryKeys.notifications.unreadCount());
      qc.setQueryData<{ count: number }>(
        queryKeys.notifications.unreadCount(),
        (old) => ({ count: Math.max(0, (old?.count ?? 0) - 1) }),
      );
      return { prev };
    },
    onError: (err, _id, ctx) => {
      // Roll back the optimistic decrement if the request failed.
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.notifications.unreadCount(), ctx.prev);
      }
      toastApiError(err);
    },
    onSettled: () => {
      // Count was already moved optimistically above — only the list needs a
      // refresh. Invalidating notifications.all() would also re-hit
      // /unread-count, which we explicitly avoid.
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });
      const prev = qc.getQueryData<{ count: number }>(queryKeys.notifications.unreadCount());
      qc.setQueryData(queryKeys.notifications.unreadCount(), { count: 0 });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.notifications.unreadCount(), ctx.prev);
      }
      toastApiError(err);
    },
    onSettled: () => {
      // Count was already zeroed optimistically above — only the list needs a
      // refresh, so we don't re-hit /unread-count here.
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}
