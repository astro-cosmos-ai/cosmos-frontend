import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import sampleAnalysis from '../../fixtures/sample-analysis.json';

vi.mock('@/lib/supabase/browser', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  }),
}));

import { runAnalysis, listAnalyses } from '@/lib/api/analyses';

const BASE = 'http://localhost:8000';

const server = setupServer(
  http.post(`${BASE}/api/charts/:id/analyze/:section`, ({ params }) => {
    return HttpResponse.json({ ...sampleAnalysis, section: params.section });
  }),

  http.get(`${BASE}/api/charts/:id/analyses`, () => {
    return HttpResponse.json([sampleAnalysis]);
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());

describe('runAnalysis', () => {
  it('calls POST /api/charts/:id/analyze/:section', async () => {
    let capturedMethod = '';
    let capturedUrl = '';
    server.use(
      http.post(`${BASE}/api/charts/chart-abc-123/analyze/personality`, ({ request }) => {
        capturedMethod = request.method;
        capturedUrl = request.url;
        return HttpResponse.json(sampleAnalysis);
      }),
    );
    await runAnalysis('chart-abc-123', 'personality');
    expect(capturedMethod).toBe('POST');
    expect(capturedUrl).toBe(`${BASE}/api/charts/chart-abc-123/analyze/personality`);
  });

  it('returns AnalysisResult with correct fields', async () => {
    const result = await runAnalysis('chart-abc-123', 'personality');
    expect(result.id).toBe(sampleAnalysis.id);
    expect(result.chart_id).toBe(sampleAnalysis.chart_id);
    expect(result.section).toBe('personality');
    expect(typeof result.content).toBe('string');
  });

  it('sends Authorization header', async () => {
    let capturedAuth: string | null = null;
    server.use(
      http.post(`${BASE}/api/charts/chart-abc-123/analyze/career`, ({ request }) => {
        capturedAuth = request.headers.get('authorization');
        return HttpResponse.json({ ...sampleAnalysis, section: 'career' });
      }),
    );
    await runAnalysis('chart-abc-123', 'career');
    expect(capturedAuth).toBe('Bearer test-token');
  });

  it('routes to the correct section in the URL', async () => {
    let capturedUrl = '';
    server.use(
      http.post(`${BASE}/api/charts/chart-abc-123/analyze/mind`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ ...sampleAnalysis, section: 'mind' });
      }),
    );
    await runAnalysis('chart-abc-123', 'mind');
    expect(capturedUrl).toContain('/analyze/mind');
  });

  it('throws ApiError on 4xx response', async () => {
    server.use(
      http.post(`${BASE}/api/charts/chart-abc-123/analyze/health`, () => {
        return HttpResponse.json({ detail: 'Chart not loaded' }, { status: 400 });
      }),
    );
    await expect(runAnalysis('chart-abc-123', 'health')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
    });
  });
});

describe('listAnalyses', () => {
  it('calls GET /api/charts/:id/analyses', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/api/charts/chart-abc-123/analyses`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([sampleAnalysis]);
      }),
    );
    await listAnalyses('chart-abc-123');
    expect(capturedUrl).toBe(`${BASE}/api/charts/chart-abc-123/analyses`);
  });

  it('returns an array of AnalysisResult objects', async () => {
    const results = await listAnalyses('chart-abc-123');
    expect(Array.isArray(results)).toBe(true);
    expect(results[0].id).toBe(sampleAnalysis.id);
    expect(results[0].section).toBe(sampleAnalysis.section);
  });

  it('sends Authorization header', async () => {
    let capturedAuth: string | null = null;
    server.use(
      http.get(`${BASE}/api/charts/chart-abc-123/analyses`, ({ request }) => {
        capturedAuth = request.headers.get('authorization');
        return HttpResponse.json([sampleAnalysis]);
      }),
    );
    await listAnalyses('chart-abc-123');
    expect(capturedAuth).toBe('Bearer test-token');
  });
});
