import { createClient } from '@/lib/supabase/browser';
import { ApiError } from './errors';
import type { ChartId } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!BASE_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

/**
 * POST /api/charts/{chart_id}/chat  (SSE)
 *
 * Streams assistant reply chunks as they arrive. Yields each text fragment.
 * Uses fetch + ReadableStream — not EventSource — so the Authorization header
 * can be set (EventSource does not support custom headers).
 *
 * Backend SSE format:
 *   data: {"text": "..."}
 *   data: [DONE]
 *
 * Usage:
 *   for await (const chunk of streamChat(chartId, message)) {
 *     append(chunk);
 *   }
 */
export async function* streamChat(
  chartId: ChartId,
  message: string,
): AsyncGenerator<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${BASE_URL}/api/charts/${chartId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    body: JSON.stringify({ message }),
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

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) return;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload) as { text: string };
        yield parsed.text;
      } catch {
        // Malformed chunk — skip and continue
      }
    }
  }
}
