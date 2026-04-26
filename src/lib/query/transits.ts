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
 * Pass `enabled: false` to defer until a prerequisite (e.g. /load) completes.
 */
export function useTransits(chartId: ChartId | undefined, enabled = true) {
  return useQuery<TransitResult, Error>({
    queryKey: ['transits', chartId],
    queryFn: () => fetchTransits(chartId!),
    enabled: !!chartId && enabled,
    staleTime: STALE_10MIN,
  });
}

/**
 * Fetches the Jupiter + Saturn double-transit influence map.
 * staleTime: 10 min — same reasoning as useTransits.
 * Pass `enabled: false` to defer until a prerequisite (e.g. /load) completes.
 */
export function useDoubleTransit(chartId: ChartId | undefined, enabled = true) {
  return useQuery<DoubleTransitResult, Error>({
    queryKey: ['double-transit', chartId],
    queryFn: () => fetchDoubleTransit(chartId!),
    enabled: !!chartId && enabled,
    staleTime: STALE_10MIN,
  });
}

/**
 * Fetches the current Sade Sati status for a chart.
 * staleTime: 10 min — same reasoning as useTransits.
 * Pass `enabled: false` to defer until a prerequisite (e.g. /load) completes.
 */
export function useSadeSati(chartId: ChartId | undefined, enabled = true) {
  return useQuery<SadeSatiResult, Error>({
    queryKey: ['sade-sati', chartId],
    queryFn: () => fetchSadeSati(chartId!),
    enabled: !!chartId && enabled,
    staleTime: STALE_10MIN,
  });
}
