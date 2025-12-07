import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type CultureOrigin = 'organic' | 'conventional' | 'transgenic';

export interface CultureFormData {
  propertyId?: string;
  cultureName: string;
  cultivar: string;
  cycle: string;
  origin: CultureOrigin;
  supplier: string;
  plantingDate: string;
  plantingArea?: string;
  plotName?: string;
  observations?: string;
}

/**
 * Page Object Model for the Culture Form (New/Edit).
 */
export class CultureFormPage extends BasePage {
  // Section 1: Culture Data
  readonly propertySelect: Locator;
  readonly cultureNameInput: Locator;
  readonly cultivarInput: Locator;
  readonly cycleInput: Locator;

  // Section 2: Origin
  readonly originRadios: Record<CultureOrigin, Locator>;
  readonly supplierInput: Locator;

  // Section 3: Planting
  readonly plantingDateInput: Locator;
  readonly areaHectaresRadio: Locator;
  readonly areaPlotRadio: Locator;
  readonly plantingAreaInput: Locator;
  readonly plotNameSelect: Locator;
  readonly observationsTextarea: Locator;

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

    // Section 1: Culture Data
    this.propertySelect = page.locator('select[name="propertyId"]').or(page.locator('[class*="select"]').first());
    this.cultureNameInput = page.locator('[class*="select"]').nth(1).or(page.locator('input[name="cultureName"]'));
    this.cultivarInput = page.locator('input[name="cultivar"]');
    this.cycleInput = page.locator('input[name="cycle"]');

    // Section 2: Origin
    this.originRadios = {
      organic: page.locator('input[name="origin"][value="organic"]'),
      conventional: page.locator('input[name="origin"][value="conventional"]'),
      transgenic: page.locator('input[name="origin"][value="transgenic"]'),
    };
    this.supplierInput = page.locator('input[name="supplier"]');

    // Section 3: Planting
    this.plantingDateInput = page.locator('input[name="plantingDate"]');
    this.areaHectaresRadio = page.locator('text=Hectares').locator('..');
    this.areaPlotRadio = page.locator('text=Talhão').locator('..');
    this.plantingAreaInput = page.locator('input[name="plantingArea"]');
    this.plotNameSelect = page.locator('select[name="plotName"]');
    this.observationsTextarea = page.locator('textarea[name="observations"]');

    // Footer
    this.cancelButton = page.locator('button', { hasText: 'Cancelar' });
    this.submitButton = page.locator('button[type="submit"]');

    // Navigation
    this.backButton = page.locator('[class*="backButton"]');
    this.pageTitle = page.locator('span', { hasText: /Nova cultura|Editar cultura/ });

    // Error
    this.errorAlert = page.locator('[style*="backgroundColor: #fee"]');
  }

  async gotoNew() {
    await super.goto('/cultures/new');
  }

  async gotoEdit(id: string) {
    await super.goto(`/cultures/edit/${id}`);
  }

  async selectProperty(propertyName: string) {
    // Handle the select or async select component
    const select = this.page.locator('select[name="propertyId"]');
    if (await select.isVisible()) {
      await select.selectOption({ label: propertyName });
    } else {
      // Handle AsyncSelect component
      await this.propertySelect.click();
      await this.page.locator(`text=${propertyName}`).click();
    }
    await this.page.waitForTimeout(500);
  }

  async selectPropertyByIndex(index: number) {
    const select = this.page.locator('select[name="propertyId"]');
    if (await select.isVisible()) {
      await select.selectOption({ index: index + 1 });
    }
    await this.page.waitForTimeout(500);
  }

  async fillCultureName(name: string) {
    // Handle AsyncCreatableSelect for culture name
    const cultureInput = this.page.locator('input').filter({ hasNot: this.page.locator('[name]') }).first();
    await cultureInput.fill(name);
    await this.page.waitForTimeout(600);
    await this.page.keyboard.press('Enter');
  }

  async selectOrigin(origin: CultureOrigin) {
    await this.originRadios[origin].click();
  }

  async fillForm(data: CultureFormData) {
    if (data.propertyId) {
      await this.selectProperty(data.propertyId);
    }

    await this.fillCultureName(data.cultureName);
    await this.cultivarInput.fill(data.cultivar);
    await this.cycleInput.fill(data.cycle);
    await this.selectOrigin(data.origin);
    await this.supplierInput.fill(data.supplier);
    await this.plantingDateInput.fill(data.plantingDate);

    if (data.plotName) {
      await this.areaPlotRadio.click();
      await this.plotNameSelect.selectOption({ label: data.plotName });
    } else if (data.plantingArea) {
      await this.plantingAreaInput.fill(data.plantingArea);
    }

    if (data.observations) {
      await this.observationsTextarea.fill(data.observations);
    }
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
    await expect(this.cultivarInput).toBeVisible();
    await expect(this.cycleInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async assertValidationError(errorText: string) {
    await expect(this.page.locator(`text=${errorText}`)).toBeVisible();
  }

  async assertFormSubmitted() {
    await this.page.waitForURL('**/cultures', { timeout: 10000 });
  }
}
