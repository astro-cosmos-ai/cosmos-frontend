'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { useSadeSati } from '@/lib/query/transits';
import { getStoredChartId } from '../page';

export default function SadeSatiPage() {
  const t = useTranslations('sadeSatiPage');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  const { data, isLoading, isError } = useSadeSati(chartId ?? undefined);

  return (
    <>
      <div className="sky-bg" aria-hidden="true" />
      <Nav />
      <main className="page fade-in" style={{ paddingTop: 40 }}>
        {/* Page header */}
        <div className="section-head" style={{ textAlign: 'left', marginBottom: 36 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('eyebrow')}</div>
          <h1 className="serif">{t('title')}</h1>
          <p className="muted" style={{ marginTop: 8, fontSize: 14, maxWidth: 560 }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Explainer */}
        <div
          className="card"
          style={{ padding: '18px 22px', marginBottom: 28, maxWidth: 640 }}
        >
          <div className="eyebrow" style={{ marginBottom: 8 }}>{t('whatIsTitle')}</div>
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
            {t('whatIsBody')}
          </p>
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

        {/* Result */}
        {hydrated && data && (
          <div style={{ maxWidth: 640 }}>
            {/* Status banner */}
            <div
              className="card"
              style={{
                padding: '20px 24px',
                marginBottom: 20,
                borderColor: data.active ? 'var(--planet-saturn)' : 'var(--border)',
                background: data.active ? 'color-mix(in srgb, var(--planet-saturn) 8%, var(--bg-card))' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span
                  className="serif"
                  style={{
                    fontSize: 17,
                    color: data.active ? 'var(--planet-saturn)' : 'var(--ink)',
                  }}
                >
                  {data.active ? t('statusActive') : t('statusInactive')}
                </span>
                {data.phase && (
                  <span className="chip chip-accent" style={{ fontSize: 11 }}>
                    {data.phase}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 12,
                }}
              >
                <div>
                  <div className="dim" style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {t('natalMoonSign')}
                  </div>
                  <div className="serif" style={{ fontSize: 15 }}>
                    {t('signNumber', { n: data.natal_moon_sign })}
                  </div>
                </div>
                <div>
                  <div className="dim" style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {t('saturnTransitSign')}
                  </div>
                  <div className="serif" style={{ fontSize: 15 }}>
                    {t('signNumber', { n: data.saturn_transit_sign })}
                  </div>
                </div>
                <div>
                  <div className="dim" style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {t('houseFromMoon')}
                  </div>
                  <div className="serif" style={{ fontSize: 15 }}>
                    {t('houseNumber', { n: data.saturn_transit_house_from_moon })}
                  </div>
                </div>
              </div>
            </div>

            {/* Severity factors */}
            {data.severity_factors.length > 0 && (
              <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>
                  {t('severityFactors')}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.severity_factors.map((factor, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: 'var(--planet-saturn)', marginTop: 2 }}>•</span>
                      <span className="muted" style={{ fontSize: 13.5 }}>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Note from backend */}
            {data.note && (
              <div className="card" style={{ padding: '14px 18px' }}>
                <p className="muted" style={{ fontSize: 13, fontStyle: 'italic' }}>
                  {data.note}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
