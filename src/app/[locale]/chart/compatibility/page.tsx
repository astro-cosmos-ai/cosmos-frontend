'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { useComputeCompatibility } from '@/lib/query/compatibility';
import { useCreateChart } from '@/lib/query/chart';
import { getStoredChartId } from '../page';
import type { CompatibilityResult, CreateChartInput } from '@/lib/api/types';

const GUNA_KEYS = [
  'varna', 'vashya', 'tara', 'yoni', 'graha_maitri', 'gana', 'bhakoot', 'nadi',
] as const;

type GunaKey = typeof GUNA_KEYS[number];

export default function CompatibilityPage() {
  const t = useTranslations('compatibilityPage');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  // Partner form fields
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [pobName, setPobName] = useState('');
  const [pobLat, setPobLat] = useState('');
  const [pobLon, setPobLon] = useState('');
  const [timezone, setTimezone] = useState('5.5');

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  const createChart = useCreateChart();
  const computeCompatibility = useComputeCompatibility(chartId ?? '');

  const isPending = createChart.isPending || computeCompatibility.isPending;
  const isError = createChart.isError || computeCompatibility.isError;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chartId || !name.trim() || !dob || !tob || !pobName.trim()) return;

    const partnerInput: CreateChartInput = {
      name: name.trim(),
      dob,
      tob: tob.length === 5 ? `${tob}:00` : tob,
      pob_name: pobName.trim(),
      pob_lat: parseFloat(pobLat) || 0,
      pob_lon: parseFloat(pobLon) || 0,
      timezone: parseFloat(timezone) || 5.5,
    };

    createChart.mutate(partnerInput, {
      onSuccess: (partner) => {
        computeCompatibility.mutate(partner.id, {
          onSuccess: (data) => setResult(data),
        });
      },
    });
  }

  // Score bar fill
  function scorePct(score: number, max: number): string {
    return `${Math.round((score / max) * 100)}%`;
  }

  function scoreColor(score: number, max: number): string {
    const pct = score / max;
    if (pct >= 0.75) return 'var(--planet-jupiter)';
    if (pct >= 0.5) return 'var(--accent)';
    return 'var(--planet-mars)';
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
            {/* Partner form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 16 }}>{t('partnerDetails')}</div>

                {/* Name */}
                <div style={{ marginBottom: 16 }}>
                  <label
                    htmlFor="compat-name"
                    style={{ display: 'block', fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 6 }}
                  >
                    {t('name')}
                  </label>
                  <input
                    id="compat-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    required
                    style={{
                      width: '100%', background: 'var(--bg-elev)', border: '1px solid var(--border)',
                      borderRadius: 10, color: 'var(--ink)', padding: '9px 12px', fontSize: 14, boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* DOB + TOB */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label
                      htmlFor="compat-dob"
                      style={{ display: 'block', fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 6 }}
                    >
                      {t('dob')}
                    </label>
                    <input
                      id="compat-dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      style={{
                        width: '100%', background: 'var(--bg-elev)', border: '1px solid var(--border)',
                        borderRadius: 10, color: 'var(--ink)', padding: '9px 12px', fontSize: 14, boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="compat-tob"
                      style={{ display: 'block', fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 6 }}
                    >
                      {t('tob')}
                    </label>
                    <input
                      id="compat-tob"
                      type="time"
                      value={tob}
                      onChange={(e) => setTob(e.target.value)}
                      required
                      style={{
                        width: '100%', background: 'var(--bg-elev)', border: '1px solid var(--border)',
                        borderRadius: 10, color: 'var(--ink)', padding: '9px 12px', fontSize: 14, boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Place of birth */}
                <div style={{ marginBottom: 16 }}>
                  <label
                    htmlFor="compat-pob"
                    style={{ display: 'block', fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 6 }}
                  >
                    {t('pob')}
                  </label>
                  <input
                    id="compat-pob"
                    type="text"
                    value={pobName}
                    onChange={(e) => setPobName(e.target.value)}
                    placeholder={t('pobPlaceholder')}
                    required
                    style={{
                      width: '100%', background: 'var(--bg-elev)', border: '1px solid var(--border)',
                      borderRadius: 10, color: 'var(--ink)', padding: '9px 12px', fontSize: 14, boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Lat / Lon / Timezone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { id: 'compat-lat', label: tc('degree') + ' (Lat)', value: pobLat, setter: setPobLat, placeholder: '28.6' },
                    { id: 'compat-lon', label: tc('degree') + ' (Lon)', value: pobLon, setter: setPobLon, placeholder: '77.2' },
                    { id: 'compat-tz',  label: 'UTC±', value: timezone, setter: setTimezone, placeholder: '5.5' },
                  ].map(({ id, label, value, setter, placeholder }) => (
                    <div key={id}>
                      <label
                        htmlFor={id}
                        style={{ display: 'block', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 6 }}
                      >
                        {label}
                      </label>
                      <input
                        id={id}
                        type="number"
                        step="any"
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                        style={{
                          width: '100%', background: 'var(--bg-elev)', border: '1px solid var(--border)',
                          borderRadius: 10, color: 'var(--ink)', padding: '9px 10px', fontSize: 13, boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isPending || !chartId || !name.trim() || !dob || !tob || !pobName.trim()}
                  className="btn"
                  style={{
                    opacity: isPending || !chartId ? 0.5 : 1,
                    cursor: isPending || !chartId ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isPending ? t('computing') : t('submit')}
                </button>
              </div>
            </form>

            {/* Error */}
            {isError && (
              <p role="alert" style={{ color: 'var(--negative)', fontSize: 13, marginBottom: 20 }}>
                {tc('errorMessage')}
              </p>
            )}

            {/* Result */}
            {result && (
              <div>
                {/* Total score */}
                <div
                  className="card"
                  style={{ padding: '20px 24px', marginBottom: 16, textAlign: 'center' }}
                >
                  <div className="eyebrow" style={{ marginBottom: 8 }}>{t('totalScore')}</div>
                  <div
                    className="serif"
                    style={{
                      fontSize: 48,
                      color: scoreColor(result.ashtakoot.total, 36),
                      lineHeight: 1,
                    }}
                  >
                    {result.ashtakoot.total}
                    <span style={{ fontSize: 22, color: 'var(--ink-muted)' }}>/36</span>
                  </div>
                  <div className="dim" style={{ fontSize: 12.5, marginTop: 6 }}>
                    {t('nakshatraPair', {
                      a: result.ashtakoot.moon_nakshatra_a,
                      b: result.ashtakoot.moon_nakshatra_b,
                    })}
                  </div>
                </div>

                {/* Guna Milan table */}
                <div className="card" style={{ padding: '18px 22px', marginBottom: 16 }}>
                  <div className="eyebrow" style={{ marginBottom: 14 }}>{t('gunaMilan')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {GUNA_KEYS.map((key) => {
                      const entry = result.ashtakoot.scores[key as GunaKey];
                      return (
                        <div key={key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, color: 'var(--ink)' }}>
                              {t(`guna.${key}`)}
                            </span>
                            <span className="dim" style={{ fontSize: 12.5 }}>
                              {entry.score}/{entry.max}
                            </span>
                          </div>
                          {/* Score bar */}
                          <div
                            style={{
                              height: 4,
                              borderRadius: 2,
                              background: 'var(--border)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: scorePct(entry.score, entry.max),
                                background: scoreColor(entry.score, entry.max),
                                borderRadius: 2,
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Doshas */}
                {result.ashtakoot.doshas.length > 0 && (
                  <div className="card" style={{ padding: '14px 18px', marginBottom: 16 }}>
                    <div className="eyebrow" style={{ marginBottom: 10 }}>{t('doshas')}</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {result.ashtakoot.doshas.map((d, i) => (
                        <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--planet-mars)', marginTop: 2 }}>•</span>
                          <span className="muted" style={{ fontSize: 13.5 }}>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Analysis */}
                {result.analysis && (
                  <div className="card" style={{ padding: '20px 24px' }}>
                    <div className="eyebrow" style={{ marginBottom: 10 }}>{t('analysis')}</div>
                    <p className="muted" style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>
                      {result.analysis}
                    </p>
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
