import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type ActivityType = 'preparo' | 'aplicacao' | 'colheita' | 'manejo';

export interface ActivityFormData {
  titulo: string;
  date: string;
  propriedade?: string;
  cultureId?: string;
  tipo: ActivityType;
  operacao?: string;
  descricao: string;
  responsavel: string;
  hasInsumo?: boolean;
  insumoNome?: string;
  insumoQuantidade?: string;
  insumoUnidade?: string;
}

/**
 * Page Object Model for the Activity Form (New/Edit).
 */
export class ActivityFormPage extends BasePage {
  // Section 1: Activity Details
  readonly titleInput: Locator;
  readonly dateInput: Locator;
  readonly propertySelect: Locator;
  readonly cultureSelect: Locator;

  // Section 2: Activity Type
  readonly typeButtons: Record<ActivityType, Locator>;
  readonly operationInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly responsibleInput: Locator;

  // Section 3: Insumo
  readonly insumoYesRadio: Locator;
  readonly insumoNoRadio: Locator;
  readonly insumoNameInput: Locator;
  readonly insumoQuantityInput: Locator;
  readonly insumoUnitSelect: Locator;

  // Section 4: Attachments
  readonly fileInput: Locator;
  readonly uploadButton: Locator;

  // Footer
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  // Navigation
  readonly backButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Section 1: Activity Details
    this.titleInput = page.locator('input[name="titulo"]');
    this.dateInput = page.locator('input[name="date"]');
    this.propertySelect = page.locator('select[name="propriedade"]');
    this.cultureSelect = page.locator('select[name="cultureId"]');

    // Section 2: Activity Type
    this.typeButtons = {
      preparo: page.locator('button', { hasText: 'Preparo' }).first(),
      aplicacao: page.locator('button', { hasText: 'Aplicação' }).first(),
      colheita: page.locator('button', { hasText: 'Colheita' }).first(),
      manejo: page.locator('button', { hasText: 'Manejo de solo' }).first(),
    };
    this.operationInput = page.locator('input[name="operacao"]');
    this.descriptionTextarea = page.locator('textarea[name="descricao"]');
    this.responsibleInput = page.locator('input[name="responsavel"]');

    // Section 3: Insumo
    this.insumoYesRadio = page.locator('input[name="insumo_opt"][value="sim"]');
    this.insumoNoRadio = page.locator('input[name="insumo_opt"][value="nao"]');
    this.insumoNameInput = page.locator('input[name="insumoNome"]');
    this.insumoQuantityInput = page.locator('input[name="insumoQuantidade"]');
    this.insumoUnitSelect = page.locator('select[name="insumoUnidade"]');

    // Section 4: Attachments
    this.fileInput = page.locator('input[type="file"]');
    this.uploadButton = page.locator('button', { hasText: 'Fazer upload' });

    // Footer
    this.cancelButton = page.locator('button', { hasText: 'Cancelar' });
    this.submitButton = page.locator('button[type="submit"]');

    // Navigation
    this.backButton = page.locator('[class*="backButton"]');
    this.pageTitle = page.locator('h1, h2').first();
  }

  async gotoNew() {
    await super.goto('/diary/new');
  }

  async gotoEdit(id: string) {
    await super.goto(`/diary/edit/${id}`);
  }

  async selectActivityType(type: ActivityType) {
    await this.typeButtons[type].click();
  }

  async selectProperty(propertyName: string) {
    await this.propertySelect.selectOption({ label: propertyName });
  }

  async selectPropertyByIndex(index: number) {
    const options = await this.propertySelect.locator('option').allTextContents();
    if (options.length > index + 1) {
      await this.propertySelect.selectOption({ index: index + 1 }); // +1 to skip placeholder
    }
  }

  async selectCulture(cultureName: string) {
    await this.cultureSelect.selectOption({ label: cultureName });
  }

  async selectCultureByIndex(index: number) {
    const options = await this.cultureSelect.locator('option').allTextContents();
    if (options.length > index + 1) {
      await this.cultureSelect.selectOption({ index: index + 1 });
    }
  }

  async setInsumoOption(hasInsumo: boolean) {
    if (hasInsumo) {
      await this.insumoYesRadio.click();
    } else {
      await this.insumoNoRadio.click();
    }
  }

  async fillForm(data: ActivityFormData) {
    await this.titleInput.fill(data.titulo);
    await this.dateInput.fill(data.date);

    if (data.propriedade) {
      await this.selectProperty(data.propriedade);
      await this.page.waitForTimeout(500); // Wait for cultures to load
    }

    if (data.cultureId) {
      await this.selectCulture(data.cultureId);
    }

    await this.selectActivityType(data.tipo);

    if (data.operacao) {
      await this.operationInput.fill(data.operacao);
    }

    await this.descriptionTextarea.fill(data.descricao);
    await this.responsibleInput.fill(data.responsavel);

    if (data.hasInsumo !== undefined) {
      await this.setInsumoOption(data.hasInsumo);

      if (data.hasInsumo && data.insumoNome) {
        await this.insumoNameInput.fill(data.insumoNome);
        if (data.insumoQuantidade) {
          await this.insumoQuantityInput.fill(data.insumoQuantidade);
        }
        if (data.insumoUnidade) {
          await this.insumoUnitSelect.selectOption(data.insumoUnidade);
        }
      }
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
    await expect(this.titleInput).toBeVisible();
    await expect(this.dateInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async assertValidationError(errorText: string) {
    await expect(this.page.locator(`text=${errorText}`)).toBeVisible();
  }

  async assertFormSubmitted() {
    await this.page.waitForURL('**/diary', { timeout: 10000 });
  }
}
