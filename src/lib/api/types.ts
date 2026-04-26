// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type ChartId = string;

export type Section =
  | 'personality'
  | 'mind'
  | 'career'
  | 'skills'
  | 'wealth'
  | 'foreign'
  | 'romance'
  | 'marriage'
  | 'business'
  | 'property'
  | 'health'
  | 'education'
  | 'parents'
  | 'siblings'
  | 'children'
  | 'spirituality';

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export interface HealthCheckResponse {
  status: string;
  version: string;
}

// ---------------------------------------------------------------------------
// Chart — POST /api/charts, GET /api/charts/{id}
// ---------------------------------------------------------------------------

export interface CreateChartInput {
  name: string;
  /** YYYY-MM-DD */
  dob: string;
  /** HH:MM:SS */
  tob: string;
  pob_name: string;
  pob_lat: number;
  pob_lon: number;
  /** UTC offset, e.g. 5.5 for IST */
  timezone: number;
}

export interface Planet {
  name: string;
  current_sign: number;
  sign: string;
  full_degree: number;
  nakshatra: string;
  nakshatra_pad: number;
  nakshatraLord: string;
  house_parashari: number;
  /** "true" | "false" — backend returns a string */
  isRetro: string;
}

export interface AstroDetails {
  ascendant: string;
  ascendant_sign_num: number;
  tithi: string;
  yoga: string;
  karana: string;
  vaara: string;
}

export interface DashaPeriod {
  planet: string;
  start: string;
  end: string;
}

export interface CurrentDasha {
  major: DashaPeriod;
  minor: DashaPeriod;
  sub_minor: DashaPeriod;
}

export interface Dashas {
  mahadashas: DashaPeriod[];
}

/** Sign name → ashtakavarga points */
export type AshtakavargaRow = Record<string, number>;

export interface Ashtakavarga {
  /** Planet-wise BAV rows, keyed by planet name */
  [planet: string]: AshtakavargaRow;
}

export interface DoshaEntry {
  present?: boolean;
  active?: boolean;
  status?: string;
}

export interface Doshas {
  manglik: DoshaEntry;
  kaal_sarp: DoshaEntry;
  pitra: DoshaEntry;
  sade_sati: DoshaEntry;
}

export interface Yoga {
  name: string;
  present: boolean;
  description: string;
}

/** House number (as string key) → { sign, sign_name } */
export type DivisionalHouses = Record<string, { sign: number; sign_name: string }>;

export interface DivisionalCharts {
  D1: DivisionalHouses;
  D9: DivisionalHouses;
  moon_chart: DivisionalHouses;
  [key: string]: DivisionalHouses;
}

export interface Panchang {
  tithi: string;
  yoga: string;
  karana: string;
  vaara: string;
}

export interface Chart {
  id: ChartId;
  user_id: string;
  name: string;
  dob: string;
  tob: string;
  pob_name: string;
  pob_lat: number;
  pob_lon: number;
  timezone: number;
  astro_details: AstroDetails;
  planets: Record<string, Planet>;
  current_dasha: CurrentDasha;
  dashas: Dashas;
  ashtakavarga: Ashtakavarga;
  doshas: Doshas;
  yogas: Yoga[];
  parashari_significators: Record<string, unknown>;
  divisional_charts: DivisionalCharts;
  panchang: Panchang;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Load — POST /api/charts/{id}/load
// ---------------------------------------------------------------------------

export interface LoadChartResponse {
  loaded: boolean;
  varshaphal_year: number;
  transit_date: string;
}

// ---------------------------------------------------------------------------
// Analysis — POST /api/charts/{id}/analyze/{section}
//            GET  /api/charts/{id}/analyses
// ---------------------------------------------------------------------------

export interface AnalysisResult {
  id: string;
  chart_id: ChartId;
  section: Section;
  content: string;
  model: string;
  cached: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Chat — POST /api/charts/{id}/chat  (SSE, see chat-stream.ts)
//        GET  /api/charts/{id}/chat/history
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type ChatHistoryResponse = ChatMessage[];

// ---------------------------------------------------------------------------
// Transits — GET /api/charts/{id}/transits
// ---------------------------------------------------------------------------

export interface TransitPlanet {
  transit_sign: number;
  sign_name: string;
  transit_house: number;
  nakshatra: string;
  retrograde: boolean;
  dignity: string;
}

export interface TransitResult {
  date: string;
  natal_asc_sign: number;
  planets: Record<string, TransitPlanet>;
}

// ---------------------------------------------------------------------------
// Double Transit — GET /api/charts/{id}/double-transit
// ---------------------------------------------------------------------------

export interface DoubleTransitHouse {
  jupiter: boolean;
  saturn: boolean;
  both: boolean;
}

export interface DoubleTransitResult {
  date: string;
  /** House number (as string key) → influence flags */
  houses: Record<string, DoubleTransitHouse>;
}

// ---------------------------------------------------------------------------
// Sade Sati — GET /api/charts/{id}/sadesati
// ---------------------------------------------------------------------------

export interface SadeSatiResult {
  active: boolean;
  phase: string | null;
  natal_moon_sign: number;
  saturn_transit_sign: number;
  saturn_transit_house_from_moon: number;
  severity_factors: string[];
  note: string;
}

// ---------------------------------------------------------------------------
// Timeline — GET /api/charts/{id}/timeline
// ---------------------------------------------------------------------------

export interface Antardasha {
  planet: string;
  start: string;
  end: string;
}

export interface TimelineEntry {
  planet: string;
  start: string;
  end: string;
  antardashas: Antardasha[];
}

export interface TimelineResponse {
  current_dasha: {
    major: DashaPeriod;
    minor: DashaPeriod;
  };
  timeline: TimelineEntry[];
}

// ---------------------------------------------------------------------------
// Muhurta — POST /api/charts/{id}/muhurta
// ---------------------------------------------------------------------------

export interface MuhurtaParams {
  event_type: string;
  /** YYYY-MM-DD */
  start_date: string;
  /** YYYY-MM-DD */
  end_date: string;
  top_n?: number;
}

export interface MuhurtaDate {
  date: string;
  score: number;
  tithi: string;
  nakshatra: string;
  vaara: string;
  notes: string[];
}

export interface MuhurtaResult {
  event_type: string;
  dates: MuhurtaDate[];
}

// ---------------------------------------------------------------------------
// Prediction — POST /api/charts/{id}/predict
// ---------------------------------------------------------------------------

export interface PredictionParams {
  question: string;
  /** YYYY-MM-DD */
  start_date: string;
  /** YYYY-MM-DD */
  end_date: string;
}

export interface PredictionWindow {
  md_lord: string;
  ad_lord: string;
  start: string;
  end: string;
  houses_activated: number[];
  match_score: number;
  transit_confirmed: boolean;
  ashtakavarga_score: number;
}

export interface PredictionResult {
  chart_id: ChartId;
  question: string;
  target_houses: number[];
  windows: PredictionWindow[];
  analysis: string;
  sadesati_active: boolean;
  sadesati_phase: string | null;
}

// ---------------------------------------------------------------------------
// Varshaphal — GET /api/charts/{id}/varshaphal
// ---------------------------------------------------------------------------

export interface AnnualPlanet {
  sign: number;
  sign_name: string;
  house: number;
  nakshatra: string;
  retrograde: boolean;
  dignity: string;
}

export interface VarshaphalResult {
  chart_id: ChartId;
  year: number;
  age: number;
  natal_ascendant: string;
  year_lord: string;
  annual_planets: Record<string, AnnualPlanet>;
  content: string;
  cached: boolean;
}

// ---------------------------------------------------------------------------
// Compatibility — POST /api/compatibility/
//                 GET  /api/compatibility/{id1}/{id2}
// ---------------------------------------------------------------------------

export interface AshtakootScore {
  score: number;
  max: number;
}

export interface Ashtakoot {
  total: number;
  moon_sign_a: number;
  moon_sign_b: number;
  moon_nakshatra_a: string;
  moon_nakshatra_b: string;
  scores: {
    varna: AshtakootScore;
    vashya: AshtakootScore;
    tara: AshtakootScore;
    yoni: AshtakootScore;
    graha_maitri: AshtakootScore;
    gana: AshtakootScore;
    bhakoot: AshtakootScore;
    nadi: AshtakootScore;
  };
  doshas: string[];
}

export interface CompatibilityResult {
  chart_id_1: ChartId;
  chart_id_2: ChartId;
  ashtakoot: Ashtakoot;
  analysis: string;
  cached: boolean;
}
