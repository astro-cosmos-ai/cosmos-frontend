import { useQuery } from '@tanstack/react-query';
import { fetchVarshaphal } from '@/lib/api/varshaphal';
import type { ChartId, VarshaphalResult } from '@/lib/api/types';

/**
 * Fetches the annual solar return (Varshaphal) chart for a given year.
 * Requires loadChart(chartId, year) to have been called first to populate the snapshot.
 * Pass `enabled: false` to defer until POST /load?year={year} has completed.
 * staleTime: Infinity — deterministic for a given chart+year combination.
 */
export function useVarshaphal(chartId: ChartId | undefined, year?: number, enabled = true) {
  return useQuery<VarshaphalResult, Error>({
    queryKey: ['varshaphal', chartId, year],
    queryFn: () => fetchVarshaphal(chartId!, year),
    enabled: !!chartId && enabled,
    staleTime: Infinity,
  });
}
