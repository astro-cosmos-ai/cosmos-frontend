import type { Chart } from '@/lib/api/types';

const SHORT: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju',
  Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};

const SIGN_TO_NUM: Record<string, number> = {
  Aries: 1, Mesha: 1, Taurus: 2, Vrishabha: 2, Gemini: 3, Mithuna: 3,
  Cancer: 4, Karka: 4, Leo: 5, Simha: 5, Virgo: 6, Kanya: 6,
  Libra: 7, Tula: 7, Scorpio: 8, Vrischika: 8, Sagittarius: 9, Dhanu: 9,
  Capricorn: 10, Makara: 10, Aquarius: 11, Kumbha: 11, Pisces: 12, Meena: 12,
};

const PLANET_COLOR: Record<string, string> = {
  Su: 'var(--planet-sun)',     Mo: 'var(--planet-moon)',
  Ma: 'var(--planet-mars)',    Me: 'var(--planet-mercury)',
  Ju: 'var(--planet-jupiter)', Ve: 'var(--planet-venus)',
  Sa: 'var(--planet-saturn)',  Ra: 'var(--planet-rahu)',
  Ke: 'var(--planet-ketu)',
};

// Fixed sign positions in the 4×4 South Indian grid (1-indexed row, col)
const SIGN_POS: Record<number, [number, number]> = {
  12: [1, 1], 1: [1, 2], 2: [1, 3], 3: [1, 4],
   4: [2, 4], 5: [3, 4], 6: [4, 4], 7: [4, 3],
   8: [4, 2], 9: [4, 1], 10: [3, 1], 11: [2, 1],
};

const SHORT_SIGN: Record<number, string> = {
  1: 'Ari', 2: 'Tau', 3: 'Gem', 4: 'Can', 5: 'Leo', 6: 'Vir',
  7: 'Lib', 8: 'Sco', 9: 'Sag', 10: 'Cap', 11: 'Aqu', 12: 'Pis',
};

type Props = {
  chart: Chart;
  size?: number;
};

export function SouthChart({ chart, size = 480 }: Props) {
  const ascSignNum = SIGN_TO_NUM[chart.astro_details.ascendant] ?? 1;

  // Group planet abbreviations by sign number
  const occupants: Record<number, string[]> = {};
  for (let s = 1; s <= 12; s++) occupants[s] = [];

  for (const [pName, planet] of Object.entries(chart.planets)) {
    if (pName === 'Ascendant') continue;
    const signNum = SIGN_TO_NUM[planet.sign] ?? planet.current_sign;
    if (signNum >= 1 && signNum <= 12) {
      occupants[signNum].push(SHORT[planet.name] ?? planet.name.slice(0, 2));
    }
  }

  // House number for a given sign relative to ascendant
  const houseOf = (signNum: number) => ((signNum - ascSignNum + 12) % 12) + 1;

  return (
    <div
      role="img"
      aria-label="South Indian birth chart"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        width: '100%',
        maxWidth: size,
        aspectRatio: '1',
        background: 'var(--bg-card-solid)',
        border: '1.5px solid var(--border-strong)',
        borderRadius: 4,
        gap: 0,
      }}
    >
      {/* 12 sign cells around the perimeter */}
      {Object.entries(SIGN_POS).map(([signNumStr, [row, col]]) => {
        const signNum = parseInt(signNumStr, 10);
        const isAsc = signNum === ascSignNum;
        const ps = occupants[signNum];
        const house = houseOf(signNum);

        return (
          <div
            key={signNum}
            style={{
              gridRow: row,
              gridColumn: col,
              border: '1px solid var(--border-strong)',
              padding: '6px 8px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              background: isAsc ? 'var(--accent-glow)' : 'transparent',
              minHeight: 0,
              minWidth: 0,
            }}
          >
            {/* House number — top left */}
            <div
              className="dim mono"
              style={{ fontSize: 10, lineHeight: 1, position: 'absolute', top: 6, left: 8 }}
            >
              {house}
            </div>

            {/* ASC marker — top right */}
            {isAsc && (
              <div
                style={{
                  position: 'absolute', top: 6, right: 8,
                  fontSize: 9, letterSpacing: '0.18em',
                  color: 'var(--accent)', fontWeight: 500,
                }}
              >
                ASC
              </div>
            )}

            {/* Sign abbreviation */}
            <div
              className="serif italic"
              style={{
                fontSize: 12,
                color: 'var(--ink-mute)',
                textAlign: 'center',
                marginTop: 14,
                marginBottom: 2,
              }}
            >
              {SHORT_SIGN[signNum]}
            </div>

            {/* Planet abbreviations */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2px 6px',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {ps.map((p, i) => (
                <span key={i} style={{ color: PLANET_COLOR[p] ?? 'var(--ink)' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {/* Centre 2×2 — chart label */}
      <div
        style={{
          gridRow: '2 / span 2',
          gridColumn: '2 / span 2',
          border: '1px solid var(--border)',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          color: 'var(--ink-mute)',
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Rasi · D1</div>
          <div className="serif italic" style={{ fontSize: 18, color: 'var(--ink-soft)' }}>
            South Indian
          </div>
        </div>
      </div>
    </div>
  );
}
