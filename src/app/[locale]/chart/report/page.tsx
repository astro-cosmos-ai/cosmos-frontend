'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { downloadReport } from '@/lib/api/report';
import { getStoredChartId } from '../page';

export default function ReportPage() {
  const t = useTranslations('reportPage');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  async function handleDownload() {
    if (!chartId || downloading) return;
    setDownloading(true);
    setError(null);
    setDownloaded(false);

    try {
      const blob = await downloadReport(chartId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `cosmos-report-${chartId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch {
      setError(tc('errorMessage'));
    } finally {
      setDownloading(false);
    }
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
          <div style={{ maxWidth: 520 }}>
            <div className="card" style={{ padding: '32px 36px', textAlign: 'center' }}>
              {/* Icon area */}
              <div
                aria-hidden="true"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: 26,
                }}
              >
                ⬇
              </div>

              <h2 className="serif" style={{ fontSize: 19, marginBottom: 10 }}>
                {t('cardTitle')}
              </h2>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.7, marginBottom: 28, maxWidth: 360, marginInline: 'auto' }}>
                {t('cardBody')}
              </p>

              {/* Download button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading || !chartId}
                aria-busy={downloading}
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  opacity: downloading || !chartId ? 0.6 : 1,
                  cursor: downloading || !chartId ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {downloading && (
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                )}
                {downloading ? t('downloading') : t('downloadButton')}
              </button>

              {/* Success message */}
              {downloaded && !downloading && (
                <p
                  role="status"
                  aria-live="polite"
                  style={{ color: 'var(--planet-jupiter)', fontSize: 13, marginTop: 14 }}
                >
                  {t('downloadSuccess')}
                </p>
              )}

              {/* Error message */}
              {error && (
                <p
                  role="alert"
                  style={{ color: 'var(--negative)', fontSize: 13, marginTop: 14 }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* What's included */}
            <div className="card" style={{ padding: '20px 24px', marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>{t('whatsIncluded')}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(t.raw('includedItems') as string[]).map((item: string, i: number) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)', marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span className="muted" style={{ fontSize: 13.5 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
