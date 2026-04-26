'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { useTransits, useDoubleTransit } from '@/lib/query/transits';
import { getStoredChartId } from '../page';

type TabKey = 'current' | 'double';

export default function TransitsPage() {
  const t = useTranslations('transitsPage');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('current');

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  const {
    data: transits,
    isLoading: transitsLoading,
    isError: transitsError,
  } = useTransits(chartId ?? undefined);

  const {
    data: doubleTransit,
    isLoading: doubleLoading,
    isError: doubleError,
  } = useDoubleTransit(chartId ?? undefined);

  const isLoading = activeTab === 'current' ? transitsLoading : doubleLoading;
  const isError = activeTab === 'current' ? transitsError : doubleError;

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

        {/* Tab strip */}
        <div
          role="tablist"
          aria-label={t('tabsLabel')}
          style={{ display: 'flex', gap: 8, marginBottom: 28 }}
        >
          {(['current', 'double'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'chip chip-accent' : 'chip'}
              style={{ cursor: 'pointer' }}
            >
              {t(tab === 'current' ? 'tabCurrent' : 'tabDouble')}
            </button>
          ))}
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

        {/* Current Transits Panel */}
        {hydrated && activeTab === 'current' && transits && (
          <section
            id="panel-current"
            role="tabpanel"
            aria-labelledby="tab-current"
          >
            <p className="dim" style={{ fontSize: 12.5, marginBottom: 20 }}>
              {t('asOf')} {transits.date}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 14,
              }}
            >
              {Object.entries(transits.planets).map(([planet, info]) => {
                const isBenefic = ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet);
                const isMalefic = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'].includes(planet);
                const accentColor = isBenefic
                  ? 'var(--planet-jupiter)'
                  : isMalefic
                  ? 'var(--planet-saturn)'
                  : 'var(--accent)';

                return (
                  <div
                    key={planet}
                    className="card"
                    style={{ padding: '16px 18px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <span
                        className="serif"
                        style={{ fontSize: 15, color: accentColor }}
                      >
                        {planet}
                      </span>
                      {info.retrograde && (
                        <span className="chip" style={{ fontSize: 10.5 }}>
                          {tc('retro')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div className="dim" style={{ fontSize: 12 }}>
                        <span style={{ opacity: 0.6 }}>{tc('sign')}: </span>
                        {info.sign_name}
                      </div>
                      <div className="dim" style={{ fontSize: 12 }}>
                        <span style={{ opacity: 0.6 }}>{tc('house')}: </span>
                        {info.transit_house}
                      </div>
                      <div className="dim" style={{ fontSize: 12 }}>
                        <span style={{ opacity: 0.6 }}>{tc('nakshatra')}: </span>
                        {info.nakshatra}
                      </div>
                      {info.dignity && (
                        <div className="dim" style={{ fontSize: 12 }}>
                          <span style={{ opacity: 0.6 }}>{t('dignity')}: </span>
                          {info.dignity}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Double Transit Panel */}
        {hydrated && activeTab === 'double' && doubleTransit && (
          <section
            id="panel-double"
            role="tabpanel"
            aria-labelledby="tab-double"
          >
            <p className="dim" style={{ fontSize: 12.5, marginBottom: 8 }}>
              {t('asOf')} {doubleTransit.date}
            </p>
            <p className="muted" style={{ fontSize: 13, marginBottom: 20, maxWidth: 560 }}>
              {t('doubleTransitDesc')}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 10,
              }}
            >
              {Object.entries(doubleTransit.houses).map(([house, flags]) => (
                <div
                  key={house}
                  className="card"
                  style={{
                    padding: '12px 14px',
                    textAlign: 'center',
                    borderColor: flags.both
                      ? 'var(--accent)'
                      : flags.jupiter
                      ? 'var(--planet-jupiter)'
                      : flags.saturn
                      ? 'var(--planet-saturn)'
                      : 'var(--border)',
                  }}
                >
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, fontSize: 10 }}
                  >
                    {t('house')} {house}
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {flags.jupiter && (
                      <span
                        className="chip"
                        style={{ fontSize: 10, color: 'var(--planet-jupiter)' }}
                      >
                        {t('jupiter')}
                      </span>
                    )}
                    {flags.saturn && (
                      <span
                        className="chip"
                        style={{ fontSize: 10, color: 'var(--planet-saturn)' }}
                      >
                        {t('saturn')}
                      </span>
                    )}
                    {flags.both && (
                      <span
                        className="chip chip-accent"
                        style={{ fontSize: 10 }}
                      >
                        {t('both')}
                      </span>
                    )}
                    {!flags.jupiter && !flags.saturn && !flags.both && (
                      <span className="dim" style={{ fontSize: 10.5 }}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
