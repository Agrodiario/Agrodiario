import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type PropertyStatus = 'producao' | 'preparo' | 'pousio';

export interface PropertyFormData {
  name: string;
  address: string;
  areaTotal: string;
  areaProducao: string;
  cultivo?: string;
  talhaoName?: string;
  talhaoArea?: string;
  situacao?: PropertyStatus;
}

/**
 * Page Object Model for the Property Form (New/Edit).
 */
export class PropertyFormPage extends BasePage {
  // Section 1: Property Data
  readonly nameInput: Locator;
  readonly addressInput: Locator;
  readonly areaTotalInput: Locator;
  readonly areaProducaoInput: Locator;
  readonly cultivoSelect: Locator;

  // Section 2: Certifications (File Upload)
  readonly fileInput: Locator;
  readonly uploadLabel: Locator;

  // Section 3: Map
  readonly mapContainer: Locator;

  // Section 4: Talhao (Plot)
  readonly talhaoNameInput: Locator;
  readonly talhaoAreaInput: Locator;

  // Section 5: Status
  readonly statusButtons: Record<PropertyStatus, Locator>;

  // Section 6: Talhao Map (Polygon)
  readonly talhaoMapContainer: Locator;

  // Footer
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  // Navigation
  readonly backButton: Locator;
  readonly pageTitle: Locator;

  // Error
  readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);

    // Section 1: Property Data
    this.nameInput = page.locator('input[name="name"]');
    this.addressInput = page.locator('input[name="address"]');
    this.areaTotalInput = page.locator('input[name="areaTotal"]');
    this.areaProducaoInput = page.locator('input[name="areaProducao"]');
    this.cultivoSelect = page.locator('[class*="select"]').first();

    // Section 2: Certifications
    this.fileInput = page.locator('input[type="file"]');
    this.uploadLabel = page.locator('text=Fazer upload de foto ou documento');

    // Section 3: Map
    this.mapContainer = page.locator('.leaflet-container').first();

    // Section 4: Talhao
    this.talhaoNameInput = page.locator('input[name="talhaoName"]');
    this.talhaoAreaInput = page.locator('input[name="talhaoArea"]');

    // Section 5: Status
    this.statusButtons = {
      producao: page.locator('button', { hasText: 'Em produção' }),
      preparo: page.locator('button', { hasText: 'Em preparo' }),
      pousio: page.locator('button', { hasText: 'Em pousio' }),
    };

    // Section 6: Talhao Map
    this.talhaoMapContainer = page.locator('.leaflet-container').nth(1);

    // Footer
    this.cancelButton = page.locator('button', { hasText: 'Cancelar' });
    this.submitButton = page.locator('button[type="submit"]');

    // Navigation
    this.backButton = page.locator('[class*="backButton"]');
    this.pageTitle = page.locator('span', { hasText: /Nova propriedade|Editar propriedade/ });

    // Error
    this.errorAlert = page.locator('[style*="backgroundColor: #fee"]');
  }

  async gotoNew() {
    await super.goto('/properties/new');
  }

  async gotoEdit(id: string) {
    await super.goto(`/properties/edit/${id}`);
  }

  async selectCultivo(cultivoName: string) {
    await this.cultivoSelect.click();
    await this.page.locator(`text=${cultivoName}`).click();
  }

  async selectStatus(status: PropertyStatus) {
    await this.statusButtons[status].click();
  }

  async clickOnMap() {
    // Click on center of map to place marker
    const box = await this.mapContainer.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
  }

  async fillForm(data: PropertyFormData) {
    await this.nameInput.fill(data.name);
    await this.addressInput.fill(data.address);
    await this.areaTotalInput.fill(data.areaTotal);
    await this.areaProducaoInput.fill(data.areaProducao);

    if (data.cultivo) {
      await this.selectCultivo(data.cultivo);
    }

    if (data.talhaoName) {
      await this.talhaoNameInput.fill(data.talhaoName);
    }

    if (data.talhaoArea) {
      await this.talhaoAreaInput.fill(data.talhaoArea);
    }

    if (data.situacao) {
      await this.selectStatus(data.situacao);
    }
  }

  async fillRequiredFields(data: Pick<PropertyFormData, 'name' | 'address' | 'areaTotal' | 'areaProducao'>) {
    await this.nameInput.fill(data.name);
    await this.addressInput.fill(data.address);
    await this.areaTotalInput.fill(data.areaTotal);
    await this.areaProducaoInput.fill(data.areaProducao);
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async assertPageLoaded() {
    await expect(this.nameInput).toBeVisible();
    await expect(this.addressInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async assertValidationError(errorText: string) {
    await expect(this.page.locator(`text=${errorText}`)).toBeVisible();
  }

  async assertFormSubmitted() {
    await this.page.waitForURL('**/properties', { timeout: 10000 });
  }
}
