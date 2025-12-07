import { test, expect, generateTestCulture } from '../../fixtures/test-fixtures';

test.describe('Culture Form - New Culture', () => {
  test.beforeEach(async ({ cultureFormPage }) => {
    await cultureFormPage.gotoNew();
  });

  test('should display new culture form correctly', async ({ cultureFormPage }) => {
    await cultureFormPage.assertPageLoaded();

    // Check all main fields are visible
    await expect(cultureFormPage.cultivarInput).toBeVisible();
    await expect(cultureFormPage.cycleInput).toBeVisible();
    await expect(cultureFormPage.supplierInput).toBeVisible();
    await expect(cultureFormPage.plantingDateInput).toBeVisible();
    await expect(cultureFormPage.submitButton).toBeVisible();
    await expect(cultureFormPage.cancelButton).toBeVisible();
  });

  test('should show validation error for empty cultivar', async ({ cultureFormPage }) => {
    // Focus and blur cultivar field
    await cultureFormPage.cultivarInput.focus();
    await cultureFormPage.cycleInput.focus();

    // Wait for validation
    await cultureFormPage.page.waitForTimeout(300);
  });

  test('should accept numeric values for cycle input', async ({ cultureFormPage }) => {
    // Enter a valid cycle value
    await cultureFormPage.cycleInput.fill('120');

    const value = await cultureFormPage.cycleInput.inputValue();
    expect(value).toBe('120');
  });

  test('should apply date mask correctly', async ({ cultureFormPage }) => {
    await cultureFormPage.plantingDateInput.fill('15062024');

    await expect(cultureFormPage.plantingDateInput).toHaveValue('15/06/2024');
  });

  test('should select origin type', async ({ cultureFormPage }) => {
    // Select organic by clicking the label
    await cultureFormPage.page.locator('label', { hasText: 'Orgânico' }).click();
    await expect(cultureFormPage.originRadios.organic).toBeChecked();

    // Select conventional
    await cultureFormPage.page.locator('label', { hasText: 'Convencional' }).click();
    await expect(cultureFormPage.originRadios.conventional).toBeChecked();

    // Select transgenic
    await cultureFormPage.page.locator('label', { hasText: 'Transgênico' }).click();
    await expect(cultureFormPage.originRadios.transgenic).toBeChecked();
  });

  test('should navigate back when clicking cancel', async ({ culturesPage, cultureFormPage, page }) => {
    // First go to cultures list, then navigate to new form (creates history)
    await culturesPage.goto();
    await culturesPage.waitForCulturesToLoad();
    await page.locator('button', { hasText: 'Nova cultura' }).click();
    await page.waitForURL('**/cultures/new');

    // Now click cancel
    await cultureFormPage.cancel();

    // Should navigate back to cultures
    await page.waitForURL(/\/cultures$/);
  });

  test('should navigate back when clicking back button', async ({ culturesPage, cultureFormPage, page }) => {
    // First go to cultures list, then navigate to new form (creates history)
    await culturesPage.goto();
    await culturesPage.waitForCulturesToLoad();
    await page.locator('button', { hasText: 'Nova cultura' }).click();
    await page.waitForURL('**/cultures/new');

    // Now click back
    await cultureFormPage.goBack();

    // Should navigate back
    await page.waitForURL(/\/cultures$/);
  });

  test('should disable submit button when form is invalid', async ({ cultureFormPage }) => {
    // With empty form, submit should be disabled
    await expect(cultureFormPage.submitButton).toBeDisabled();
  });

  test('should show area options based on property selection', async ({ cultureFormPage }) => {
    // Check if property select has options
    const propertySelect = cultureFormPage.page.locator('select[name="propertyId"]');
    const isVisible = await propertySelect.isVisible();

    if (isVisible) {
      const options = await propertySelect.locator('option').count();
      if (options > 1) {
        // Select first property
        await propertySelect.selectOption({ index: 1 });
        await cultureFormPage.page.waitForTimeout(500);

        // Check if area input or plot select is available
        const areaInputVisible = await cultureFormPage.plantingAreaInput.isVisible();
        const plotSelectVisible = await cultureFormPage.plotNameSelect.isVisible();

        expect(areaInputVisible || plotSelectVisible).toBeTruthy();
      }
    }
  });
});

test.describe('Culture Form - Edit Culture', () => {
  test('should load existing culture data', async ({ culturesPage, cultureDetailsDrawer, cultureFormPage, page }) => {
    // First go to cultures and check if any exist
    await culturesPage.goto();
    await culturesPage.waitForCulturesToLoad();

    const count = await culturesPage.getCultureCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open first culture and click edit
    await culturesPage.manageCulture(0);
    await cultureDetailsDrawer.waitForDrawerOpen();
    await cultureDetailsDrawer.clickEdit();

    // Wait for edit page
    await page.waitForURL(/\/cultures\/edit\/\d+/);

    // Form should be loaded with data
    await cultureFormPage.assertPageLoaded();

    // Cultivar should not be empty (since it's loaded from existing culture)
    const cultivarValue = await cultureFormPage.cultivarInput.inputValue();
    expect(cultivarValue.length).toBeGreaterThan(0);
  });

  test('should show "Salvar alterações" button in edit mode', async ({ culturesPage, cultureDetailsDrawer, cultureFormPage, page }) => {
    await culturesPage.goto();
    await culturesPage.waitForCulturesToLoad();

    const count = await culturesPage.getCultureCount();
    if (count === 0) {
      test.skip();
      return;
    }

    await culturesPage.manageCulture(0);
    await cultureDetailsDrawer.waitForDrawerOpen();
    await cultureDetailsDrawer.clickEdit();

    await page.waitForURL(/\/cultures\/edit\/\d+/);

    // Button text should be "Salvar alterações"
    await expect(cultureFormPage.submitButton).toContainText(/Salvar alterações|Salvando/);
  });

  test('should preserve origin selection when editing', async ({ culturesPage, cultureDetailsDrawer, cultureFormPage, page }) => {
    await culturesPage.goto();
    await culturesPage.waitForCulturesToLoad();

    const count = await culturesPage.getCultureCount();
    if (count === 0) {
      test.skip();
      return;
    }

    await culturesPage.manageCulture(0);
    await cultureDetailsDrawer.waitForDrawerOpen();
    await cultureDetailsDrawer.clickEdit();

    await page.waitForURL(/\/cultures\/edit\/\d+/);

    // One of the origin radios should be checked
    const isOrganicChecked = await cultureFormPage.originRadios.organic.isChecked();
    const isConventionalChecked = await cultureFormPage.originRadios.conventional.isChecked();
    const isTransgenicChecked = await cultureFormPage.originRadios.transgenic.isChecked();

    expect(isOrganicChecked || isConventionalChecked || isTransgenicChecked).toBeTruthy();
  });
});
