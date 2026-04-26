import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

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

import { downloadReport } from '@/lib/api/report';
import { ApiError } from '@/lib/api/errors';

const BASE = 'http://localhost:8000';

const server = setupServer(
  http.get(`${BASE}/api/charts/:id/report.pdf`, () =>
    new HttpResponse(new Uint8Array([1, 2, 3, 4]), {
      headers: { 'Content-Type': 'application/pdf' },
    }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());

describe('downloadReport', () => {
  it('returns a Blob with type application/pdf', async () => {
    const blob = await downloadReport('chart-abc-123');
    // Use duck-type assertions: Blob is cross-realm in the jsdom+MSW environment
    // so instanceof Blob may fail across realm boundaries.
    expect(blob.type).toBe('application/pdf');
    expect(typeof blob.size).toBe('number');
    expect(blob.size).toBeGreaterThan(0);
    expect(typeof blob.arrayBuffer).toBe('function');
  });

  it('sends Authorization: Bearer <token> header', async () => {
    let capturedAuth: string | null = null;
    server.use(
      http.get(`${BASE}/api/charts/chart-abc-123/report.pdf`, ({ request }) => {
        capturedAuth = request.headers.get('authorization');
        return new HttpResponse(new Uint8Array([1, 2, 3, 4]), {
          headers: { 'Content-Type': 'application/pdf' },
        });
      }),
    );
    await downloadReport('chart-abc-123');
    expect(capturedAuth).toBe('Bearer test-token');
  });

  it('throws ApiError(404) when the server returns 404', async () => {
    server.use(
      http.get(`${BASE}/api/charts/chart-abc-123/report.pdf`, () =>
        HttpResponse.json({ detail: 'Chart not found' }, { status: 404 }),
      ),
    );
    await expect(downloadReport('chart-abc-123')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      detail: 'Chart not found',
    });
  });

  it('throws ApiError(500) when the server returns 500', async () => {
    server.use(
      http.get(`${BASE}/api/charts/chart-abc-123/report.pdf`, () =>
        HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 }),
      ),
    );
    await expect(downloadReport('chart-abc-123')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    });
  });
});
