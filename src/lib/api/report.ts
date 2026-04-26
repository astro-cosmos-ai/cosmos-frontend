import { createClient } from '@/lib/supabase/browser';
import { ApiError } from './errors';
import type { ChartId } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!BASE_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

/**
 * GET /api/charts/{chart_id}/report.pdf
 * Downloads the full PDF report for the chart. Returns a raw Blob so the
 * caller can trigger a browser download or open a blob URL.
 *
 * Uses a direct fetch rather than apiFetch because the response is binary —
 * apiFetch returns res.json() for JSON content-types and a raw Response for
 * everything else, which would require an extra .blob() call. This wrapper
 * keeps the PDF path explicit and type-safe.
 */
export async function downloadReport(chartId: ChartId): Promise<Blob> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${BASE_URL}/api/charts/${chartId}/report.pdf`, {
    method: 'GET',
    headers: {
      Accept: 'application/pdf',
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
  });

  if (!res.ok) {
    let detail: string;
    try {
      const body = await res.json();
      detail = typeof body?.detail === 'string' ? body.detail : JSON.stringify(body);
    } catch {
      detail = res.statusText;
    }
    throw new ApiError(res.status, detail);
  }

  return res.blob();
}
