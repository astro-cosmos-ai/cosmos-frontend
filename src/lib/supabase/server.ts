import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server (RSC / Server Action / Route Handler) Supabase client.
 * Must be called inside an async server context where next/headers is available.
 * cookies() is async in Next.js 16 — we await it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
