import { apiFetch } from './client';
import type { ChartId, DoubleTransitResult, SadeSatiResult, TransitResult } from './types';

/**
 * GET /api/charts/{chart_id}/transits
 * Returns today's pre-loaded transit snapshot. Call loadChart() first to populate it.
 */
export async function fetchTransits(chartId: ChartId): Promise<TransitResult> {
  return apiFetch<TransitResult>(`/api/charts/${chartId}/transits`);
}

/**
 * GET /api/charts/{chart_id}/double-transit
 * Returns the Jupiter + Saturn joint influence map across houses.
 */
export async function fetchDoubleTransit(chartId: ChartId): Promise<DoubleTransitResult> {
  return apiFetch<DoubleTransitResult>(`/api/charts/${chartId}/double-transit`);
}

/**
 * GET /api/charts/{chart_id}/sadesati
 * Returns the current Sade Sati status for the chart.
 */
export async function fetchSadeSati(chartId: ChartId): Promise<SadeSatiResult> {
  return apiFetch<SadeSatiResult>(`/api/charts/${chartId}/sadesati`);
}
