import { createClient } from '@/lib/supabase/browser';
import { ApiError } from './errors';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!BASE_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

/**
 * Core fetch wrapper for all cosmos-backend requests.
 *
 * - Reads a fresh JWT from the Supabase browser client on every call.
 * - Sets Authorization: Bearer <token>.
 * - Normalises non-2xx responses into ApiError(status, detail).
 * - Returns the parsed JSON body typed as T, or a raw Response for binary
 *   payloads (caller must cast).
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init?.headers);

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  // Default Content-Type for requests that carry a body
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    let detail: string;
    try {
      const body = await res.json();
      detail = typeof body?.detail === 'string' ? body.detail : JSON.stringify(body);
    } catch {
      detail = res.statusText;
    }
    throw new ApiError(res.status, detail);
  }

  // 204 No Content — nothing to parse
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  // Binary (e.g. PDF) — caller receives the raw Response cast to T
  return res as unknown as T;
}
