import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Activity Details Drawer.
 */
export class ActivityDetailsDrawer extends BasePage {
  // Drawer container
  readonly drawer: Locator;
  readonly closeButton: Locator;

  // Details sections
  readonly activityDate: Locator;
  readonly propertyInfo: Locator;
  readonly activityType: Locator;
  readonly description: Locator;
  readonly responsible: Locator;

  // Insumo section
  readonly insumoSection: Locator;
  readonly productName: Locator;
  readonly productQuantity: Locator;

  // Attachments section
  readonly attachmentsSection: Locator;
  readonly noAttachmentsMessage: Locator;

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
    this.closeButton = page.locator('[class*="closeButton"], button:has(svg)').first();

    // Details sections
    this.activityDate = page.locator('text=Data da atividade').locator('..');
    this.propertyInfo = page.locator('text=Propriedade associada').locator('..');
    this.activityType = page.locator('text=Tipo de atividade').locator('..');
    this.description = page.locator('text=Descrição').locator('..');
    this.responsible = page.locator('text=Responsável').locator('..');

    // Insumo section
    this.insumoSection = page.locator('text=Insumos Utilizados').locator('..');
    this.productName = page.locator('text=Produto').locator('..');
    this.productQuantity = page.locator('text=Quantidade').locator('..');

    // Attachments section
    this.attachmentsSection = page.locator('text=Anexos').locator('..');
    this.noAttachmentsMessage = page.locator('text=Nenhum anexo.');

    // Footer buttons
    this.deleteButton = page.locator('button', { hasText: 'Excluir' });
    this.editButton = page.locator('button', { hasText: 'Editar' });

    // Confirmation modal
    this.confirmationModal = page.locator('text=Excluir atividade').locator('..').locator('..');
    this.confirmDeleteButton = page.locator('button', { hasText: 'Confirmar' });
    this.cancelDeleteButton = page.locator('[class*="modal"] button', { hasText: 'Cancelar' });
  }

  async waitForDrawerOpen() {
    await this.drawer.waitFor({ state: 'visible', timeout: 5000 });
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
    await expect(this.drawer).toBeVisible();
  }

  async assertDrawerClosed() {
    await expect(this.drawer).not.toBeVisible();
  }

  async assertConfirmationModalVisible() {
    await expect(this.confirmationModal).toBeVisible();
  }

  async assertActivityDeleted() {
    await this.drawer.waitFor({ state: 'hidden', timeout: 5000 });
  }
}
