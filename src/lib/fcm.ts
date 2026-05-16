import { config, isFcmConfigured } from './config';
import { apiClient } from './api-client';

/**
 * Firebase Cloud Messaging registration. Imported lazily so the Firebase
 * SDK only enters the bundle for users who opt into web push.
 *
 * Flow:
 *   1. requestPermission() — browser prompt
 *   2. getToken() — Firebase SDK, requires a registered service worker
 *   3. POST /api/v1/notifications/fcm-token — backend stores against the user
 */

interface RegisterFcmResult {
  token: string | null;
  reason: 'GRANTED' | 'DENIED' | 'UNSUPPORTED' | 'NOT_CONFIGURED';
}

export async function registerFcm(): Promise<RegisterFcmResult> {
  if (!isFcmConfigured) {
    return { token: null, reason: 'NOT_CONFIGURED' };
  }
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return { token: null, reason: 'UNSUPPORTED' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { token: null, reason: 'DENIED' };
  }

  // Lazy import — keeps Firebase out of the initial bundle.
  const [{ initializeApp, getApps }, { getMessaging, getToken }] = await Promise.all([
    import('firebase/app'),
    import('firebase/messaging'),
  ]);

  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: config.firebase.apiKey ?? '',
      authDomain: config.firebase.authDomain ?? '',
      projectId: config.firebase.projectId ?? '',
      storageBucket: config.firebase.storageBucket ?? '',
      messagingSenderId: config.firebase.messagingSenderId ?? '',
      appId: config.firebase.appId ?? '',
    });

  const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: config.firebase.vapidKey ?? '',
    serviceWorkerRegistration: swRegistration,
  });

  if (!token) {
    return { token: null, reason: 'DENIED' };
  }

  await apiClient.post<void, { token: string }>('/api/v1/notifications/fcm-token', { token });
  return { token, reason: 'GRANTED' };
}

export async function unregisterFcm(token: string): Promise<void> {
  await apiClient.delete<void>('/api/v1/notifications/fcm-token', {
    params: { token },
  });
}
