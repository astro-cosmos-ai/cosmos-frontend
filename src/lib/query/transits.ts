import { useQuery } from '@tanstack/react-query';
import { fetchDoubleTransit, fetchSadeSati, fetchTransits } from '@/lib/api/transits';
import type {
  ChartId,
  DoubleTransitResult,
  SadeSatiResult,
  TransitResult,
} from '@/lib/api/types';

const STALE_10MIN = 10 * 60 * 1000;

/**
 * Fetches today's transit snapshot for a chart.
 * staleTime: 10 min — daily snapshot; safe to cache within a session.
 */
export function useTransits(chartId: ChartId | undefined) {
  return useQuery<TransitResult, Error>({
    queryKey: ['transits', chartId],
    queryFn: () => fetchTransits(chartId!),
    enabled: !!chartId,
    staleTime: STALE_10MIN,
  });
}

/**
 * Fetches the Jupiter + Saturn double-transit influence map.
 * staleTime: 10 min — same reasoning as useTransits.
 */
export function useDoubleTransit(chartId: ChartId | undefined) {
  return useQuery<DoubleTransitResult, Error>({
    queryKey: ['double-transit', chartId],
    queryFn: () => fetchDoubleTransit(chartId!),
    enabled: !!chartId,
    staleTime: STALE_10MIN,
  });
}

/**
 * Fetches the current Sade Sati status for a chart.
 * staleTime: 10 min — same reasoning as useTransits.
 */
export function useSadeSati(chartId: ChartId | undefined) {
  return useQuery<SadeSatiResult, Error>({
    queryKey: ['sade-sati', chartId],
    queryFn: () => fetchSadeSati(chartId!),
    enabled: !!chartId,
    staleTime: STALE_10MIN,
  });
}
