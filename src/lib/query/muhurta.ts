import { useMutation } from '@tanstack/react-query';
import { findMuhurta } from '@/lib/api/muhurta';
import type { ChartId, MuhurtaParams, MuhurtaResult } from '@/lib/api/types';

/**
 * Finds auspicious dates for a given event type within a date range.
 * Mutation because parameters (event_type, date range) are supplied at call time.
 */
export function useFindMuhurta(chartId: ChartId) {
  return useMutation<MuhurtaResult, Error, MuhurtaParams>({
    mutationFn: (params) => findMuhurta(chartId, params),
  });
}
