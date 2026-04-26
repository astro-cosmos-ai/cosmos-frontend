import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // 1. Refresh Supabase session first so server components always see a valid
  //    token.  updateSession returns a NextResponse that carries refreshed
  //    Set-Cookie headers.
  const supabaseResponse = await updateSession(request);

  // 2. Run next-intl locale routing on the same request.
  const intlResponse = intlMiddleware(request);

  // 3. Merge: copy any Set-Cookie headers that Supabase wrote onto the
  //    intl response so the browser receives the refreshed session.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      // Preserve the attributes from the original cookie object.
      // The Next.js ResponseCookie type includes all standard attributes.
      ...cookie,
    });
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
