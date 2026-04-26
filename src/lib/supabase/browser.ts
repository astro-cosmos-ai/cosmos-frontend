import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser (client component) Supabase client.
 * createBrowserClient implements a singleton by default — calling this
 * function multiple times returns the same instance.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
