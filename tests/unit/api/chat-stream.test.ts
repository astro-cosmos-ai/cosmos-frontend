import { describe, it, expect, vi, afterEach } from 'vitest';
import { ApiError } from '@/lib/api/errors';

// Mock Supabase browser client before importing the module under test.
vi.mock('@/lib/supabase/browser', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  }),
}));

import { streamChat } from '@/lib/api/chat-stream';

const BASE = 'http://localhost:8000';

/** Build a Response whose body is a ReadableStream that emits `chunks` in order. */
function makeStreamResponse(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

/** Collect all yielded values from an async generator into an array. */
async function collect(gen: AsyncGenerator<string>): Promise<string[]> {
  const results: string[] = [];
  for await (const value of gen) {
    results.push(value);
  }
  return results;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('streamChat', () => {
  it('yields text chunks from a properly formatted SSE stream', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      makeStreamResponse([
        'data: {"text": "hello"}\n\n',
        'data: {"text": "world"}\n\n',
        'data: [DONE]\n\n',
      ]),
    );

    const chunks = await collect(streamChat('chart-abc-123', 'hi'));
    expect(chunks).toEqual(['hello', 'world']);
  });

  it('stops yielding after [DONE] sentinel', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      makeStreamResponse([
        'data: {"text": "first"}\n\n',
        'data: [DONE]\n\n',
        // This chunk comes after [DONE] — must never be yielded.
        'data: {"text": "after-done"}\n\n',
      ]),
    );

    const chunks = await collect(streamChat('chart-abc-123', 'hi'));
    expect(chunks).toEqual(['first']);
    expect(chunks).not.toContain('after-done');
  });

  it('yields the final content chunk on the line immediately before [DONE]', async () => {
    // Backend may send the last content and [DONE] in a single network packet.
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      makeStreamResponse([
        'data: {"text": "alpha"}\n\ndata: {"text": "beta"}\n\ndata: [DONE]\n\n',
      ]),
    );

    const chunks = await collect(streamChat('chart-abc-123', 'hi'));
    expect(chunks).toEqual(['alpha', 'beta']);
  });

  it('throws ApiError(401) when fetch returns 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(collect(streamChat('chart-abc-123', 'hi'))).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      detail: 'Unauthorized',
    });
  });

  it('sends Authorization: Bearer <token> header', async () => {
    let capturedAuth: string | null = null;

    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        capturedAuth = headers.get('authorization');
        return makeStreamResponse(['data: [DONE]\n\n']);
      },
    );

    await collect(streamChat('chart-abc-123', 'hi'));
    expect(capturedAuth).toBe('Bearer test-token');
  });

  it('terminates cleanly when the AbortSignal fires mid-stream', async () => {
    const controller = new AbortController();

    // Emit first chunk; the signal will be aborted before the loop reads again.
    const encoder = new TextEncoder();
    let readCount = 0;

    const stream = new ReadableStream<Uint8Array>({
      pull(ctrl) {
        if (readCount === 0) {
          ctrl.enqueue(encoder.encode('data: {"text": "chunk1"}\n\n'));
          readCount++;
          // Abort after enqueuing so the generator sees signal.aborted on next tick.
          controller.abort();
        } else {
          // Would enqueue more, but abort should have stopped the loop.
          ctrl.enqueue(encoder.encode('data: {"text": "chunk2"}\n\n'));
          ctrl.close();
        }
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      }),
    );

    const chunks = await collect(streamChat('chart-abc-123', 'hi', controller.signal));
    // The generator should have stopped — it may have yielded chunk1 but must
    // never yield chunk2 (which would require ignoring the aborted signal).
    expect(chunks).not.toContain('chunk2');
  });
});
