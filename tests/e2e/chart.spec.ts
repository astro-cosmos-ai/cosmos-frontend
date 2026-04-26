/**
 * E2E chart-page tests.
 *
 * Preconditions (same as auth.spec.ts):
 *   - .env.local contains PLAYWRIGHT_TEST_USER_EMAIL + PLAYWRIGHT_TEST_USER_PASSWORD
 *   - dev server is running:  npm run dev
 *
 * Run:  npx playwright test tests/e2e/chart.spec.ts
 */

import { test, expect } from './fixtures';

// ---------------------------------------------------------------------------
// Tests that require authentication (use signedInPage fixture)
// ---------------------------------------------------------------------------

test('birth form is shown when no chart exists', async ({ signedInPage: page }) => {
  const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;
  test.skip(!email || !password, 'Missing test credentials');

  // Clear localStorage so the chart shell renders the BirthForm, not a saved chart.
  // This simulates a fresh account or a user who has never saved a chart.
  await page.evaluate(() => localStorage.removeItem('cosmos_chart_id'));
  await page.reload();

  // BirthForm is displayed — look for the date-of-birth label rendered from
  // t('dob') = "Date of Birth" (messages/en.json -> form.dob)
  await expect(page.getByText('Date of Birth')).toBeVisible();

  // Place of birth input placeholder comes from form.pobPlaceholder
  await expect(
    page.getByPlaceholder('Search for a city...'),
  ).toBeVisible();

  // The submit button text is form.submitButton = "Generate Chart"
  await expect(
    page.getByRole('button', { name: /generate chart/i }),
  ).toBeVisible();
});

test('nav links are present on chart pages', async ({ signedInPage: page }) => {
  const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;
  test.skip(!email || !password, 'Missing test credentials');

  // After sign-in we are already on /en/chart — verify the Nav renders
  // the expected tab links.  nav.planets = "Planets", nav.dasha = "Dasha"
  // The Nav also links to /chart/analyses and /chart/chat via quick-links
  // on the overview page, not directly as top-level tabs, but the overview
  // page itself should be reachable and the nav tabs verified.

  // Top-level nav tabs always present regardless of chart state
  await expect(
    page.getByRole('link', { name: /planets/i }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: /dasha/i }),
  ).toBeVisible();

  // The "cosmos" logo link is also always in Nav
  await expect(
    page.getByRole('link', { name: /cosmos/i }).first(),
  ).toBeVisible();

  // Sign-out button is rendered when session is active
  await expect(
    page.getByRole('button', { name: /sign out/i }),
  ).toBeVisible();
});

test('analyses page renders section navigation', async ({ signedInPage: page }) => {
  const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;
  test.skip(!email || !password, 'Missing test credentials');

  await page.goto('/en/chart/analyses');

  // Section nav renders a <nav aria-label="Analysis sections">
  // (analysesPage.sectionNav = "Analysis sections")
  await expect(
    page.getByRole('navigation', { name: /analysis sections/i }),
  ).toBeVisible();

  // First section button should be "Personality" (analysesPage.sections.personality)
  await expect(
    page.getByRole('button', { name: /personality/i }),
  ).toBeVisible();

  // The run/rerun button is always rendered for the active section
  await expect(
    page.getByRole('button', { name: /run analysis|regenerate/i }).first(),
  ).toBeVisible();
});

test('chat page renders message input', async ({ signedInPage: page }) => {
  const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;
  test.skip(!email || !password, 'Missing test credentials');

  await page.goto('/en/chart/chat');

  // chatPage.title = "Chat with your chart"
  await expect(
    page.getByRole('heading', { name: /chat with your chart/i }),
  ).toBeVisible();

  // The textarea has id="chat-input" and aria-label via sr-only label
  await expect(page.locator('#chat-input')).toBeVisible();

  // Send button aria-label = chatPage.sendButton = "Send message"
  await expect(
    page.getByRole('button', { name: /send message/i }),
  ).toBeVisible();
});
