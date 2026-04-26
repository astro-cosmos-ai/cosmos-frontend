'use client';

import { use, useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { useAnalysis, useRunAnalysis } from '@/lib/query/analyses';
import { getStoredChartId } from '../../page';
import type { Section } from '@/lib/api/types';

const VALID_SECTIONS: Section[] = [
  'personality', 'mind', 'career', 'skills', 'wealth', 'foreign',
  'romance', 'marriage', 'business', 'property', 'health', 'education',
  'parents', 'siblings', 'children', 'spirituality',
];

function isValidSection(s: string): s is Section {
  return VALID_SECTIONS.includes(s as Section);
}

type Props = {
  params: Promise<{ locale: string; section: string }>;
};

export default function AnalysisSectionPage({ params }: Props) {
  // Client component — unwrap Promise with React.use()
  const { section: sectionParam } = use(params);

  const t = useTranslations('analysisSectionPage');
  const ta = useTranslations('analysesPage');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  // Call all hooks unconditionally before any conditional returns
  const {
    data: analysis,
    isLoading,
    isError,
  } = useAnalysis(chartId ?? undefined, sectionParam as Section);

  const runMutation = useRunAnalysis(chartId ?? '');

  // Validate section after all hooks have been called
  if (!isValidSection(sectionParam)) {
    notFound();
  }

  const section = sectionParam as Section;
  const isRunning = runMutation.isPending;

  function handleRun() {
    if (!chartId) return;
    runMutation.mutate(section);
  }

  return (
    <>
      <div className="sky-bg" aria-hidden="true" />
      <Nav />
      <main className="page fade-in" style={{ paddingTop: 40 }}>
        {/* Back link */}
        <Link
          href={`/${locale}/chart/analyses`}
          className="dim"
          style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28 }}
        >
          ← {t('backToAll')}
        </Link>

        {/* Page header */}
        <div className="section-head" style={{ textAlign: 'left', marginBottom: 36 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t('eyebrow')}</div>
          <h1 className="serif">{ta(`sections.${section}`)}</h1>
        </div>

        {/* Loading */}
        {(!hydrated || isLoading) && (
          <div className="dim" style={{ textAlign: 'center', paddingTop: 80 }}>
            {tc('loadingMessage')}
          </div>
        )}

        {/* Fetch error */}
        {hydrated && isError && (
          <p role="alert" style={{ color: 'var(--negative)', textAlign: 'center', paddingTop: 80 }}>
            {tc('errorMessage')}
          </p>
        )}

        {/* Run mutation error */}
        {runMutation.isError && (
          <p role="alert" style={{ color: 'var(--negative)', fontSize: 13, marginBottom: 16 }}>
            {tc('errorMessage')}
          </p>
        )}

        {hydrated && !isLoading && (
          <div style={{ maxWidth: 720 }}>
            {analysis ? (
              <>
                {/* Metadata row */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}
                >
                  <span className="dim" style={{ fontSize: 12 }}>
                    {t('generatedOn')} {new Date(analysis.created_at).toLocaleDateString()}
                  </span>
                  {analysis.cached && (
                    <span className="chip" style={{ fontSize: 11 }}>
                      {t('cached')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleRun}
                    disabled={isRunning || !chartId}
                    className="chip"
                    style={{
                      cursor: isRunning || !chartId ? 'not-allowed' : 'pointer',
                      opacity: isRunning || !chartId ? 0.5 : 1,
                      marginLeft: 'auto',
                    }}
                  >
                    {isRunning ? ta('running') : ta('rerun')}
                  </button>
                </div>

                {/* Full content */}
                <div className="card" style={{ padding: '24px 28px' }}>
                  <p
                    style={{
                      fontSize: 14.5,
                      lineHeight: 1.85,
                      color: 'var(--ink)',
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                    }}
                  >
                    {analysis.content}
                  </p>
                </div>
              </>
            ) : (
              /* No analysis yet */
              <div
                className="card"
                style={{ padding: '48px 28px', textAlign: 'center', borderStyle: 'dashed' }}
              >
                <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
                  {ta('noAnalysis')}
                </p>
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={isRunning || !chartId}
                  className="btn"
                  style={{
                    opacity: isRunning || !chartId ? 0.5 : 1,
                    cursor: isRunning || !chartId ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isRunning ? ta('running') : ta('run')}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
