import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAnalyses, runAnalysis } from '@/lib/api/analyses';
import type { AnalysisResult, ChartId, Section } from '@/lib/api/types';

/**
 * Fetches (or runs and caches) the analysis for a specific section.
 * The backend POST is idempotent — subsequent calls return the cached result.
 * staleTime: Infinity — backend caches; never refetch unless user regenerates.
 */
export function useAnalysis(chartId: ChartId | undefined, section: Section) {
  return useQuery<AnalysisResult, Error>({
    queryKey: ['analyses', chartId, section],
    queryFn: () => runAnalysis(chartId!, section),
    enabled: !!chartId,
    staleTime: Infinity,
  });
}

/**
 * Fetches all previously computed analyses for a chart (GET /api/charts/{id}/analyses).
 * staleTime: Infinity — same reasoning as useAnalysis.
 */
export function useAnalyses(chartId: ChartId | undefined) {
  return useQuery<AnalysisResult[], Error>({
    queryKey: ['analyses', chartId],
    queryFn: () => listAnalyses(chartId!),
    enabled: !!chartId,
    staleTime: Infinity,
  });
}

/**
 * Mutation to explicitly (re)run an analysis for a section.
 * Seeds the per-section query cache entry and invalidates the chart-level list.
 */
export function useRunAnalysis(chartId: ChartId) {
  const qc = useQueryClient();
  return useMutation<AnalysisResult, Error, Section>({
    mutationFn: (section) => runAnalysis(chartId, section),
    onSuccess: (data, section) => {
      qc.setQueryData(['analyses', chartId, section], data);
      qc.invalidateQueries({ queryKey: ['analyses', chartId] });
    },
  });
}
