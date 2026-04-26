import { apiFetch } from './client';
import type { ChartId, PredictionParams, PredictionResult } from './types';

/**
 * POST /api/charts/{chart_id}/predict
 * Scans dasha windows + transits to find likely periods for a life event.
 */
export async function predict(
  chartId: ChartId,
  params: PredictionParams,
): Promise<PredictionResult> {
  return apiFetch<PredictionResult>(`/api/charts/${chartId}/predict`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
