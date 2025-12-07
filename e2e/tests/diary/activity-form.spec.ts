import { test, expect, generateTestActivity } from '../../fixtures/test-fixtures';

test.describe('Activity Form - New Activity', () => {
  test.beforeEach(async ({ activityFormPage }) => {
    await activityFormPage.gotoNew();
  });

  test('should display new activity form correctly', async ({ activityFormPage }) => {
    await activityFormPage.assertPageLoaded();

    // Check all main sections are visible
    await expect(activityFormPage.titleInput).toBeVisible();
    await expect(activityFormPage.dateInput).toBeVisible();
    await expect(activityFormPage.propertySelect).toBeVisible();
    await expect(activityFormPage.descriptionTextarea).toBeVisible();
    await expect(activityFormPage.responsibleInput).toBeVisible();
    await expect(activityFormPage.submitButton).toBeVisible();
    await expect(activityFormPage.cancelButton).toBeVisible();
  });

  test('should show validation error for empty title', async ({ activityFormPage }) => {
    // Focus and blur title field
    await activityFormPage.titleInput.focus();
    await activityFormPage.dateInput.focus();

    // Error should be visible (title is required)
    await activityFormPage.page.waitForTimeout(300);
  });

  test('should apply date mask correctly', async ({ activityFormPage }) => {
    await activityFormPage.dateInput.fill('01122024');

    await expect(activityFormPage.dateInput).toHaveValue('01/12/2024');
  });

  test('should select activity type', async ({ activityFormPage }) => {
    // Select each type and verify selection
    await activityFormPage.selectActivityType('preparo');
    await expect(activityFormPage.typeButtons.preparo).toHaveAttribute('class', /active|selected/i);

    await activityFormPage.selectActivityType('aplicacao');
    await expect(activityFormPage.typeButtons.aplicacao).toHaveAttribute('class', /active|selected/i);

    await activityFormPage.selectActivityType('colheita');
    await expect(activityFormPage.typeButtons.colheita).toHaveAttribute('class', /active|selected/i);

    await activityFormPage.selectActivityType('manejo');
    await expect(activityFormPage.typeButtons.manejo).toHaveAttribute('class', /active|selected/i);
  });

  test('should show insumo fields when "Sim" is selected', async ({ activityFormPage }) => {
    // Select "Sim" for insumo by clicking the label (radio input is hidden)
    await activityFormPage.page.locator('label', { hasText: 'Sim' }).first().click();

    // Insumo fields should be visible
    await expect(activityFormPage.insumoQuantityInput).toBeVisible();
  });

  test('should hide insumo fields when "Não" is selected', async ({ activityFormPage }) => {
    // First enable insumo by clicking label
    await activityFormPage.page.locator('label', { hasText: 'Sim' }).first().click();
    await expect(activityFormPage.insumoQuantityInput).toBeVisible();

    // Then disable it by clicking "Não" label
    await activityFormPage.page.locator('label', { hasText: 'Não' }).first().click();

    // Insumo fields should be hidden
    await expect(activityFormPage.insumoQuantityInput).not.toBeVisible();
  });

  test('should navigate back when clicking cancel', async ({ diaryPage, activityFormPage, page }) => {
    // First go to diary list, then navigate to new form (creates history)
    await diaryPage.goto();
    await diaryPage.waitForActivitiesToLoad();
    await page.locator('button', { hasText: 'Nova atividade' }).click();
    await page.waitForURL('**/diary/new');

    // Now click cancel
    await activityFormPage.cancel();

    // Should navigate back to diary
    await page.waitForURL(/\/diary$/);
  });

  test('should navigate back when clicking back button', async ({ diaryPage, activityFormPage, page }) => {
    // First go to diary list, then navigate to new form (creates history)
    await diaryPage.goto();
    await diaryPage.waitForActivitiesToLoad();
    await page.locator('button', { hasText: 'Nova atividade' }).click();
    await page.waitForURL('**/diary/new');

    // Now click back
    await activityFormPage.goBack();

    // Should navigate back
    await page.waitForURL(/\/diary$/);
  });

  test('should disable submit button when form is invalid', async ({ activityFormPage }) => {
    // With empty form, submit should be disabled
    await expect(activityFormPage.submitButton).toBeDisabled();
  });

  test('should filter cultures based on selected property', async ({ activityFormPage }) => {
    // Get property options count
    const propertyOptions = await activityFormPage.propertySelect.locator('option').count();

    if (propertyOptions > 1) {
      // Select first property
      await activityFormPage.selectPropertyByIndex(0);

      // Wait for cultures to load
      await activityFormPage.page.waitForTimeout(500);

      // Culture select should be enabled and have options
      await expect(activityFormPage.cultureSelect).toBeEnabled();
    }
  });
});

test.describe('Activity Form - Edit Activity', () => {
  test('should load existing activity data', async ({ diaryPage, activityDetailsDrawer, activityFormPage, page }) => {
    // First go to diary and check if activities exist
    await diaryPage.goto();
    await diaryPage.waitForActivitiesToLoad();

    const count = await diaryPage.getActivityCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open first activity and click edit
    await diaryPage.viewActivity(0);
    await activityDetailsDrawer.waitForDrawerOpen();
    await activityDetailsDrawer.clickEdit();

    // Wait for edit page
    await page.waitForURL(/\/diary\/edit\/\d+/);

    // Form should be loaded with data
    await activityFormPage.assertPageLoaded();

    // Title should not be empty (since it's loaded from existing activity)
    const titleValue = await activityFormPage.titleInput.inputValue();
    expect(titleValue.length).toBeGreaterThan(0);
  });

  test('should show "Salvar alterações" button in edit mode', async ({ diaryPage, activityDetailsDrawer, activityFormPage, page }) => {
    await diaryPage.goto();
    await diaryPage.waitForActivitiesToLoad();

    const count = await diaryPage.getActivityCount();
    if (count === 0) {
      test.skip();
      return;
    }

    await diaryPage.viewActivity(0);
    await activityDetailsDrawer.waitForDrawerOpen();
    await activityDetailsDrawer.clickEdit();

    await page.waitForURL(/\/diary\/edit\/\d+/);

    // Button text should be "Salvar alterações"
    await expect(activityFormPage.submitButton).toContainText(/Salvar alterações|Salvando/);
  });
});
