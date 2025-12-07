import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Property Details Drawer.
 */
export class PropertyDetailsDrawer extends BasePage {
  // Drawer container
  readonly drawer: Locator;
  readonly closeButton: Locator;
  readonly drawerTitle: Locator;

  // Property data section
  readonly propertyName: Locator;
  readonly address: Locator;
  readonly areaTotal: Locator;
  readonly areaCultivada: Locator;
  readonly cultivoPrincipal: Locator;
  readonly viewMapButton: Locator;

  // Talhoes section
  readonly talhoesSection: Locator;
  readonly talhaoCards: Locator;
  readonly noTalhoesMessage: Locator;
  readonly addTalhaoButton: Locator;

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
    this.drawerTitle = page.locator('text=Visualizar propriedade');

    // Property data section
    this.propertyName = page.locator('text=Nome da propriedade').locator('..');
    this.address = page.locator('text=Endereço').locator('..');
    this.areaTotal = page.locator('text=Área total').locator('..');
    this.areaCultivada = page.locator('text=Área cultivada').locator('..');
    this.cultivoPrincipal = page.locator('text=Tipo de cultivo principal').locator('..');
    this.viewMapButton = page.locator('button', { hasText: 'Ver mapa' });

    // Talhoes section
    this.talhoesSection = page.locator('text=Talhões').locator('..');
    this.talhaoCards = page.locator('[class*="talhaoCard"]');
    this.noTalhoesMessage = page.locator('text=Nenhum talhão cadastrado');
    this.addTalhaoButton = page.locator('button', { hasText: 'Adicionar novo talhão' });

    // Footer buttons
    this.deleteButton = page.locator('button', { hasText: 'Excluir' });
    this.editButton = page.locator('button', { hasText: 'Editar' });

    // Confirmation modal
    this.confirmationModal = page.locator('text=Excluir propriedade').locator('..').locator('..');
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

  async clickViewMap() {
    await this.viewMapButton.click();
  }

  async clickAddTalhao() {
    await this.addTalhaoButton.click();
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

  async assertPropertyDeleted() {
    await this.drawer.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async assertHasTalhoes() {
    await expect(this.talhaoCards.first()).toBeVisible();
  }

  async assertNoTalhoes() {
    await expect(this.noTalhoesMessage).toBeVisible();
  }
}
