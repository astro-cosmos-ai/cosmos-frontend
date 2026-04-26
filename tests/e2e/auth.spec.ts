/**
 * E2E auth happy-path tests.
 *
 * These tests require a live Supabase project and a running cosmos-backend.
 * To run them:
 *
 *   1. Copy .env.local.example to .env.local and fill in real Supabase + backend vars.
 *   2. Seed a test user in your Supabase project (email: test@example.com, password: test-password).
 *   3. Start the dev server:  npm run dev
 *   4. Run:  npx playwright test tests/e2e/auth.spec.ts
 *
 * All tests are skipped in CI until Supabase credentials are provisioned.
 */

import { test, expect } from '@playwright/test';

test.skip('user signs in and lands on /chart', async ({ page }) => {
  await page.goto('/en/sign-in');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('test-password');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/en\/chart/);
});

test.skip('user creates chart from form', async ({ page }) => {
  await page.goto('/en/sign-in');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('test-password');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/en\/chart/);

  await page.getByRole('link', { name: /new chart/i }).click();
  await page.getByLabel('Full Name').fill('Test User');
  // DatePicker and TimePicker have custom interactions — fill via accessible labels
  await page.getByLabel('Date of Birth').fill('1990-06-15');
  await page.getByLabel('Time of Birth').fill('06:30:00');
  await page.getByLabel('Place of Birth').fill('Mumbai');
  // Wait for autocomplete and select first result
  await page.getByRole('option').first().click();
  await page.getByRole('button', { name: /generate chart/i }).click();

  await expect(page.getByText('Birth Chart Overview')).toBeVisible();
});

test.skip('user runs an analysis', async ({ page }) => {
  await page.goto('/en/sign-in');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('test-password');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/en\/chart/);

  await page.goto('/en/chart/analyses');
  await page.getByRole('button', { name: /run analysis/i }).first().click();
  // Analysis content should appear (may take a few seconds for the AI call)
  await expect(page.getByText(/cached/i)).toBeVisible({ timeout: 30_000 });
});

test.skip('user signs out', async ({ page }) => {
  await page.goto('/en/sign-in');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('test-password');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/en\/chart/);

  await page.getByRole('button', { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/en\/(sign-in|$)/);
});
