import { apiFetch } from './client';
import type { ChatHistoryResponse, ChartId } from './types';

/**
 * GET /api/charts/{chart_id}/chat/history
 * Returns the full conversation history for the chart (user + assistant turns).
 */
export async function fetchChatHistory(chartId: ChartId): Promise<ChatHistoryResponse> {
  return apiFetch<ChatHistoryResponse>(`/api/charts/${chartId}/chat/history`);
}
