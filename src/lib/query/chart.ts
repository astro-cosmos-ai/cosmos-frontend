import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createChart, fetchChart, loadChart } from '@/lib/api/chart';
import type { Chart, ChartId, CreateChartInput, LoadChartResponse } from '@/lib/api/types';

const STALE_5MIN = 5 * 60 * 1000;

/**
 * Fetches a single chart by ID.
 * staleTime: 5 min — birth chart is immutable per user.
 */
export function useChart(chartId: ChartId | undefined) {
  return useQuery<Chart, Error>({
    queryKey: ['chart', chartId],
    queryFn: () => fetchChart(chartId!),
    enabled: !!chartId,
    staleTime: STALE_5MIN,
  });
}

/**
 * Creates a new birth chart (POST /api/charts).
 * Invalidates all chart queries on success so any list view refreshes.
 */
export function useCreateChart() {
  const qc = useQueryClient();
  return useMutation<Chart, Error, CreateChartInput>({
    mutationFn: (input) => createChart(input),
    onSuccess: (data) => {
      qc.setQueryData(['chart', data.id], data);
      qc.invalidateQueries({ queryKey: ['chart'] });
    },
  });
}

/**
 * Triggers a daily snapshot recompute for a chart (POST /api/charts/{id}/load).
 * Invalidates transits and varshaphal caches for the chart on success.
 */
export function useLoadChart(chartId: ChartId) {
  const qc = useQueryClient();
  return useMutation<LoadChartResponse, Error, number | undefined>({
    mutationFn: (year) => loadChart(chartId, year),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transits', chartId] });
      qc.invalidateQueries({ queryKey: ['double-transit', chartId] });
      qc.invalidateQueries({ queryKey: ['varshaphal', chartId] });
    },
  });
}
