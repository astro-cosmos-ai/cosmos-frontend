import { useQuery } from '@tanstack/react-query';
import { fetchChatHistory } from '@/lib/api/chat';
import type { ChatHistoryResponse, ChartId } from '@/lib/api/types';

/**
 * Fetches the full conversation history for a chart.
 * staleTime: 0 — new messages may have arrived; always refetch on mount.
 */
export function useChatHistory(chartId: ChartId | undefined) {
  return useQuery<ChatHistoryResponse, Error>({
    queryKey: ['chat-history', chartId],
    queryFn: () => fetchChatHistory(chartId!),
    enabled: !!chartId,
    staleTime: 0,
  });
}
