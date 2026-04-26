import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Refreshes the Supabase session cookie on every request so that server
 * components always see a valid (non-stale) token.  Must be called from
 * Next.js middleware (src/proxy.ts) before any other middleware runs.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Start with a pass-through response; cookie mutations are applied to this.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          })),
        setAll: (cookiesToSet) => {
          // First write cookies onto the request so they are visible to
          // downstream handlers in the same middleware chain.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Re-create the response so request mutations are reflected.
          response = NextResponse.next({ request });
          // Then write them onto the outgoing response so the browser
          // persists the refreshed session.
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Calling getUser() triggers the token refresh if the current session is
  // expired.  The result is intentionally ignored here — route-level
  // protection happens in individual layout guards.
  await supabase.auth.getUser();

  return response;
}
