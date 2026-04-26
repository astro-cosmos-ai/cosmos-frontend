import { apiFetch } from './client';
import type { ChartId, MuhurtaParams, MuhurtaResult } from './types';

/**
 * POST /api/charts/{chart_id}/muhurta
 * Finds auspicious dates for a given event type within the specified date range.
 */
export async function findMuhurta(
  chartId: ChartId,
  params: MuhurtaParams,
): Promise<MuhurtaResult> {
  return apiFetch<MuhurtaResult>(`/api/charts/${chartId}/muhurta`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
