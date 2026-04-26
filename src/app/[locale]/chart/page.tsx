'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/Nav';
import { BirthForm } from '@/components/BirthForm';
import { NorthChart } from '@/components/NorthChart';
import { SouthChart } from '@/components/SouthChart';
import { useChart } from '@/lib/query/chart';
import type { Chart } from '@/lib/api/types';

// ---------------------------------------------------------------------------
// localStorage key used to persist the chartId across sessions.
// The BirthForm's onSuccess callback writes this; we read it on mount.
// ---------------------------------------------------------------------------
const CHART_ID_KEY = 'cosmos_chart_id';

export function getStoredChartId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CHART_ID_KEY);
}

export function setStoredChartId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHART_ID_KEY, id);
}

// ---------------------------------------------------------------------------
// Inner component: rendered once we have a chart
// ---------------------------------------------------------------------------
function ChartOverview({ chart }: { chart: Chart }) {
  const t = useTranslations('chartOverview');
  const ts = useTranslations('signs');
  const tp = useTranslations('planetNames');
  const locale = useLocale();

  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  const ascendant = chart.astro_details?.ascendant ?? '—';
  const moonSign = chart.planets?.Moon?.sign ?? '—';
  const sunSign = chart.planets?.Sun?.sign ?? '—';

  const majorDasha = chart.current_dasha?.major;
  const minorDasha = chart.current_dasha?.minor;

  const quickLinks = [
    { key: 'viewBirthChart', href: '/chart/birthchart' },
    { key: 'viewPlanets',    href: '/chart/planets' },
    { key: 'viewDasha',      href: '/chart/dasha' },
    { key: 'viewAnalyses',   href: '/chart/analyses' },
    { key: 'viewChat',       href: '/chart/chat' },
  ] as const;

  return (
    <section aria-labelledby="overview-heading">
      {/* Page header */}
      <div className="section-head" style={{ textAlign: 'left', marginBottom: 36 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>{t('birthDetails')}</div>
        <h1 id="overview-heading" className="serif" style={{ marginBottom: 8 }}>
          {chart.name}
        </h1>
        <p className="muted" style={{ fontSize: 13.5 }}>
          {chart.dob} · {chart.tob.slice(0, 5)} · {chart.pob_name}
        </p>
      </div>

      {/* Chart + style toggle */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 28,
          alignItems: 'center',
          padding: '28px 32px',
          marginBottom: 24,
        }}
      >
        {/* Style toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {chartStyle === 'north'
            ? <NorthChart chart={chart} size={280} />
            : <SouthChart chart={chart} size={280} />}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {(['north', 'south'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setChartStyle(s)}
                className={chartStyle === s ? 'chip chip-accent' : 'chip'}
                style={{ cursor: 'pointer' }}
                aria-pressed={chartStyle === s}
              >
                {t(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Big Three + Dasha */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>{t('bigThree')}</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              { label: t('ascendant'), value: ascendant },
              { label: t('moonSign'),  value: moonSign  },
              { label: t('sunSign'),   value: sunSign   },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  textAlign: 'center',
                }}
              >
                <div
                  className="dim"
                  style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}
                >
                  {label}
                </div>
                <div className="serif" style={{ fontSize: 16 }}>
                  {value !== '—'
                    ? ts(value as Parameters<typeof ts>[0])
                    : '—'}
                </div>
              </div>
            ))}
          </div>

          {majorDasha && (
            <>
              <div className="eyebrow" style={{ marginBottom: 12 }}>{t('currentDasha')}</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div className="dim" style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {t('majorPeriod')}
                  </div>
                  <div className="serif" style={{ fontSize: 16, color: 'var(--accent)' }}>
                    {tp(majorDasha.planet as Parameters<typeof tp>[0])}
                  </div>
                  <div className="dim" style={{ fontSize: 11 }}>
                    {majorDasha.start} – {majorDasha.end}
                  </div>
                </div>
                {minorDasha && (
                  <div>
                    <div className="dim" style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {t('minorPeriod')}
                    </div>
                    <div className="serif" style={{ fontSize: 16 }}>
                      {tp(minorDasha.planet as Parameters<typeof tp>[0])}
                    </div>
                    <div className="dim" style={{ fontSize: 11 }}>
                      {minorDasha.start} – {minorDasha.end}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick-navigation links */}
      <div className="eyebrow" style={{ marginBottom: 14 }}>{t('explore')}</div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {quickLinks.map(({ key, href }) => (
          <Link key={key} href={href} className="btn">
            {t(key)}
          </Link>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Shell component: manages chartId bootstrap from localStorage
// ---------------------------------------------------------------------------
function ChartShell() {
  const t = useTranslations('chartOverview');
  const tc = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Read chartId from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  const {
    data: chart,
    isLoading,
    isError,
    error,
  } = useChart(chartId ?? undefined);

  // When BirthForm creates a chart, persist its ID and refetch
  function handleFormSuccess(newChartId: string) {
    setStoredChartId(newChartId);
    setChartId(newChartId);
    router.refresh();
  }

  // Waiting for localStorage read on first render
  if (!hydrated) {
    return (
      <div className="dim" style={{ textAlign: 'center', paddingTop: 80 }}>
        {tc('loadingMessage')}
      </div>
    );
  }

  // No chart yet — show birth form
  if (!chartId) {
    return (
      <div style={{ maxWidth: 520, marginInline: 'auto', paddingTop: 40 }}>
        <div className="section-head" style={{ marginBottom: 32 }}>
          <h1 className="serif">{t('noChartTitle')}</h1>
          <p className="muted" style={{ marginTop: 10 }}>{t('noChartBody')}</p>
        </div>
        <div className="card">
          <BirthForm onSuccess={handleFormSuccess} />
        </div>
      </div>
    );
  }

  // Have a chartId — waiting for fetch
  if (isLoading) {
    return (
      <div className="dim" style={{ textAlign: 'center', paddingTop: 80 }}>
        {tc('loadingMessage')}
      </div>
    );
  }

  // Fetch failed — chart might have been deleted; clear stored ID and show form
  if (isError) {
    // Only clear if it's a 404 — otherwise show the error
    const status = (error as { status?: number } | null)?.status;
    if (status === 404) {
      setStoredChartId('');
      setChartId(null);
      return null;
    }
    return (
      <p
        role="alert"
        style={{ color: 'var(--negative)', textAlign: 'center', paddingTop: 80 }}
      >
        {tc('errorMessage')}
      </p>
    );
  }

  if (!chart) return null;

  return <ChartOverview chart={chart} />;
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------
export default function ChartPage() {
  return (
    <>
      <div className="sky-bg" aria-hidden="true" />
      <Nav />
      <main className="page fade-in" style={{ paddingTop: 40 }}>
        <ChartShell />
      </main>
    </>
  );
}
