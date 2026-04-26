import { apiFetch } from './client';
import type { ChartId, TimelineResponse } from './types';

/**
 * GET /api/charts/{chart_id}/timeline
 * Returns the Vimshottari dasha timeline with mahadasha and antardasha periods.
 */
export async function fetchTimeline(chartId: ChartId): Promise<TimelineResponse> {
  return apiFetch<TimelineResponse>(`/api/charts/${chartId}/timeline`);
}
