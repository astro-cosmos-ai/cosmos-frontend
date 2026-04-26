import { apiFetch } from './client';
import type { ChartId, CompatibilityResult } from './types';

/**
 * POST /api/compatibility/
 * Computes Ashtakoot compatibility between two charts belonging to the
 * requesting user. Returns the full scored report.
 */
export async function computeCompatibility(
  chartId1: ChartId,
  chartId2: ChartId,
): Promise<CompatibilityResult> {
  return apiFetch<CompatibilityResult>('/api/compatibility/', {
    method: 'POST',
    body: JSON.stringify({ chart_id_1: chartId1, chart_id_2: chartId2 }),
  });
}

/**
 * GET /api/compatibility/{chart_id_1}/{chart_id_2}
 * Returns a previously computed (cached) compatibility report.
 */
export async function fetchCompatibility(
  chartId1: ChartId,
  chartId2: ChartId,
): Promise<CompatibilityResult> {
  return apiFetch<CompatibilityResult>(`/api/compatibility/${chartId1}/${chartId2}`);
}
