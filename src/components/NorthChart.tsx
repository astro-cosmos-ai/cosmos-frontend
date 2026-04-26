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

type Props = {
  chart: Chart;
  size?: number;
};

export function NorthChart({ chart, size = 480 }: Props) {
  const ascSignNum = SIGN_TO_NUM[chart.astro_details.ascendant] ?? 1;

  // Group planet abbreviations by parashari house
  const occupants: Record<number, string[]> = {};
  for (let h = 1; h <= 12; h++) occupants[h] = [];

  for (const [pName, planet] of Object.entries(chart.planets)) {
    if (pName === 'Ascendant') continue;
    const h = planet.house_parashari;
    const code = SHORT[planet.name] ?? planet.name.slice(0, 2);
    if (h >= 1 && h <= 12) occupants[h].push(code);
  }

  // Sign number that falls in each house
  const houseSign = (h: number) => ((ascSignNum - 1 + h - 1) % 12) + 1;

  const S = 400;
  const M = S / 2;

  // Key points
  const TL: [number, number] = [0, 0];
  const TR: [number, number] = [S, 0];
  const BR: [number, number] = [S, S];
  const BL: [number, number] = [0, S];
  const TM: [number, number] = [M, 0];
  const RM: [number, number] = [S, M];
  const BM: [number, number] = [M, S];
  const LM: [number, number] = [0, M];
  const C:  [number, number] = [M, M];

  // Polygon vertices for each of the 12 houses
  const houses: Record<number, [number, number][]> = {
    1:  [TM,  [M * 1.5, M * 0.5], C,  [M * 0.5, M * 0.5]],
    2:  [TL,  TM,  [M * 0.5, M * 0.5]],
    3:  [TL,  [M * 0.5, M * 0.5], LM],
    4:  [LM,  [M * 0.5, M * 0.5], C,  [M * 0.5, M * 1.5]],
    5:  [LM,  [M * 0.5, M * 1.5], BL],
    6:  [BL,  [M * 0.5, M * 1.5], BM],
    7:  [BM,  [M * 0.5, M * 1.5], C,  [M * 1.5, M * 1.5]],
    8:  [BM,  [M * 1.5, M * 1.5], BR],
    9:  [BR,  [M * 1.5, M * 1.5], RM],
    10: [RM,  [M * 1.5, M * 1.5], C,  [M * 1.5, M * 0.5]],
    11: [RM,  [M * 1.5, M * 0.5], TR],
    12: [TR,  [M * 1.5, M * 0.5], TM],
  };

  const centroid = (pts: [number, number][]): [number, number] => [
    pts.reduce((a, p) => a + p[0], 0) / pts.length,
    pts.reduce((a, p) => a + p[1], 0) / pts.length,
  ];

  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      width={size}
      height={size}
      role="img"
      aria-label="North Indian birth chart"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Background */}
      <rect x="0" y="0" width={S} height={S}
        fill="var(--bg-card-solid)" stroke="var(--border-strong)" strokeWidth="1.5" />

      {/* Diagonal cross lines */}
      <line x1="0" y1="0" x2={S} y2={S} stroke="var(--border-strong)" strokeWidth="1" />
      <line x1={S} y1="0" x2="0" y2={S} stroke="var(--border-strong)" strokeWidth="1" />

      {/* Inner diamond */}
      <polygon
        points={`${TM[0]},${TM[1]} ${RM[0]},${RM[1]} ${BM[0]},${BM[1]} ${LM[0]},${LM[1]}`}
        fill="none" stroke="var(--border-strong)" strokeWidth="1"
      />

      {/* House cells */}
      {Object.entries(houses).map(([h, pts]) => {
        const hn = +h;
        const sign = houseSign(hn);
        const ps = occupants[hn];
        const [cx, cy] = centroid(pts);
        return (
          <g key={hn}>
            {/* Sign number */}
            <text
              x={cx} y={cy - 22}
              textAnchor="middle"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                fontStyle: 'italic',
                fill: 'var(--ink-mute)',
              }}
            >
              {sign}
            </text>
            {/* Planet abbreviations */}
            {ps.map((p, i) => {
              const cols = Math.min(ps.length, 3);
              const row = Math.floor(i / cols);
              const col = i % cols;
              const px = cx + (col - (cols - 1) / 2) * 26;
              const py = cy + 4 + row * 16;
              return (
                <text
                  key={i}
                  x={px} y={py}
                  textAnchor="middle"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    fontWeight: 600,
                    fill: PLANET_COLOR[p] ?? 'var(--ink)',
                  }}
                >
                  {p}
                </text>
              );
            })}
          </g>
        );
      })}

      {/* ASC label in house 1 */}
      <text
        x={M} y={28}
        textAnchor="middle"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          letterSpacing: '0.18em',
          fill: 'var(--accent)',
        }}
      >
        ASC
      </text>
    </svg>
  );
}
