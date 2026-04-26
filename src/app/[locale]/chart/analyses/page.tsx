'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/Nav';
import { useAnalyses, useRunAnalysis } from '@/lib/query/analyses';
import { getStoredChartId } from '../page';
import type { Section } from '@/lib/api/types';

const ALL_SECTIONS: Section[] = [
  'personality', 'mind', 'career', 'skills', 'wealth', 'foreign',
  'romance', 'marriage', 'business', 'property', 'health', 'education',
  'parents', 'siblings', 'children', 'spirituality',
];

export default function AnalysesPage() {
  const t = useTranslations('analysesPage');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>(ALL_SECTIONS[0]);

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  const {
    data: allAnalyses,
    isLoading,
    isError,
  } = useAnalyses(chartId ?? undefined);

  const runMutation = useRunAnalysis(chartId ?? '');

  // Build a map of section → cached result
  const cachedMap = new Map(
    (allAnalyses ?? []).map((a) => [a.section, a]),
  );

  const activeCached = cachedMap.get(activeSection);

  function handleRun() {
    if (!chartId) return;
    runMutation.mutate(activeSection);
  }

  const isRunning =
    runMutation.isPending && runMutation.variables === activeSection;

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

        {hydrated && !isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
            {/* Section tab strip (vertical) */}
            <nav aria-label={t('sectionNav')}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ALL_SECTIONS.map((section) => {
                  const cached = cachedMap.has(section);
                  const isActive = activeSection === section;
                  return (
                    <li key={section}>
                      <button
                        type="button"
                        onClick={() => setActiveSection(section)}
                        aria-current={isActive ? 'true' : undefined}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: isActive ? 'var(--bg-elev)' : 'transparent',
                          border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                          borderRadius: 8,
                          padding: '8px 12px',
                          cursor: 'pointer',
                          color: isActive ? 'var(--ink)' : 'var(--ink-muted)',
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}
                      >
                        <span>{t(`sections.${section}`)}</span>
                        {cached && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: 'var(--accent)',
                              flexShrink: 0,
                            }}
                            aria-label={t('cached')}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Section content panel */}
            <section aria-label={t(`sections.${activeSection}`)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h2 className="serif" style={{ fontSize: 20, margin: 0 }}>
                  {t(`sections.${activeSection}`)}
                </h2>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {activeCached && (
                    <Link
                      href={`/${locale}/chart/analyses/${activeSection}`}
                      className="btn"
                      style={{ fontSize: 13 }}
                    >
                      {t('viewFull')}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleRun}
                    disabled={isRunning || !chartId}
                    className="btn"
                    style={{
                      fontSize: 13,
                      opacity: isRunning || !chartId ? 0.5 : 1,
                      cursor: isRunning || !chartId ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isRunning ? t('running') : activeCached ? t('rerun') : t('run')}
                  </button>
                </div>
              </div>

              {/* Run error */}
              {runMutation.isError && runMutation.variables === activeSection && (
                <p role="alert" style={{ color: 'var(--negative)', fontSize: 13, marginBottom: 16 }}>
                  {tc('errorMessage')}
                </p>
              )}

              {activeCached ? (
                <div className="card" style={{ padding: '20px 24px' }}>
                  <p
                    className="dim"
                    style={{ fontSize: 11.5, marginBottom: 14 }}
                  >
                    {t('cachedOn')} {new Date(activeCached.created_at).toLocaleDateString()}
                  </p>
                  <p
                    className="muted"
                    style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
                  >
                    {/* Show a preview — first 600 chars */}
                    {activeCached.content.length > 600
                      ? `${activeCached.content.slice(0, 600)}…`
                      : activeCached.content}
                  </p>
                  {activeCached.content.length > 600 && (
                    <Link
                      href={`/${locale}/chart/analyses/${activeSection}`}
                      style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--accent)' }}
                    >
                      {t('readMore')} →
                    </Link>
                  )}
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    padding: '40px 24px',
                    textAlign: 'center',
                    borderStyle: 'dashed',
                  }}
                >
                  <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
                    {t('noAnalysis')}
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
                    {isRunning ? t('running') : t('run')}
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
