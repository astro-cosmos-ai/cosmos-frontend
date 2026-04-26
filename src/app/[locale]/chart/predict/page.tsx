'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { usePredict } from '@/lib/query/prediction';
import { getStoredChartId } from '../page';
import type { PredictionResult } from '@/lib/api/types';

export default function PredictPage() {
  const t = useTranslations('predictPage');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [question, setQuestion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
    // Default date range: today → +1 year
    const today = new Date();
    const next = new Date(today);
    next.setFullYear(next.getFullYear() + 1);
    setStartDate(today.toISOString().slice(0, 10));
    setEndDate(next.toISOString().slice(0, 10));
  }, []);

  const mutation = usePredict(chartId ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chartId || !question.trim() || !startDate || !endDate) return;
    mutation.mutate(
      { question: question.trim(), start_date: startDate, end_date: endDate },
      { onSuccess: (data) => setResult(data) },
    );
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
                {/* Question */}
                <div style={{ marginBottom: 20 }}>
                  <label
                    htmlFor="predict-question"
                    style={{ display: 'block', fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}
                  >
                    {t('questionLabel')}
                  </label>
                  <textarea
                    id="predict-question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={t('questionPlaceholder')}
                    rows={3}
                    required
                    style={{
                      width: '100%',
                      background: 'var(--bg-elev)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      color: 'var(--ink)',
                      padding: '10px 14px',
                      fontSize: 14,
                      lineHeight: 1.6,
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Date range */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <label
                      htmlFor="predict-start"
                      style={{ display: 'block', fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}
                    >
                      {t('startDate')}
                    </label>
                    <input
                      id="predict-start"
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
                      htmlFor="predict-end"
                      style={{ display: 'block', fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}
                    >
                      {t('endDate')}
                    </label>
                    <input
                      id="predict-end"
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
                  disabled={mutation.isPending || !chartId || !question.trim()}
                  className="btn"
                  style={{
                    opacity: mutation.isPending || !chartId || !question.trim() ? 0.5 : 1,
                    cursor: mutation.isPending || !chartId || !question.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {mutation.isPending ? t('analyzing') : t('submit')}
                </button>
              </div>
            </form>

            {/* Error */}
            {mutation.isError && (
              <p role="alert" style={{ color: 'var(--negative)', fontSize: 13, marginBottom: 20 }}>
                {tc('errorMessage')}
              </p>
            )}

            {/* Result */}
            {result && (
              <div>
                {/* Analysis summary */}
                <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>{t('analysis')}</div>
                  <p className="muted" style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>
                    {result.analysis}
                  </p>
                  {result.sadesati_active && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: '10px 14px',
                        background: 'color-mix(in srgb, var(--planet-saturn) 10%, var(--bg-elev))',
                        borderRadius: 8,
                        fontSize: 13,
                        color: 'var(--ink-muted)',
                      }}
                    >
                      {t('sadesatiActive')}{result.sadesati_phase ? ` — ${result.sadesati_phase}` : ''}
                    </div>
                  )}
                </div>

                {/* Timing windows */}
                {result.windows.length > 0 && (
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 14 }}>{t('timingWindows')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {result.windows.map((win, i) => (
                        <div
                          key={i}
                          className="card"
                          style={{ padding: '14px 18px' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                            <span className="serif" style={{ fontSize: 14 }}>
                              {win.md_lord} / {win.ad_lord}
                            </span>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span
                                className="chip"
                                style={{
                                  fontSize: 11,
                                  color: win.match_score >= 7 ? 'var(--planet-jupiter)' : 'var(--ink-muted)',
                                }}
                              >
                                {t('score')} {win.match_score}/10
                              </span>
                              {win.transit_confirmed && (
                                <span className="chip chip-accent" style={{ fontSize: 11 }}>
                                  {t('transitConfirmed')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="dim" style={{ fontSize: 12.5 }}>
                            {win.start} → {win.end}
                          </div>
                          {win.houses_activated.length > 0 && (
                            <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>
                              {t('housesActivated')}: {win.houses_activated.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
