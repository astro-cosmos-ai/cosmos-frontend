'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { DashaTimeline } from '@/components/DashaTimeline';
import { useTimeline } from '@/lib/query/timeline';
import { getStoredChartId } from '../page';

export default function DashaPage() {
  const t  = useTranslations('dashaPage');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  const { data: timeline, isLoading, isError } = useTimeline(chartId ?? undefined);

  return (
    <>
      <div className="sky-bg" aria-hidden="true" />
      <Nav />
      <main className="page fade-in" style={{ paddingTop: 40 }}>
        {/* Page header */}
        <div className="section-head" style={{ textAlign: 'left', marginBottom: 36 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('vimshottari')}</div>
          <h1 className="serif">{t('title')}</h1>
          <p className="muted" style={{ marginTop: 8, fontSize: 14, maxWidth: 560 }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Loading */}
        {(!hydrated || isLoading) && (
          <div className="dim" style={{ textAlign: 'center', paddingTop: 80 }}>
            {t('loading')}
          </div>
        )}

        {/* Error */}
        {hydrated && isError && (
          <p
            role="alert"
            style={{ color: 'var(--negative)', textAlign: 'center', paddingTop: 80 }}
          >
            {t('error')}
          </p>
        )}

        {/* Timeline */}
        {timeline && (
          <div style={{ maxWidth: 720 }}>
            <DashaTimeline timeline={timeline} />
          </div>
        )}
      </main>
    </>
  );
}
