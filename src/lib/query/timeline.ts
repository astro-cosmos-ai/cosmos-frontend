import { useQuery } from '@tanstack/react-query';
import { fetchTimeline } from '@/lib/api/timeline';
import type { ChartId, TimelineResponse } from '@/lib/api/types';

/**
 * Fetches the Vimshottari dasha timeline for a chart.
 * staleTime: Infinity — timeline is deterministic from birth data; never changes.
 */
export function useTimeline(chartId: ChartId | undefined) {
  return useQuery<TimelineResponse, Error>({
    queryKey: ['timeline', chartId],
    queryFn: () => fetchTimeline(chartId!),
    enabled: !!chartId,
    staleTime: Infinity,
  });
}
