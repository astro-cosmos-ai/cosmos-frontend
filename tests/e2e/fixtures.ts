/**
 * Playwright custom fixtures for cosmos-frontend E2E tests.
 *
 * `signedInPage` handles the full sign-in flow so individual tests don't
 * repeat it. Tests that use this fixture will throw (not silently skip) if
 * credentials are absent — the caller is responsible for gating with
 * `test.skip(!email || !password, 'Missing test credentials')` before
 * the fixture is exercised, or simply not using it in no-auth tests.
 */

import { test as base, expect, type Page } from '@playwright/test';

export { expect };

export const test = base.extend<{ signedInPage: Page }>({
  signedInPage: async ({ page }, use) => {
    const email = process.env.PLAYWRIGHT_TEST_USER_EMAIL;
    const password = process.env.PLAYWRIGHT_TEST_USER_PASSWORD;
    if (!email || !password) {
      throw new Error(
        'signedInPage fixture requires PLAYWRIGHT_TEST_USER_EMAIL and ' +
          'PLAYWRIGHT_TEST_USER_PASSWORD to be set in .env.local',
      );
    }

    await page.goto('/en/sign-in');
    // The sign-in page uses <label htmlFor="email"> — fill by label id
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('[type="submit"]');
    await page.waitForURL('**/en/chart**');
    await use(page);
  },
});
