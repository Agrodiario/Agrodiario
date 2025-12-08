import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages';
import { testCredentials } from './test-fixtures';

const authFile = 'e2e/.auth/user.json';

/**
 * Authentication setup - runs before authenticated tests.
 * Saves the authentication state to a file for reuse.
 */
setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Navigate to login page
  await loginPage.goto();

  // Perform login
  await loginPage.login(testCredentials.email, testCredentials.password);

  // Wait for successful login (redirect to diary)
  await page.waitForURL('**/diary', { timeout: 15000 });

  // Verify we're logged in
  await expect(page).toHaveURL(/\/diary/);

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
