import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { computeCompatibility, fetchCompatibility } from '@/lib/api/compatibility';
import type { ChartId, CompatibilityResult } from '@/lib/api/types';

/**
 * Fetches a previously computed (cached) compatibility report for two charts.
 * staleTime: Infinity — deterministic; backend caches the result permanently.
 */
export function useCompatibility(
  chartId1: ChartId | undefined,
  chartId2: ChartId | undefined,
) {
  return useQuery<CompatibilityResult, Error>({
    queryKey: ['compatibility', chartId1, chartId2],
    queryFn: () => fetchCompatibility(chartId1!, chartId2!),
    enabled: !!chartId1 && !!chartId2,
    staleTime: Infinity,
  });
}

/**
 * Computes (or recomputes) the Ashtakoot compatibility between two charts.
 * Seeds the read query cache on success so useCompatibility returns immediately.
 */
export function useComputeCompatibility(chartId: ChartId) {
  const qc = useQueryClient();
  return useMutation<CompatibilityResult, Error, ChartId>({
    mutationFn: (partnerChartId) => computeCompatibility(chartId, partnerChartId),
    onSuccess: (data) => {
      qc.setQueryData(
        ['compatibility', data.chart_id_1, data.chart_id_2],
        data,
      );
    },
  });
}
