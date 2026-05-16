/* eslint-disable */
/**
 * Firebase Cloud Messaging service worker — placeholder.
 *
 * Replaced at build time (or hand-edited per environment) with the real
 * Firebase web SDK initialisation once `VITE_FIREBASE_*` keys are filled
 * in `.env`. Until then this worker registers but does nothing useful;
 * `registerFcm()` will short-circuit when keys are missing.
 *
 * Reference implementation (paste once you have keys):
 *
 *   importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
 *   importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');
 *
 *   firebase.initializeApp({
 *     apiKey: '<VITE_FIREBASE_API_KEY>',
 *     authDomain: '<VITE_FIREBASE_AUTH_DOMAIN>',
 *     projectId: '<VITE_FIREBASE_PROJECT_ID>',
 *     storageBucket: '<VITE_FIREBASE_STORAGE_BUCKET>',
 *     messagingSenderId: '<VITE_FIREBASE_MESSAGING_SENDER_ID>',
 *     appId: '<VITE_FIREBASE_APP_ID>',
 *   });
 *
 *   const messaging = firebase.messaging();
 *
 *   messaging.onBackgroundMessage((payload) => {
 *     const title = payload.notification?.title ?? 'Update';
 *     self.registration.showNotification(title, {
 *       body: payload.notification?.body ?? '',
 *       icon: '/icons/icon-192.png',
 *       data: payload.data ?? {},
 *     });
 *   });
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Until real Firebase keys are wired, log incoming push events so the
// developer can confirm the SW is reachable.
self.addEventListener('push', (event) => {
  // eslint-disable-next-line no-console
  console.warn('[fcm-sw] push received before Firebase wiring:', event);
});
