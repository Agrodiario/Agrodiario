import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Properties list page.
 */
export class PropertiesPage extends BasePage {
  // Search & Filter
  readonly searchInput: Locator;
  readonly sortButton: Locator;
  readonly sortMoreRecent: Locator;
  readonly sortOlder: Locator;
  readonly reportButton: Locator;

  // Property Cards
  readonly propertyCards: Locator;
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
    this.sortMoreRecent = page.locator('text=Mais recentes');
    this.sortOlder = page.locator('text=Mais antigas');
    this.reportButton = page.locator('button', { hasText: 'Gerar relatório' });

    // Property Cards
    this.propertyCards = page.locator('[class*="card"]');
    this.manageButtons = page.locator('button', { hasText: 'Gerenciar' });

    // Pagination
    this.loadMoreButton = page.locator('button', { hasText: 'Carregar mais' });

    // States
    this.loadingState = page.locator('text=Carregando propriedades...');
    this.emptyState = page.locator('text=Nenhuma propriedade encontrada.');
    this.endOfListMessage = page.locator('text=Você chegou ao fim da lista.');
  }

  async goto() {
    await super.goto('/properties');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(600); // Debounce
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(600);
  }

  async sortByNewest() {
    await this.sortButton.click();
    await this.sortMoreRecent.click();
  }

  async sortByOldest() {
    await this.sortButton.click();
    await this.sortOlder.click();
  }

  async generateReport() {
    await this.reportButton.click();
  }

  async loadMore() {
    await this.loadMoreButton.click();
  }

  async manageProperty(index: number = 0) {
    await this.manageButtons.nth(index).click();
  }

  async managePropertyByName(name: string) {
    const card = this.propertyCards.filter({ hasText: name }).first();
    await card.locator('button', { hasText: 'Gerenciar' }).click();
  }

  async getPropertyCount(): Promise<number> {
    return this.propertyCards.count();
  }

  async waitForPropertiesToLoad() {
    await this.loadingState.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async assertPageLoaded() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.sortButton).toBeVisible();
  }

  async assertHasProperties() {
    await expect(this.propertyCards.first()).toBeVisible();
  }

  async assertEmpty() {
    await expect(this.emptyState).toBeVisible();
  }

  async assertPropertyVisible(name: string) {
    await expect(this.propertyCards.filter({ hasText: name }).first()).toBeVisible();
  }
}
