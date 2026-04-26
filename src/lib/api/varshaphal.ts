import { apiFetch } from './client';
import type { ChartId, VarshaphalResult } from './types';

/**
 * GET /api/charts/{chart_id}/varshaphal
 * Returns the annual solar return chart for the given year.
 * Requires loadChart(chartId, year) to have been called first.
 */
export async function fetchVarshaphal(
  chartId: ChartId,
  year?: number,
): Promise<VarshaphalResult> {
  const query = year !== undefined ? `?year=${year}` : '';
  return apiFetch<VarshaphalResult>(`/api/charts/${chartId}/varshaphal${query}`);
}
