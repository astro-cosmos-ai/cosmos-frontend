import { http, HttpResponse } from 'msw';
import sampleChart from '../fixtures/sample-chart.json';
import sampleAnalysis from '../fixtures/sample-analysis.json';

const BASE = 'http://localhost:8000';

export const BACKEND_URL = BASE;

export const handlers = [
  // GET /api/charts/:id
  http.get(`${BASE}/api/charts/:id`, () => {
    return HttpResponse.json(sampleChart);
  }),

  // POST /api/charts
  http.post(`${BASE}/api/charts`, () => {
    return HttpResponse.json(sampleChart, { status: 201 });
  }),

  // POST /api/charts/:id/analyze/:section
  http.post(`${BASE}/api/charts/:id/analyze/:section`, () => {
    return HttpResponse.json(sampleAnalysis);
  }),

  // GET /api/charts/:id/analyses
  http.get(`${BASE}/api/charts/:id/analyses`, () => {
    return HttpResponse.json([sampleAnalysis]);
  }),

  // GET /api/charts/:id/chat/history
  http.get(`${BASE}/api/charts/:id/chat/history`, () => {
    return HttpResponse.json([]);
  }),

  // GET /api/charts/:id/timeline
  http.get(`${BASE}/api/charts/:id/timeline`, () => {
    return HttpResponse.json({
      current_dasha: {
        major: { planet: 'Jupiter', start: '2022-01-01', end: '2038-01-01' },
        minor: { planet: 'Saturn', start: '2023-07-04', end: '2025-11-14' },
      },
      timeline: [
        {
          planet: 'Jupiter',
          start: '2022-01-01',
          end: '2038-01-01',
          antardashas: [
            { planet: 'Jupiter', start: '2022-01-01', end: '2023-07-04' },
            { planet: 'Saturn', start: '2023-07-04', end: '2025-11-14' },
            { planet: 'Mercury', start: '2025-11-14', end: '2028-01-11' },
          ],
        },
        {
          planet: 'Saturn',
          start: '2038-01-01',
          end: '2057-01-01',
          antardashas: [
            { planet: 'Saturn', start: '2038-01-01', end: '2041-01-07' },
            { planet: 'Mercury', start: '2041-01-07', end: '2043-08-14' },
          ],
        },
      ],
    });
  }),

  // POST /api/charts/:id/load
  http.post(`${BASE}/api/charts/:id/load`, () => {
    return HttpResponse.json({
      loaded: true,
      varshaphal_year: 2024,
      transit_date: '2024-01-15',
    });
  }),

  // GET /api/charts/:id/report.pdf
  http.get(`${BASE}/api/charts/:id/report.pdf`, () =>
    new HttpResponse(new Uint8Array([1, 2, 3, 4]), {
      headers: { 'Content-Type': 'application/pdf' },
    }),
  ),
];
