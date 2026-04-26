// Core
export { apiFetch } from './client';
export { ApiError } from './errors';

// Types
export type {
  // Primitives
  ChartId,
  Section,
  // Health
  HealthCheckResponse,
  // Chart
  CreateChartInput,
  Chart,
  Planet,
  AstroDetails,
  DashaPeriod,
  CurrentDasha,
  Dashas,
  AshtakavargaRow,
  Ashtakavarga,
  DoshaEntry,
  Doshas,
  Yoga,
  DivisionalHouses,
  DivisionalCharts,
  Panchang,
  LoadChartResponse,
  // Analysis
  AnalysisResult,
  // Chat
  ChatMessage,
  ChatHistoryResponse,
  // Transits
  TransitPlanet,
  TransitResult,
  DoubleTransitHouse,
  DoubleTransitResult,
  SadeSatiResult,
  // Timeline
  Antardasha,
  TimelineEntry,
  TimelineResponse,
  // Muhurta
  MuhurtaParams,
  MuhurtaDate,
  MuhurtaResult,
  // Prediction
  PredictionParams,
  PredictionWindow,
  PredictionResult,
  // Varshaphal
  AnnualPlanet,
  VarshaphalResult,
  // Compatibility
  AshtakootScore,
  Ashtakoot,
  CompatibilityResult,
} from './types';

// Resource modules
export { createChart, fetchChart, loadChart } from './chart';
export { runAnalysis, listAnalyses } from './analyses';
export { fetchChatHistory } from './chat';
export { streamChat } from './chat-stream';
export { fetchTransits, fetchDoubleTransit, fetchSadeSati } from './transits';
export { fetchTimeline } from './timeline';
export { findMuhurta } from './muhurta';
export { predict } from './prediction';
export { fetchVarshaphal } from './varshaphal';
export { computeCompatibility, fetchCompatibility } from './compatibility';
export { downloadReport } from './report';
export { searchPlaces } from './places';
export type { PlaceResult, NominatimPlace, NominatimAddress } from './places';
