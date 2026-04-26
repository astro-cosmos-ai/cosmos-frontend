'use client';

import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from './browser';

interface SessionState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

/**
 * Client-side hook that returns the current Supabase session.
 * Subscribes to auth state changes so it stays in sync after
 * sign-in / sign-out / token refresh events.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    // Seed with the current session immediately.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ session, user: session?.user ?? null, loading: false });
    });

    // Keep in sync with any subsequent auth events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, user: session?.user ?? null, loading: false });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
