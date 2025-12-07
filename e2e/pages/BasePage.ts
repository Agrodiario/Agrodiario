import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object Model with common functionality.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a path relative to the base URL
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get text content of an element
   */
  async getTextContent(locator: Locator): Promise<string | null> {
    return locator.textContent();
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Wait for URL to contain a specific path
   */
  async waitForURL(urlPart: string) {
    await this.page.waitForURL(`**/${urlPart}**`);
  }
}
