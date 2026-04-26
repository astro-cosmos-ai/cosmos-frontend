import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / magic-link callback handler.
 * Supabase redirects here after the provider flow with a `code` query param.
 * We exchange the code for a session, then redirect into the app.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/${locale}/chart`);
    }
  }

  // Something went wrong — send back to sign-in with an error hint.
  return NextResponse.redirect(
    `${origin}/${locale}/sign-in?error=auth_callback_failed`,
  );
}
