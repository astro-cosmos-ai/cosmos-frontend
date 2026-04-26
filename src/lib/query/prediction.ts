import { useMutation } from '@tanstack/react-query';
import { predict } from '@/lib/api/prediction';
import type { ChartId, PredictionParams, PredictionResult } from '@/lib/api/types';

/**
 * Scans dasha windows + transits to find likely periods for a life event.
 * Mutation because the question and date range are supplied at call time.
 */
export function usePredict(chartId: ChartId) {
  return useMutation<PredictionResult, Error, PredictionParams>({
    mutationFn: (params) => predict(chartId, params),
  });
}
