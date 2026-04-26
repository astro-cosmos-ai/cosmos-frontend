'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { NorthChart } from '@/components/NorthChart';
import { SouthChart } from '@/components/SouthChart';
import { useVarshaphal } from '@/lib/query/varshaphal';
import { useLoadChart } from '@/lib/query/chart';
import { getStoredChartId } from '../page';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = 5;

export default function VarshaphalPage() {
  const t = useTranslations('varshaphalPage');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  const loadMutation = useLoadChart(chartId ?? '');
  // Track whether the initial mount load has fired so year-change effect
  // doesn't double-fire on first render.
  const mountedRef = useRef(false);

  useEffect(() => {
    const id = getStoredChartId();
    setChartId(id);
    setHydrated(true);
    if (id) {
      loadMutation.mutate(year);
    }
    mountedRef.current = true;
  // loadMutation.mutate and year are intentionally captured once at mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-trigger load whenever year changes after mount.
  useEffect(() => {
    if (!mountedRef.current || !chartId) return;
    loadMutation.reset();
    loadMutation.mutate(year);
  // loadMutation.reset/mutate are stable refs; chartId is the identity guard
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, chartId]);

  const { data, isLoading, isError } = useVarshaphal(
    chartId ?? undefined,
    year,
    !!chartId && loadMutation.isSuccess,
  );

  const years = Array.from(
    { length: YEAR_RANGE * 2 + 1 },
    (_, i) => CURRENT_YEAR - YEAR_RANGE + i,
  );

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

        {/* Year selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <label
            htmlFor="year-select"
            className="dim"
            style={{ fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            {t('yearLabel')}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              aria-label={t('prevYear')}
              onClick={() => setYear((y) => Math.max(y - 1, CURRENT_YEAR - YEAR_RANGE))}
              disabled={year <= CURRENT_YEAR - YEAR_RANGE}
              className="chip"
              style={{ cursor: year <= CURRENT_YEAR - YEAR_RANGE ? 'not-allowed' : 'pointer', opacity: year <= CURRENT_YEAR - YEAR_RANGE ? 0.4 : 1 }}
            >
              ‹
            </button>
            <select
              id="year-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--ink)',
                padding: '4px 10px',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}{y === CURRENT_YEAR ? ` (${t('currentYear')})` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label={t('nextYear')}
              onClick={() => setYear((y) => Math.min(y + 1, CURRENT_YEAR + YEAR_RANGE))}
              disabled={year >= CURRENT_YEAR + YEAR_RANGE}
              className="chip"
              style={{ cursor: year >= CURRENT_YEAR + YEAR_RANGE ? 'not-allowed' : 'pointer', opacity: year >= CURRENT_YEAR + YEAR_RANGE ? 0.4 : 1 }}
            >
              ›
            </button>
          </div>
        </div>

        {/* Loading */}
        {(!hydrated || loadMutation.isPending || isLoading) && (
          <div className="dim" style={{ textAlign: 'center', paddingTop: 80 }}>
            {tc('loadingMessage')}
          </div>
        )}

        {/* Load error */}
        {hydrated && loadMutation.isError && (
          <p role="alert" style={{ color: 'var(--negative)', textAlign: 'center', paddingTop: 80 }}>
            {tc('errorMessage')}
          </p>
        )}

        {/* Fetch error */}
        {hydrated && !loadMutation.isError && isError && (
          <p role="alert" style={{ color: 'var(--negative)', textAlign: 'center', paddingTop: 80 }}>
            {tc('errorMessage')}
          </p>
        )}

        {/* Result */}
        {hydrated && data && (
          <div style={{ maxWidth: 860 }}>
            {/* Meta row */}
            <div
              style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}
            >
              <div className="card" style={{ padding: '14px 18px', flex: '1 1 160px' }}>
                <div className="dim" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                  {t('yearLord')}
                </div>
                <div className="serif" style={{ fontSize: 18, color: 'var(--accent)' }}>
                  {data.year_lord}
                </div>
              </div>
              <div className="card" style={{ padding: '14px 18px', flex: '1 1 160px' }}>
                <div className="dim" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                  {t('age')}
                </div>
                <div className="serif" style={{ fontSize: 18 }}>
                  {data.age}
                </div>
              </div>
              <div className="card" style={{ padding: '14px 18px', flex: '1 1 160px' }}>
                <div className="dim" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                  {t('natalAscendant')}
                </div>
                <div className="serif" style={{ fontSize: 18 }}>
                  {data.natal_ascendant}
                </div>
              </div>
            </div>

            {/* Chart display (if annual_planets present) */}
            {data.annual_planets && Object.keys(data.annual_planets).length > 0 && (
              <div
                className="card"
                style={{
                  padding: '24px 28px',
                  marginBottom: 24,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 28,
                  alignItems: 'start',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chartStyle === 'north'
                    ? <NorthChart chart={data as never} size={260} />
                    : <SouthChart chart={data as never} size={260} />}
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

                {/* Annual planets table */}
                <div>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>{t('annualPlanets')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(data.annual_planets).map(([planet, info]) => (
                      <div
                        key={planet}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '90px 1fr 1fr 1fr',
                          gap: 8,
                          padding: '8px 0',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}
                      >
                        <span className="serif" style={{ fontSize: 13.5 }}>{planet}</span>
                        <span className="dim" style={{ fontSize: 12.5 }}>{info.sign_name}</span>
                        <span className="dim" style={{ fontSize: 12.5 }}>{tc('house')} {info.house}</span>
                        <span className="dim" style={{ fontSize: 12.5 }}>{info.dignity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Analysis content */}
            {data.content && (
              <div className="card" style={{ padding: '20px 24px' }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>{t('analysis')}</div>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {data.content}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
