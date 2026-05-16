import { apiClient, ApiClientError } from '@lib/api-client';
import { ERROR_CODES, type SessionUser } from '@contracts';

/**
 * Auth service — thin wrapper around Better Auth's HTTP routes. The session
 * cookie is HTTP-only and managed by the server. This service NEVER reads
 * or writes a cookie directly.
 *
 * Routes follow Better Auth's Express adapter mount point (`/api/auth/*`).
 */

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
}

/** Better Auth's session shape. We only need the user portion. */
interface BetterAuthSessionResponse {
  data?: {
    session?: { id: string; userId: string; expiresAt: string };
    user?: BetterAuthUser;
  } | null;
  user?: BetterAuthUser;
}

interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  sub_type?: string | null;
  tenant_id?: string;
  is_active?: boolean;
}

function adaptUser(raw: BetterAuthUser | null | undefined): SessionUser | null {
  if (!raw) return null;
  if (!raw.role || !raw.tenant_id || raw.is_active === undefined) {
    // Server returned a partial session — treat as unauthenticated rather
    // than guessing fields and risking a role mismatch.
    return null;
  }
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    role: raw.role as SessionUser['role'],
    sub_type: (raw.sub_type as SessionUser['sub_type']) ?? null,
    tenant_id: raw.tenant_id,
    is_active: raw.is_active,
  };
}

export const authService = {
  /** Fetch the current session. Returns null when the cookie is missing or invalid. */
  async fetchSession(): Promise<SessionUser | null> {
    try {
      const res = await apiClient.raw.get<BetterAuthSessionResponse>('/api/auth/get-session', {
        validateStatus: (status) => status < 500,
      });
      if (res.status === 401 || res.status === 403) return null;
      const u = res.data.user ?? res.data.data?.user ?? null;
      return adaptUser(u);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === ERROR_CODES.NETWORK_ERROR) {
        throw err;
      }
      return null;
    }
  },

  async signIn(payload: SignInPayload): Promise<SessionUser> {
    const res = await apiClient.raw.post<BetterAuthSessionResponse>(
      '/api/auth/sign-in/email',
      payload,
    );
    const user = adaptUser(res.data.user ?? res.data.data?.user ?? null);
    if (!user) {
      throw new ApiClientError({
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Sign-in succeeded but no session user was returned.',
        status: 500,
      });
    }
    return user;
  },

  async signUp(payload: SignUpPayload): Promise<SessionUser> {
    const res = await apiClient.raw.post<BetterAuthSessionResponse>(
      '/api/auth/sign-up/email',
      payload,
    );
    const user = adaptUser(res.data.user ?? res.data.data?.user ?? null);
    if (!user) {
      throw new ApiClientError({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Sign-up succeeded but no session user was returned.',
        status: 500,
      });
    }
    return user;
  },

  async signOut(): Promise<void> {
    await apiClient.raw.post<void>('/api/auth/sign-out', undefined, {
      validateStatus: () => true,
    });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.raw.post<void>('/api/auth/forget-password', { email });
  },

  signInWithGoogleUrl(): string {
    return '/api/auth/sign-in/social?provider=google';
  },
};
