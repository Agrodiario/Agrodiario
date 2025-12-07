import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

/**
 * Playwright configuration for Agrodiario E2E tests.
 * See https://playwright.dev/docs/test-configuration
 *
 * For local development:
 *   1. Start backend: yarn dev:backend
 *   2. Start frontend: yarn dev:client
 *   3. Run tests: yarn test:e2e
 *
 * The webServer config will reuse existing servers if they're running.
 * Set SKIP_SERVER=true to skip server checks entirely.
 */

const skipServerStart = process.env.SKIP_SERVER === 'true';

export default defineConfig({
  testDir: './e2e/tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI for stability */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'e2e/reports' }],
    ['list'],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL for navigation */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      testDir: './e2e/fixtures',
    },

    // Auth tests (login, register) - no authentication needed
    {
      name: 'auth',
      testMatch: /auth\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Authenticated tests - depend on setup
    {
      name: 'chromium',
      testIgnore: /auth\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Uncomment to add more browsers
    // {
    //   name: 'firefox',
    //   testIgnore: /auth\/.*\.spec\.ts/,
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     storageState: 'e2e/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
  ],

  /* Run local dev servers before starting the tests */
  webServer: skipServerStart
    ? undefined
    : [
        {
          command: 'yarn dev:backend',
          url: 'http://localhost:3000/api/v1',
          reuseExistingServer: true,
          timeout: 120000,
          stdout: 'pipe',
          stderr: 'pipe',
        },
        {
          command: 'yarn dev:client',
          url: 'http://localhost:5173',
          reuseExistingServer: true,
          timeout: 120000,
          stdout: 'pipe',
          stderr: 'pipe',
        },
      ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'e2e/test-results',

  /* Global timeout for each test */
  timeout: 30000,

  /* Timeout for expect assertions */
  expect: {
    timeout: 10000,
  },
});
