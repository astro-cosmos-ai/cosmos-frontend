'use client';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTransition } from 'react';

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'te', label: 'తె' },
] as const;

type LocaleCode = (typeof LOCALES)[number]['code'];

export function LocaleSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: LocaleCode) {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <select
      value={locale}
      onChange={(e) => switchLocale(e.target.value as LocaleCode)}
      disabled={isPending}
      aria-label={t('switchLocale')}
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--border)',
        color: 'var(--ink-soft)',
        fontSize: 12,
        padding: '4px 8px',
        borderRadius: 6,
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {LOCALES.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}
