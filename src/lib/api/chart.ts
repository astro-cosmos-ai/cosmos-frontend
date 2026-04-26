import { apiFetch } from './client';
import type { Chart, ChartId, CreateChartInput, LoadChartResponse } from './types';

/**
 * POST /api/charts
 * Creates the birth chart on first call; returns the existing chart on
 * subsequent calls (one chart per user).
 */
export async function createChart(input: CreateChartInput): Promise<Chart> {
  return apiFetch<Chart>('/api/charts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * GET /api/charts/{chart_id}
 * Returns the full chart object (same shape as POST /api/charts).
 */
export async function fetchChart(chartId: ChartId): Promise<Chart> {
  return apiFetch<Chart>(`/api/charts/${chartId}`);
}

/**
 * POST /api/charts/{chart_id}/load
 * Recomputes today's transit snapshot and varshaphal for the given year.
 * Call this on a schedule (e.g. daily on app open).
 */
export async function loadChart(
  chartId: ChartId,
  year?: number,
): Promise<LoadChartResponse> {
  const query = year !== undefined ? `?year=${year}` : '';
  return apiFetch<LoadChartResponse>(`/api/charts/${chartId}/load${query}`, {
    method: 'POST',
  });
}
