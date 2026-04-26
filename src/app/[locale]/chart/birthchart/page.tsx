'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { NorthChart } from '@/components/NorthChart';
import { SouthChart } from '@/components/SouthChart';
import { useChart } from '@/lib/query/chart';
import { getStoredChartId } from '../page';

export default function BirthchartPage() {
  const t  = useTranslations('birthchart');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [style, setStyle] = useState<'north' | 'south'>('north');

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  const { data: chart, isLoading, isError } = useChart(chartId ?? undefined);

  return (
    <>
      <div className="sky-bg" aria-hidden="true" />
      <Nav />
      <main className="page fade-in" style={{ paddingTop: 40 }}>
        {/* Page header */}
        <div className="section-head" style={{ textAlign: 'left', marginBottom: 36 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>D1 · Rasi</div>
          <h1 className="serif">{t('title')}</h1>
          <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>{t('subtitle')}</p>
        </div>

        {/* Style toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {(['north', 'south'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={style === s ? 'chip chip-accent' : 'chip'}
              style={{ cursor: 'pointer' }}
              aria-pressed={style === s}
            >
              {t(`${s}Style`)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {(!hydrated || isLoading) && (
          <div className="dim" style={{ textAlign: 'center', paddingTop: 80 }}>
            {tc('loadingMessage')}
          </div>
        )}

        {/* Error */}
        {hydrated && isError && (
          <p role="alert" style={{ color: 'var(--negative)', textAlign: 'center', paddingTop: 80 }}>
            {tc('errorMessage')}
          </p>
        )}

        {/* Charts side by side */}
        {chart && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: style === 'north'
                ? 'minmax(0, 520px)'
                : 'minmax(0, 520px)',
              gap: 32,
              justifyContent: 'center',
            }}
          >
            <div className="card" style={{ padding: 24 }}>
              {/* Accessible title + description inside the SVG is provided by
                  NorthChart / SouthChart; add a visually-hidden summary here */}
              <p
                className="dim"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                {style === 'north' ? t('northStyle') : t('southStyle')}
                {' · '}
                {chart.astro_details?.ascendant}
                {' '}
                {tc('house')} 1
              </p>

              {/* Visually-hidden accessible summary */}
              <p className="sr-only">
                {chart.astro_details?.ascendant} ascendant.{' '}
                {Object.entries(chart.planets)
                  .filter(([k]) => k !== 'Ascendant')
                  .map(([, p]) => `${p.name} in ${p.sign} house ${p.house_parashari}`)
                  .join(', ')}
                .
              </p>

              {style === 'north'
                ? <NorthChart chart={chart} size={480} />
                : <SouthChart chart={chart} size={480} />}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
