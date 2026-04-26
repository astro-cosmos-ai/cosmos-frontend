import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-component auth guard for all /[locale]/chart/** routes.
 * Reads the session from cookies via the server Supabase client.
 * If no valid session exists, redirects to the sign-in page.
 */
export default async function ChartLayout({ children, params }: Props) {
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  return <>{children}</>;
}
