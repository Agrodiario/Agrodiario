import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Culture Details Drawer.
 */
export class CultureDetailsDrawer extends BasePage {
  // Drawer container
  readonly drawer: Locator;
  readonly closeButton: Locator;
  readonly drawerTitle: Locator;

  // Culture data section
  readonly cultureName: Locator;
  readonly cultivar: Locator;
  readonly property: Locator;
  readonly plot: Locator;
  readonly plantingArea: Locator;
  readonly cycle: Locator;
  readonly status: Locator;

  // Planting info section
  readonly plantingDate: Locator;
  readonly harvestForecast: Locator;
  readonly daysElapsed: Locator;
  readonly daysRemaining: Locator;
  readonly origin: Locator;
  readonly supplier: Locator;

  // Observations
  readonly observations: Locator;

  // Activities
  readonly activitiesCount: Locator;

  // Footer buttons
  readonly deleteButton: Locator;
  readonly editButton: Locator;

  // Confirmation modal
  readonly confirmationModal: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;

  constructor(page: Page) {
    super(page);

    // Drawer container
    this.drawer = page.locator('[class*="drawer"], [role="dialog"]').first();
    this.closeButton = page.locator('[class*="closeButton"]').first();
    this.drawerTitle = page.locator('text=Visualizar cultura');

    // Culture data section (using label text as anchor)
    this.cultureName = page.locator('text=Nome da cultura').locator('..');
    this.cultivar = page.locator('text=Cultivar/Variedade').locator('..');
    this.property = page.locator('text=Propriedade').locator('..');
    this.plot = page.locator('text=Talhão').locator('..');
    this.plantingArea = page.locator('text=Área de plantio').locator('..');
    this.cycle = page.locator('text=Ciclo').locator('..');
    this.status = page.locator('text=Status').locator('..');

    // Planting info section
    this.plantingDate = page.locator('text=Data de plantio').locator('..');
    this.harvestForecast = page.locator('text=Previsão de colheita').locator('..');
    this.daysElapsed = page.locator('text=Dias decorridos').locator('..');
    this.daysRemaining = page.locator('text=Dias restantes').locator('..');
    this.origin = page.locator('text=Origem').locator('..');
    this.supplier = page.locator('text=Fornecedor').locator('..');

    // Observations
    this.observations = page.locator('[class*="observations"]');

    // Activities
    this.activitiesCount = page.locator('text=/\\d+ atividade/');

    // Footer buttons
    this.deleteButton = page.locator('button', { hasText: 'Excluir' });
    this.editButton = page.locator('button', { hasText: 'Editar' });

    // Confirmation modal
    this.confirmationModal = page.locator('text=Excluir cultura').locator('..').locator('..');
    this.confirmDeleteButton = page.locator('button', { hasText: 'Confirmar' });
    this.cancelDeleteButton = page.locator('[class*="modal"] button', { hasText: 'Cancelar' });
  }

  async waitForDrawerOpen() {
    await this.drawerTitle.waitFor({ state: 'visible', timeout: 5000 });
  }

  async close() {
    await this.closeButton.click();
    await this.drawer.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async clickEdit() {
    await this.editButton.click();
  }

  async clickDelete() {
    await this.deleteButton.click();
  }

  async confirmDelete() {
    await this.confirmDeleteButton.click();
  }

  async cancelDelete() {
    await this.cancelDeleteButton.click();
  }

  async assertDrawerOpen() {
    await expect(this.drawerTitle).toBeVisible();
  }

  async assertDrawerClosed() {
    await expect(this.drawer).not.toBeVisible();
  }

  async assertConfirmationModalVisible() {
    await expect(this.confirmationModal).toBeVisible();
  }

  async assertCultureDeleted() {
    await this.drawer.waitFor({ state: 'hidden', timeout: 5000 });
  }
}
