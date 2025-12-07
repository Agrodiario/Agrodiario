import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Diary (Activities) list page.
 */
export class DiaryPage extends BasePage {
  // Search & Filter
  readonly searchInput: Locator;
  readonly sortButton: Locator;
  readonly sortMoreRecent: Locator;
  readonly sortOlder: Locator;
  readonly reportButton: Locator;

  // Activity Cards
  readonly activityCards: Locator;
  readonly viewActivityButtons: Locator;

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

    // Activity Cards
    this.activityCards = page.locator('[class*="card"]');
    this.viewActivityButtons = page.locator('button', { hasText: 'Visualizar' });

    // Pagination
    this.loadMoreButton = page.locator('button', { hasText: 'Carregar mais' });

    // States
    this.loadingState = page.locator('text=Carregando atividades...');
    this.emptyState = page.locator('text=Nenhuma atividade encontrada.');
    this.endOfListMessage = page.locator('text=Você chegou ao fim da lista.');
  }

  async goto() {
    await super.goto('/diary');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    // Wait for debounce (500ms) + response
    await this.page.waitForTimeout(600);
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

  async viewActivity(index: number = 0) {
    await this.viewActivityButtons.nth(index).click();
  }

  async getActivityCount(): Promise<number> {
    return this.activityCards.count();
  }

  async waitForActivitiesToLoad() {
    await this.loadingState.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async assertPageLoaded() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.sortButton).toBeVisible();
  }

  async assertHasActivities() {
    await expect(this.activityCards.first()).toBeVisible();
  }

  async assertEmpty() {
    await expect(this.emptyState).toBeVisible();
  }
}
