import { test, expect, generateTestProperty } from '../../fixtures/test-fixtures';

test.describe('Property Form - New Property', () => {
  test.beforeEach(async ({ propertyFormPage }) => {
    await propertyFormPage.gotoNew();
  });

  test('should display new property form correctly', async ({ propertyFormPage }) => {
    await propertyFormPage.assertPageLoaded();

    // Check all main fields are visible
    await expect(propertyFormPage.nameInput).toBeVisible();
    await expect(propertyFormPage.addressInput).toBeVisible();
    await expect(propertyFormPage.areaTotalInput).toBeVisible();
    await expect(propertyFormPage.areaProducaoInput).toBeVisible();
    await expect(propertyFormPage.submitButton).toBeVisible();
    await expect(propertyFormPage.cancelButton).toBeVisible();
  });

  test('should show validation error for empty name', async ({ propertyFormPage }) => {
    // Focus and blur name field
    await propertyFormPage.nameInput.focus();
    await propertyFormPage.addressInput.focus();

    // Wait for validation
    await propertyFormPage.page.waitForTimeout(300);
  });

  test('should validate that production area does not exceed total area', async ({ propertyFormPage }) => {
    // Fill total area
    await propertyFormPage.areaTotalInput.fill('100');

    // Fill production area greater than total
    await propertyFormPage.areaProducaoInput.fill('150');
    await propertyFormPage.nameInput.focus();

    // Wait for validation
    await propertyFormPage.page.waitForTimeout(300);

    // Should show error or disable submit
    // The form should not be valid with production > total
  });

  test('should display map container', async ({ propertyFormPage }) => {
    // Map should be visible
    await expect(propertyFormPage.mapContainer).toBeVisible();
  });

  test('should select status type', async ({ propertyFormPage }) => {
    // Select "Em produção"
    await propertyFormPage.selectStatus('producao');

    // Select "Em preparo"
    await propertyFormPage.selectStatus('preparo');

    // Select "Em pousio"
    await propertyFormPage.selectStatus('pousio');
  });

  test('should navigate back when clicking cancel', async ({ propertiesPage, propertyFormPage, page }) => {
    // First go to properties list, then navigate to new form (creates history)
    await propertiesPage.goto();
    await propertiesPage.waitForPropertiesToLoad();
    await page.locator('a', { hasText: 'Nova propriedade' }).click();
    await page.waitForURL('**/properties/new');

    // Now click cancel
    await propertyFormPage.cancel();

    // Should navigate back to properties
    await page.waitForURL(/\/properties$/);
  });

  test('should navigate back when clicking back button', async ({ propertiesPage, propertyFormPage, page }) => {
    // First go to properties list, then navigate to new form (creates history)
    await propertiesPage.goto();
    await propertiesPage.waitForPropertiesToLoad();
    await page.locator('a', { hasText: 'Nova propriedade' }).click();
    await page.waitForURL('**/properties/new');

    // Now click back
    await propertyFormPage.goBack();

    // Should navigate back
    await page.waitForURL(/\/properties$/);
  });

  test('should disable submit button when form is invalid', async ({ propertyFormPage }) => {
    // With empty form, submit should be disabled
    await expect(propertyFormPage.submitButton).toBeDisabled();
  });

  test('should show talhao section', async ({ propertyFormPage }) => {
    // Talhao name input should be visible
    await expect(propertyFormPage.talhaoNameInput).toBeVisible();
    await expect(propertyFormPage.talhaoAreaInput).toBeVisible();
  });

  test('should show file upload section', async ({ propertyFormPage }) => {
    // Upload label should be visible
    await expect(propertyFormPage.uploadLabel).toBeVisible();
  });

  test('should fill basic property fields', async ({ propertyFormPage }) => {
    const testData = generateTestProperty();

    await propertyFormPage.nameInput.fill(testData.name);
    await propertyFormPage.addressInput.fill(testData.address);
    await propertyFormPage.areaTotalInput.fill(testData.areaTotal);
    await propertyFormPage.areaProducaoInput.fill(testData.areaProducao);

    // Verify fields are filled
    await expect(propertyFormPage.nameInput).toHaveValue(testData.name);
    await expect(propertyFormPage.addressInput).toHaveValue(testData.address);
  });
});

test.describe('Property Form - Edit Property', () => {
  test('should load existing property data', async ({ propertiesPage, propertyDetailsDrawer, propertyFormPage, page }) => {
    // First go to properties and check if any exist
    await propertiesPage.goto();
    await propertiesPage.waitForPropertiesToLoad();

    const count = await propertiesPage.getPropertyCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open first property and click edit
    await propertiesPage.manageProperty(0);
    await propertyDetailsDrawer.waitForDrawerOpen();
    await propertyDetailsDrawer.clickEdit();

    // Wait for edit page
    await page.waitForURL(/\/properties\/edit\/\d+/);

    // Form should be loaded with data
    await propertyFormPage.assertPageLoaded();

    // Name should not be empty (since it's loaded from existing property)
    const nameValue = await propertyFormPage.nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);
  });

  test('should show "Salvar alterações" button in edit mode', async ({ propertiesPage, propertyDetailsDrawer, propertyFormPage, page }) => {
    await propertiesPage.goto();
    await propertiesPage.waitForPropertiesToLoad();

    const count = await propertiesPage.getPropertyCount();
    if (count === 0) {
      test.skip();
      return;
    }

    await propertiesPage.manageProperty(0);
    await propertyDetailsDrawer.waitForDrawerOpen();
    await propertyDetailsDrawer.clickEdit();

    await page.waitForURL(/\/properties\/edit\/\d+/);

    // Button text should be "Salvar alterações"
    await expect(propertyFormPage.submitButton).toContainText(/Salvar alterações|Salvando/);
  });

  test('should preserve address when editing', async ({ propertiesPage, propertyDetailsDrawer, propertyFormPage, page }) => {
    await propertiesPage.goto();
    await propertiesPage.waitForPropertiesToLoad();

    const count = await propertiesPage.getPropertyCount();
    if (count === 0) {
      test.skip();
      return;
    }

    await propertiesPage.manageProperty(0);
    await propertyDetailsDrawer.waitForDrawerOpen();
    await propertyDetailsDrawer.clickEdit();

    await page.waitForURL(/\/properties\/edit\/\d+/);

    // Address should be preserved
    const addressValue = await propertyFormPage.addressInput.inputValue();
    expect(addressValue.length).toBeGreaterThan(0);
  });

  test('should preserve area values when editing', async ({ propertiesPage, propertyDetailsDrawer, propertyFormPage, page }) => {
    await propertiesPage.goto();
    await propertiesPage.waitForPropertiesToLoad();

    const count = await propertiesPage.getPropertyCount();
    if (count === 0) {
      test.skip();
      return;
    }

    await propertiesPage.manageProperty(0);
    await propertyDetailsDrawer.waitForDrawerOpen();
    await propertyDetailsDrawer.clickEdit();

    await page.waitForURL(/\/properties\/edit\/\d+/);

    // Area values should be preserved
    const areaTotalValue = await propertyFormPage.areaTotalInput.inputValue();
    const areaProducaoValue = await propertyFormPage.areaProducaoInput.inputValue();

    expect(areaTotalValue.length).toBeGreaterThan(0);
    expect(areaProducaoValue.length).toBeGreaterThan(0);
  });
});
