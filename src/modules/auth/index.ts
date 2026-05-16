/**
 * Public surface for the `auth` module.
 *
 * F-FE-003 — login, registration, OAuth, session bootstrap, sign-out.
 * Modules outside `auth/` consume this barrel only — never reach into
 * `auth/components|hooks|services|stores` directly.
 */

export { authService } from './services';
export type { SignInPayload, SignUpPayload } from './services';
export {
  useAuthStore,
  useSessionUser,
  useAuthStatus,
  useIsAuthenticated,
} from './stores/auth-store';
