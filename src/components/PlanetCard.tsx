import { useTranslations } from 'next-intl';
import type { Planet } from '@/lib/api/types';

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
  planet: Planet;
};

export function PlanetCard({ planet }: Props) {
  const t = useTranslations('common');
  const tp = useTranslations('planetNames');
  const ts = useTranslations('signs');
  const tn = useTranslations('nakshatras');

  const isRetro = planet.isRetro === 'true';
  const color = PLANET_COLOR[planet.name] ?? 'var(--ink)';
  const deg = planet.full_degree % 30;

  return (
    <div
      className="card"
      style={{ padding: '20px 24px' }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Planet colour dot */}
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
            }}
          />
          <h3
            className="serif"
            style={{ margin: 0, fontSize: 18, fontWeight: 400, color }}
          >
            {tp(planet.name)}
          </h3>
        </div>

        {isRetro && (
          <span
            className="chip chip-accent"
            aria-label={t('retro')}
            title={t('retro')}
          >
            ℞
          </span>
        )}
      </div>

      {/* Data rows */}
      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px' }}>
        <Row label={t('sign')}      value={ts(planet.sign as Parameters<typeof ts>[0])} />
        <Row label={t('house')}     value={String(planet.house_parashari)} />
        <Row label={t('degree')}    value={`${deg.toFixed(2)}°`} />
        <Row label={t('nakshatra')} value={tn(planet.nakshatra as Parameters<typeof tn>[0])} />
        <Row label={t('lord')}      value={planet.nakshatraLord} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt
        className="dim"
        style={{
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 400,
          lineHeight: 1.8,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: 13.5,
          color: 'var(--ink)',
          lineHeight: 1.8,
        }}
      >
        {value}
      </dd>
    </>
  );
}
