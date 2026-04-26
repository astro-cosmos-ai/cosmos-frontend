'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { useFindMuhurta } from '@/lib/query/muhurta';
import { getStoredChartId } from '../page';
import type { MuhurtaResult } from '@/lib/api/types';

const MUHURTA_TYPES = [
  'marriage',
  'griha_pravesh',
  'business_start',
  'travel',
  'education',
  'medical',
  'investment',
  'vehicle_purchase',
] as const;

export default function MuhurtaPage() {
  const t = useTranslations('muhurtaPage');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [eventType, setEventType] = useState<string>(MUHURTA_TYPES[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<MuhurtaResult | null>(null);

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
    const today = new Date();
    const next = new Date(today);
    next.setMonth(next.getMonth() + 3);
    setStartDate(today.toISOString().slice(0, 10));
    setEndDate(next.toISOString().slice(0, 10));
  }, []);

  const mutation = useFindMuhurta(chartId ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chartId || !startDate || !endDate) return;
    mutation.mutate(
      { event_type: eventType, start_date: startDate, end_date: endDate, top_n: 10 },
      { onSuccess: (data) => setResult(data) },
    );
  }

  // Score → colour hint
  function scoreColor(score: number): string {
    if (score >= 8) return 'var(--planet-jupiter)';
    if (score >= 5) return 'var(--accent)';
    return 'var(--ink-muted)';
  }

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

        {!hydrated && (
          <div className="dim" style={{ textAlign: 'center', paddingTop: 80 }}>
            {tc('loadingMessage')}
          </div>
        )}

        {hydrated && (
          <div style={{ maxWidth: 680 }}>
            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
                {/* Activity type */}
                <div style={{ marginBottom: 20 }}>
                  <label
                    htmlFor="muhurta-type"
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-muted)',
                      marginBottom: 8,
                    }}
                  >
                    {t('activityLabel')}
                  </label>
                  <select
                    id="muhurta-type"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elev)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      color: 'var(--ink)',
                      padding: '9px 12px',
                      fontSize: 14,
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    {MUHURTA_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {t(`types.${type}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date range */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <label
                      htmlFor="muhurta-start"
                      style={{
                        display: 'block',
                        fontSize: 12.5,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-muted)',
                        marginBottom: 8,
                      }}
                    >
                      {t('startDate')}
                    </label>
                    <input
                      id="muhurta-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        background: 'var(--bg-elev)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        color: 'var(--ink)',
                        padding: '9px 12px',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="muhurta-end"
                      style={{
                        display: 'block',
                        fontSize: 12.5,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-muted)',
                        marginBottom: 8,
                      }}
                    >
                      {t('endDate')}
                    </label>
                    <input
                      id="muhurta-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        background: 'var(--bg-elev)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        color: 'var(--ink)',
                        padding: '9px 12px',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending || !chartId}
                  className="btn"
                  style={{
                    opacity: mutation.isPending || !chartId ? 0.5 : 1,
                    cursor: mutation.isPending || !chartId ? 'not-allowed' : 'pointer',
                  }}
                >
                  {mutation.isPending ? t('searching') : t('submit')}
                </button>
              </div>
            </form>

            {/* Error */}
            {mutation.isError && (
              <p role="alert" style={{ color: 'var(--negative)', fontSize: 13, marginBottom: 20 }}>
                {tc('errorMessage')}
              </p>
            )}

            {/* Results */}
            {result && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <div className="eyebrow">{t('results')}</div>
                  <span className="dim" style={{ fontSize: 12.5 }}>
                    {t('resultCount', { n: result.dates.length })}
                  </span>
                </div>

                {result.dates.length === 0 ? (
                  <div
                    className="card"
                    style={{ padding: '32px 24px', textAlign: 'center', borderStyle: 'dashed' }}
                  >
                    <p className="muted" style={{ fontSize: 14 }}>{t('noDates')}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.dates.map((d, i) => (
                      <div
                        key={i}
                        className="card"
                        style={{ padding: '14px 18px' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 8,
                            flexWrap: 'wrap',
                            gap: 8,
                          }}
                        >
                          <span className="serif" style={{ fontSize: 15 }}>
                            {d.date}
                          </span>
                          <span
                            className="chip"
                            style={{
                              fontSize: 11.5,
                              color: scoreColor(d.score),
                              borderColor: scoreColor(d.score),
                            }}
                          >
                            {t('score')} {d.score}/10
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: 16,
                            flexWrap: 'wrap',
                            marginBottom: d.notes.length > 0 ? 8 : 0,
                          }}
                        >
                          <span className="dim" style={{ fontSize: 12.5 }}>
                            {d.tithi}
                          </span>
                          <span className="dim" style={{ fontSize: 12.5 }}>
                            {d.nakshatra}
                          </span>
                          <span className="dim" style={{ fontSize: 12.5 }}>
                            {d.vaara}
                          </span>
                        </div>

                        {d.notes.length > 0 && (
                          <ul
                            style={{
                              listStyle: 'none',
                              padding: 0,
                              margin: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 3,
                            }}
                          >
                            {d.notes.map((note, j) => (
                              <li
                                key={j}
                                className="dim"
                                style={{ fontSize: 12, display: 'flex', gap: 6 }}
                              >
                                <span style={{ opacity: 0.5 }}>•</span>
                                {note}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
