/**
 * E2E auth happy-path tests.
 *
 * These tests require a live Supabase project and a running cosmos-backend.
 * To run them:
 *
 *   1. Copy .env.local.example to .env.local and fill in real Supabase + backend vars.
 *   2. Add PLAYWRIGHT_TEST_USER_EMAIL and PLAYWRIGHT_TEST_USER_PASSWORD to .env.local.
 *      The test user must exist in your Supabase project and have email-confirmed status.
 *   3. Start the dev server:  npm run dev
 *   4. Run:  npx playwright test tests/e2e/auth.spec.ts
 *
 * Tests are conditionally skipped when credentials are absent so the suite
 * passes in CI environments that have not provisioned Supabase credentials.
 */

import { test, expect } from './fixtures';

// ---------------------------------------------------------------------------
// Tests that require authentication
// ---------------------------------------------------------------------------

test('signs in and lands on /chart', async ({ page }) => {
  const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;
  test.skip(!email || !password, 'Missing test credentials');

  await page.goto('/en/sign-in');
  await page.fill('#email', email!);
  await page.fill('#password', password!);
  await page.click('[type="submit"]');

  await expect(page).toHaveURL(/\/en\/chart/);
  // The sign-in form must no longer be visible
  await expect(page.locator('#email')).not.toBeVisible();
});

test('sign out redirects to landing', async ({ signedInPage: page }) => {
  const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;
  test.skip(!email || !password, 'Missing test credentials');

  // Locate the "Sign out" button rendered by Nav.tsx using its translated text
  await page.getByRole('button', { name: /sign out/i }).click();

  // After sign-out the Nav redirects to /${locale} which resolves to /en
  await expect(page).toHaveURL(/^http:\/\/localhost:3000\/en\/?$/);
});

// ---------------------------------------------------------------------------
// Tests that do NOT require authentication
// ---------------------------------------------------------------------------

test('unauthenticated user is redirected from /chart to /sign-in', async ({ page }) => {
  // Navigate directly to the chart page with no active session.
  // The middleware / server component should redirect to sign-in.
  await page.goto('/en/chart');
  await expect(page).toHaveURL(/\/en\/sign-in/);
});

test('locale switcher changes URL prefix', async ({ page }) => {
  await page.goto('/en');

  // LocaleSwitcher renders a <select aria-label="Switch language">
  // with option values 'en', 'hi', 'te'. Select Hindi.
  await page.selectOption('select[aria-label="Switch language"]', 'hi');

  await expect(page).toHaveURL(/\/hi/);
  await expect(page).not.toHaveURL(/\/en/);
});

test('landing page shows get-started button and sign-in link', async ({ page }) => {
  await page.goto('/en');

  // "Get started" is the primary CTA — rendered as a link styled as a button
  await expect(
    page.getByRole('link', { name: /get started/i }),
  ).toBeVisible();

  // "Already have an account? Sign in" link text comes from landing.signIn
  await expect(
    page.getByRole('link', { name: /sign in/i }).first(),
  ).toBeVisible();

  // Page heading — t('headline') = "cosmos"
  await expect(page.getByRole('heading', { name: /cosmos/i })).toBeVisible();
});
