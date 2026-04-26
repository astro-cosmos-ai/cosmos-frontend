import { useTranslations, useLocale } from 'next-intl';
import type { TimelineResponse, TimelineEntry, Antardasha } from '@/lib/api/types';

const PLANET_COLOR: Record<string, string> = {
  Sun:     'var(--planet-sun)',
  Moon:    'var(--planet-moon)',
  Mars:    'var(--planet-mars)',
  Mercury: 'var(--planet-mercury)',
  Jupiter: 'var(--planet-jupiter)',
  Venus:   'var(--planet-venus)',
  Saturn:  'var(--planet-saturn)',
  Rahu:    'var(--planet-rahu)',
  Ketu:    'var(--planet-ketu)',
};

type Props = {
  timeline: TimelineResponse;
};

function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

function isActive(start: string, end: string): boolean {
  const now = Date.now();
  return new Date(start).getTime() <= now && now < new Date(end).getTime();
}

function durationYears(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

// Total timeline span in years (for proportional bar widths)
function totalSpan(entries: TimelineEntry[]): number {
  if (entries.length === 0) return 1;
  return entries.reduce((sum, e) => sum + durationYears(e.start, e.end), 0);
}

type MahaRowProps = {
  entry: TimelineEntry;
  spanYears: number;
  currentMajor: string;
  currentMinor: string;
  t: ReturnType<typeof useTranslations>;
  tp: ReturnType<typeof useTranslations>;
  locale: string;
};

function MahaRow({ entry, spanYears, currentMajor, currentMinor, t, tp, locale }: MahaRowProps) {
  const active = isActive(entry.start, entry.end);
  const color = PLANET_COLOR[entry.planet] ?? 'var(--ink)';
  const widthPct = (durationYears(entry.start, entry.end) / spanYears) * 100;

  return (
    <div
      style={{
        borderLeft: `3px solid ${active ? color : 'var(--border)'}`,
        paddingLeft: 14,
        paddingBottom: 20,
        position: 'relative',
      }}
    >
      {/* Dot on the timeline rail */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: -6,
          top: 4,
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: active ? color : 'var(--border)',
          border: `2px solid ${active ? color : 'var(--border-strong)'}`,
        }}
      />

      {/* Mahadasha header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <span
          className="serif"
          style={{
            fontSize: 16,
            fontWeight: active ? 500 : 400,
            color: active ? color : 'var(--ink-soft)',
          }}
        >
          {tp(entry.planet)}
        </span>
        {active && (
          <span className="chip chip-accent" style={{ fontSize: 10 }}>
            {t('current')}
          </span>
        )}
        <span className="dim" style={{ fontSize: 12, marginLeft: 'auto' }}>
          {formatDate(entry.start, locale)} – {formatDate(entry.end, locale)}
        </span>
      </div>

      {/* Proportional progress bar */}
      <div
        aria-hidden="true"
        style={{
          height: 3,
          borderRadius: 2,
          background: 'var(--border)',
          marginBottom: active ? 12 : 0,
          width: `${Math.min(widthPct, 100)}%`,
          maxWidth: 320,
        }}
      >
        {active && (() => {
          const elapsed = Date.now() - new Date(entry.start).getTime();
          const total = new Date(entry.end).getTime() - new Date(entry.start).getTime();
          const progress = Math.min((elapsed / total) * 100, 100);
          return (
            <div
              style={{
                height: '100%',
                borderRadius: 2,
                width: `${progress}%`,
                background: color,
              }}
            />
          );
        })()}
      </div>

      {/* Antardashas — only show for the active mahadasha */}
      {active && entry.antardashas.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {entry.antardashas.map((ad: Antardasha) => {
            const adActive = isActive(ad.start, ad.end);
            const adColor = PLANET_COLOR[ad.planet] ?? 'var(--ink)';
            const isCurrent =
              entry.planet === currentMajor && ad.planet === currentMinor;
            return (
              <div
                key={`${ad.planet}-${ad.start}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 10px',
                  borderRadius: 8,
                  background: isCurrent ? 'var(--bg-elev)' : 'transparent',
                  fontSize: 13,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: adActive ? adColor : 'var(--border-strong)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: adActive ? adColor : 'var(--ink-soft)', minWidth: 72 }}>
                  {tp(ad.planet)}
                </span>
                {isCurrent && (
                  <span className="chip chip-accent" style={{ fontSize: 9 }}>
                    {t('current')}
                  </span>
                )}
                <span className="dim" style={{ fontSize: 11, marginLeft: 'auto' }}>
                  {formatDate(ad.start, locale)} – {formatDate(ad.end, locale)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashaTimeline({ timeline }: Props) {
  const t  = useTranslations('dasha');
  const tp = useTranslations('planetNames');
  const locale = useLocale();

  const { current_dasha, timeline: entries } = timeline;
  const span = totalSpan(entries);

  return (
    <section aria-label={t('title')}>
      {/* Current period summary */}
      <div
        className="card"
        style={{ marginBottom: 28, padding: '18px 24px' }}
      >
        <div className="eyebrow" style={{ marginBottom: 12 }}>{t('current')}</div>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <Pill label={t('major')} planet={current_dasha.major.planet} tp={tp} />
          <Pill label={t('minor')} planet={current_dasha.minor.planet} tp={tp} />
        </div>
      </div>

      {/* Full 120-year timeline */}
      <div className="eyebrow" style={{ marginBottom: 16 }}>{t('timeline')}</div>
      <div style={{ paddingLeft: 6 }}>
        {entries.map((entry) => (
          <MahaRow
            key={`${entry.planet}-${entry.start}`}
            entry={entry}
            spanYears={span}
            currentMajor={current_dasha.major.planet}
            currentMinor={current_dasha.minor.planet}
            t={t}
            tp={tp}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

function Pill({
  label,
  planet,
  tp,
}: {
  label: string;
  planet: string;
  tp: ReturnType<typeof useTranslations>;
}) {
  const color = PLANET_COLOR[planet] ?? 'var(--ink)';
  return (
    <div>
      <div className="dim" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          aria-hidden="true"
          style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}
        />
        <span className="serif" style={{ fontSize: 20, fontWeight: 400, color }}>
          {tp(planet)}
        </span>
      </div>
    </div>
  );
}
