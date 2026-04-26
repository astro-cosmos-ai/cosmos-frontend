'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Nav } from '@/components/Nav';
import { PlanetCard } from '@/components/PlanetCard';
import { useChart } from '@/lib/query/chart';
import { getStoredChartId } from '../page';
import type { Planet } from '@/lib/api/types';

// Canonical display order for the nine planets
const PLANET_ORDER = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter',
  'Venus', 'Saturn', 'Rahu', 'Ketu',
] as const;

export default function PlanetsPage() {
  const t  = useTranslations('planetsPage');
  const tc = useTranslations('common');

  const [chartId, setChartId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setChartId(getStoredChartId());
    setHydrated(true);
  }, []);

  const { data: chart, isLoading, isError } = useChart(chartId ?? undefined);

  // Build ordered planet list, skipping any names the backend didn't return
  const planets: Planet[] = chart
    ? PLANET_ORDER.flatMap((name) => {
        const p = chart.planets[name.toLowerCase()];
        return p ? [p] : [];
      })
    : [];

  return (
    <>
      <div className="sky-bg" aria-hidden="true" />
      <Nav />
      <main className="page fade-in" style={{ paddingTop: 40 }}>
        {/* Page header */}
        <div className="section-head" style={{ textAlign: 'left', marginBottom: 36 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Navagraha</div>
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
          <p
            role="alert"
            style={{ color: 'var(--negative)', textAlign: 'center', paddingTop: 80 }}
          >
            {tc('errorMessage')}
          </p>
        )}

        {/* Planet grid */}
        {planets.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {planets.map((planet) => (
              <PlanetCard key={planet.name} planet={planet} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
