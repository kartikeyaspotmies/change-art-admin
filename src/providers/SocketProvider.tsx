import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  SOCKET_EVENTS,
  type JobAssignedEvent,
  type JobStatusChangedEvent,
  type NotificationNewEvent,
  type FileUploadCompleteEvent,
  type QuoteUpdatedEvent,
  type ReviewSubmittedEvent,
  type ModificationRequestedEvent,
} from '@contracts';
import { useIsAuthenticated, useSessionUser } from '@modules/auth/stores/auth-store';
import { connectSocket, disconnectSocket } from '@lib/socket-client';
import { queryKeys } from '@lib/query-keys';

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * Connects the Socket.IO client once we know the user is authenticated, and
 * routes every server-to-client event into the appropriate TanStack Query
 * invalidation. The socket disconnects on sign-out so the next user does
 * not inherit stale subscriptions.
 *
 * All event names are imported from `@contracts/events.SOCKET_EVENTS` —
 * never inline a string.
 */
export function SocketProvider({ children }: SocketProviderProps) {
  const isAuthenticated = useIsAuthenticated();
  const user = useSessionUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    socket.on(SOCKET_EVENTS.JOB_STATUS_CHANGED, (event: JobStatusChangedEvent) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(event.jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.timeline(event.jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
    });

    socket.on(SOCKET_EVENTS.JOB_ASSIGNED, (event: JobAssignedEvent) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(event.jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
    });

    socket.on(SOCKET_EVENTS.REVIEW_SUBMITTED, (event: ReviewSubmittedEvent) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.forJob(event.jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(event.jobId) });
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (event: NotificationNewEvent) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      toast(event.notification.title, {
        id: `notif-${event.notification.id}`,
        icon: '🔔',
        duration: 4500,
      });
    });

    socket.on(SOCKET_EVENTS.FILE_UPLOAD_COMPLETE, (event: FileUploadCompleteEvent) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files.forJob(event.jobId) });
    });

    socket.on(SOCKET_EVENTS.QUOTE_UPDATED, (event: QuoteUpdatedEvent) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.byId(event.quoteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(event.jobId) });
    });

    socket.on(SOCKET_EVENTS.MODIFICATION_REQUESTED, (event: ModificationRequestedEvent) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(event.jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
    });

    return () => {
      socket.removeAllListeners();
      disconnectSocket();
    };
  }, [isAuthenticated, user, queryClient]);

  return <>{children}</>;
}
