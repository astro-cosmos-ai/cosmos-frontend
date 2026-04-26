'use client';
import { useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useSession } from '@/lib/supabase/use-session';
import { createClient } from '@/lib/supabase/browser';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LocaleSwitcher } from './LocaleSwitcher';

const PAGES = [
  { key: 'overview', path: '/chart' },
  { key: 'chart', path: '/chart/birthchart' },
  { key: 'planets', path: '/planets' },
  { key: 'dasha', path: '/dasha' },
  { key: 'doshas', path: '/doshas' },
  { key: 'kp', path: '/kp' },
  { key: 'ashtakavarga', path: '/ashtakavarga' },
  { key: 'learn', path: '/learn' },
] as const;

export function Nav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const tabsRef = useRef<HTMLDivElement>(null);
  const { session } = useSession();

  // Scroll the active tab into view on mobile
  useEffect(() => {
    const active = tabsRef.current?.querySelector<HTMLAnchorElement>('.nav-tab.active');
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  }

  return (
    <nav className="app-nav">
      <div className="app-nav-inner">
        <Link href="/chart" className="app-logo">
          cosmos
        </Link>

        <div className="nav-tabs" ref={tabsRef}>
          {PAGES.map(({ key, path }) => {
            const isOverview = key === 'overview';
            const active = isOverview
              ? pathname === path
              : pathname.startsWith(path);
            return (
              <Link
                key={key}
                href={path}
                className={`nav-tab${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {t(key)}
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
          <ThemeSwitcher />
          <LocaleSwitcher />
          {session ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="btn"
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              {t('signOut')}
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="btn"
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
