import { apiFetch } from './client';
import type { AnalysisResult, ChartId, Section } from './types';

/**
 * POST /api/charts/{chart_id}/analyze/{section}
 * Runs AI analysis for a section. Subsequent calls return the cached result.
 */
export async function runAnalysis(
  chartId: ChartId,
  section: Section,
): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>(`/api/charts/${chartId}/analyze/${section}`, {
    method: 'POST',
  });
}

/**
 * GET /api/charts/{chart_id}/analyses
 * Returns all previously computed analyses for the chart.
 */
export async function listAnalyses(chartId: ChartId): Promise<AnalysisResult[]> {
  return apiFetch<AnalysisResult[]>(`/api/charts/${chartId}/analyses`);
}
