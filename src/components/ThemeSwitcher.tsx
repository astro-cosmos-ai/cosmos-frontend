'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const THEMES = [
  { k: 'dusk', val: '' },
  { k: 'dawn', val: 'dawn' },
  { k: 'mist', val: 'mist' },
] as const;

type ThemeKey = (typeof THEMES)[number]['k'];

const STORAGE_KEY = 'cosmos-theme';

export function ThemeSwitcher() {
  const t = useTranslations('nav');
  const [theme, setTheme] = useState<ThemeKey>('dusk');

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) ?? 'dusk') as ThemeKey;
    applyTheme(saved);
    setTheme(saved);
  }, []);

  function applyTheme(k: ThemeKey) {
    const val = k === 'dusk' ? '' : k;
    document.documentElement.setAttribute('data-theme', val);
  }

  function pick(k: ThemeKey) {
    applyTheme(k);
    localStorage.setItem(STORAGE_KEY, k);
    setTheme(k);
  }

  return (
    <div className="theme-switch" role="tablist" aria-label={t('theme')}>
      {THEMES.map((th) => (
        <button
          key={th.k}
          type="button"
          role="tab"
          aria-selected={theme === th.k}
          aria-label={t(`theme_${th.k}`)}
          title={t(`theme_${th.k}`)}
          className={`theme-swatch-${th.k}${theme === th.k ? ' active' : ''}`}
          onClick={() => pick(th.k)}
        />
      ))}
    </div>
  );
}
