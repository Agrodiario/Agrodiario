import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type CultureSortField = 'plantingDate' | 'cultureName' | 'plantingArea' | 'propertyName' | 'cycle' | 'daysRemaining' | 'daysElapsed';

/**
 * Page Object Model for the Cultures list page.
 */
export class CulturesPage extends BasePage {
  // Search & Filter
  readonly searchInput: Locator;
  readonly sortButton: Locator;
  readonly reportButton: Locator;

  // Culture Cards
  readonly cultureCards: Locator;
  readonly manageButtons: Locator;

  // Pagination
  readonly loadMoreButton: Locator;

  // States
  readonly loadingState: Locator;
  readonly emptyState: Locator;
  readonly endOfListMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Search & Filter
    this.searchInput = page.locator('input[name="search"]');
    this.sortButton = page.locator('button', { hasText: 'Ordenar por' });
    this.reportButton = page.locator('button', { hasText: 'Gerar relatório' });

    // Culture Cards
    this.cultureCards = page.locator('[class*="card"]');
    this.manageButtons = page.locator('button', { hasText: 'Gerenciar' });

    // Pagination
    this.loadMoreButton = page.locator('button', { hasText: 'Carregar mais' });

    // States
    this.loadingState = page.locator('text=Carregando culturas...');
    this.emptyState = page.locator('text=Nenhuma cultura encontrada.');
    this.endOfListMessage = page.locator('text=Você chegou ao fim da lista.');
  }

  async goto() {
    await super.goto('/cultures');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(600); // Debounce
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(600);
  }

  async openSortDropdown() {
    await this.sortButton.click();
  }

  async sortBy(field: string) {
    await this.openSortDropdown();
    await this.page.locator(`text=${field}`).click();
  }

  async generateReport() {
    await this.reportButton.click();
  }

  async loadMore() {
    await this.loadMoreButton.click();
  }

  async manageCulture(index: number = 0) {
    await this.manageButtons.nth(index).click();
  }

  async manageCultureByName(name: string) {
    const card = this.cultureCards.filter({ hasText: name }).first();
    await card.locator('button', { hasText: 'Gerenciar' }).click();
  }

  async getCultureCount(): Promise<number> {
    return this.cultureCards.count();
  }

  async waitForCulturesToLoad() {
    await this.loadingState.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async assertPageLoaded() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.sortButton).toBeVisible();
  }

  async assertHasCultures() {
    await expect(this.cultureCards.first()).toBeVisible();
  }

  async assertEmpty() {
    await expect(this.emptyState).toBeVisible();
  }

  async assertCultureVisible(name: string) {
    await expect(this.cultureCards.filter({ hasText: name }).first()).toBeVisible();
  }
}
