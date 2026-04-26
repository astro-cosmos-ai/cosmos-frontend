import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import sampleChart from '../../fixtures/sample-chart.json';

// Mock the Supabase browser client so no real network calls to Supabase occur.
vi.mock('@/lib/supabase/browser', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  }),
}));

import { fetchChart, createChart, loadChart } from '@/lib/api/chart';
import { ApiError } from '@/lib/api/errors';
import type { CreateChartInput } from '@/lib/api/types';

const BASE = 'http://localhost:8000';

// Local server for this test file — overrides the global handlers where needed.
const server = setupServer(
  http.get(`${BASE}/api/charts/chart-abc-123`, ({ request }) => {
    if (!request.headers.get('authorization')?.startsWith('Bearer ')) {
      return new HttpResponse('Unauthorized', { status: 401 });
    }
    return HttpResponse.json(sampleChart);
  }),

  http.post(`${BASE}/api/charts`, ({ request }) => {
    if (!request.headers.get('authorization')?.startsWith('Bearer ')) {
      return new HttpResponse('Unauthorized', { status: 401 });
    }
    return HttpResponse.json(sampleChart, { status: 201 });
  }),

  http.post(`${BASE}/api/charts/chart-abc-123/load`, () => {
    return HttpResponse.json({
      loaded: true,
      varshaphal_year: 2024,
      transit_date: '2024-01-15',
    });
  }),

  http.get(`${BASE}/api/charts/not-found`, () => {
    return HttpResponse.json({ detail: 'Chart not found' }, { status: 404 });
  }),

  http.post(`${BASE}/api/charts/chart-abc-123/load`, () => {
    return HttpResponse.json({
      loaded: true,
      varshaphal_year: 2024,
      transit_date: '2024-01-15',
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());

const sampleInput: CreateChartInput = {
  name: 'Test User',
  dob: '1990-06-15',
  tob: '06:30:00',
  pob_name: 'Mumbai, India',
  pob_lat: 19.076,
  pob_lon: 72.8777,
  timezone: 5.5,
};

describe('fetchChart', () => {
  it('returns chart data on successful response', async () => {
    const chart = await fetchChart('chart-abc-123');
    expect(chart.id).toBe(sampleChart.id);
    expect(chart.name).toBe(sampleChart.name);
  });

  it('sends Authorization header with Bearer token', async () => {
    let capturedAuth: string | null = null;
    server.use(
      http.get(`${BASE}/api/charts/chart-abc-123`, ({ request }) => {
        capturedAuth = request.headers.get('authorization');
        return HttpResponse.json(sampleChart);
      }),
    );
    await fetchChart('chart-abc-123');
    expect(capturedAuth).toBe('Bearer test-token');
  });

  it('throws ApiError with correct status on 404', async () => {
    await expect(fetchChart('not-found')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    });
  });

  it('constructs the correct URL from the chart ID', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/api/charts/chart-abc-123`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(sampleChart);
      }),
    );
    await fetchChart('chart-abc-123');
    expect(capturedUrl).toBe(`${BASE}/api/charts/chart-abc-123`);
  });
});

describe('createChart', () => {
  it('returns chart data after posting birth details', async () => {
    const chart = await createChart(sampleInput);
    expect(chart.id).toBe(sampleChart.id);
    expect(chart.pob_name).toBe(sampleChart.pob_name);
  });

  it('sends POST to /api/charts', async () => {
    let capturedMethod = '';
    let capturedUrl = '';
    server.use(
      http.post(`${BASE}/api/charts`, ({ request }) => {
        capturedMethod = request.method;
        capturedUrl = request.url;
        return HttpResponse.json(sampleChart, { status: 201 });
      }),
    );
    await createChart(sampleInput);
    expect(capturedMethod).toBe('POST');
    expect(capturedUrl).toBe(`${BASE}/api/charts`);
  });

  it('sends JSON body with chart input fields', async () => {
    let capturedBody: unknown = null;
    server.use(
      http.post(`${BASE}/api/charts`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json(sampleChart, { status: 201 });
      }),
    );
    await createChart(sampleInput);
    expect(capturedBody).toMatchObject({
      name: 'Test User',
      dob: '1990-06-15',
      tob: '06:30:00',
    });
  });
});

describe('loadChart', () => {
  it('returns loaded response with no year param', async () => {
    const result = await loadChart('chart-abc-123');
    expect(result.loaded).toBe(true);
  });

  it('appends year query param when provided', async () => {
    let capturedUrl = '';
    server.use(
      http.post(`${BASE}/api/charts/chart-abc-123/load`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ loaded: true, varshaphal_year: 2025, transit_date: '2025-01-15' });
      }),
    );
    await loadChart('chart-abc-123', 2025);
    expect(capturedUrl).toContain('year=2025');
  });
});

describe('ApiError thrown on 4xx', () => {
  it('throws ApiError on 401 response', async () => {
    server.use(
      http.get(`${BASE}/api/charts/chart-abc-123`, () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
      }),
    );
    await expect(fetchChart('chart-abc-123')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      detail: 'Unauthorized',
    });
  });

  it('throws ApiError on 500 response', async () => {
    server.use(
      http.get(`${BASE}/api/charts/chart-abc-123`, () => {
        return HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 });
      }),
    );
    await expect(fetchChart('chart-abc-123')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    });
  });
});
