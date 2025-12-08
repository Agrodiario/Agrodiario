import { test, expect, generateTestUser } from '../../fixtures/test-fixtures';

test.describe('Register Page', () => {
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.goto();
  });

  test('should display register page correctly', async ({ registerPage }) => {
    await registerPage.assertPageLoaded();

    // Check that all form fields are visible
    await expect(registerPage.nameInput).toBeVisible();
    await expect(registerPage.cpfInput).toBeVisible();
    await expect(registerPage.birthDateInput).toBeVisible();
    await expect(registerPage.phoneInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
    await expect(registerPage.loginLink).toBeVisible();
  });

  test('should navigate to login page when clicking login link', async ({ registerPage }) => {
    await registerPage.goToLogin();

    await registerPage.page.waitForURL('**/login');
    await expect(registerPage.page).toHaveURL(/\/login$/);
  });

  test('should show validation error for empty name', async ({ registerPage }) => {
    await registerPage.nameInput.focus();
    await registerPage.cpfInput.focus();

    await expect(registerPage.page.locator('text=Nome é obrigatório')).toBeVisible();
  });

  test('should show validation error for short name', async ({ registerPage }) => {
    await registerPage.nameInput.fill('Ab');
    await registerPage.cpfInput.focus();

    await expect(registerPage.page.locator('text=Nome deve ter pelo menos 3 caracteres')).toBeVisible();
  });

  test('should show validation error for empty CPF', async ({ registerPage }) => {
    await registerPage.cpfInput.focus();
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=CPF é obrigatório')).toBeVisible();
  });

  test('should show validation error for incomplete CPF', async ({ registerPage }) => {
    await registerPage.cpfInput.fill('123.456');
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=CPF incompleto')).toBeVisible();
  });

  test('should show validation error for invalid CPF', async ({ registerPage }) => {
    await registerPage.cpfInput.fill('111.111.111-11');
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=CPF inválido')).toBeVisible();
  });

  test('should apply CPF mask correctly', async ({ registerPage }) => {
    await registerPage.cpfInput.fill('52998224725');

    await expect(registerPage.cpfInput).toHaveValue('529.982.247-25');
  });

  test('should show validation error for empty birth date', async ({ registerPage }) => {
    await registerPage.birthDateInput.focus();
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=Data de nascimento é obrigatória')).toBeVisible();
  });

  test('should show validation error for under 18', async ({ registerPage }) => {
    // Set birth date to make user under 18
    const currentYear = new Date().getFullYear();
    const underageDate = `01/01/${currentYear - 10}`;
    await registerPage.birthDateInput.fill(underageDate);
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=Você deve ter pelo menos 18 anos')).toBeVisible();
  });

  test('should apply date mask correctly', async ({ registerPage }) => {
    await registerPage.birthDateInput.fill('01011990');

    await expect(registerPage.birthDateInput).toHaveValue('01/01/1990');
  });

  test('should show validation error for empty phone', async ({ registerPage }) => {
    await registerPage.phoneInput.focus();
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=Telefone é obrigatório')).toBeVisible();
  });

  test('should apply phone mask correctly', async ({ registerPage }) => {
    await registerPage.phoneInput.fill('11999999999');

    await expect(registerPage.phoneInput).toHaveValue('(11) 99999-9999');
  });

  test('should show validation error for empty email', async ({ registerPage }) => {
    await registerPage.emailInput.focus();
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=E-mail é obrigatório')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ registerPage }) => {
    await registerPage.emailInput.fill('invalid-email');
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=E-mail inválido')).toBeVisible();
  });

  test('should show validation error for empty password', async ({ registerPage }) => {
    await registerPage.passwordInput.focus();
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=Senha é obrigatória')).toBeVisible();
  });

  test('should show validation error for short password', async ({ registerPage }) => {
    await registerPage.passwordInput.fill('1234567');
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=Senha deve ter pelo menos 8 caracteres')).toBeVisible();
  });

  test('should show validation error for password mismatch', async ({ registerPage }) => {
    await registerPage.passwordInput.fill('TestPassword123');
    await registerPage.confirmPasswordInput.fill('DifferentPassword');
    await registerPage.nameInput.focus();

    await expect(registerPage.page.locator('text=As senhas não conferem')).toBeVisible();
  });

  test('should disable submit button when form is incomplete', async ({ registerPage }) => {
    // Scroll to submit button to make it visible
    await registerPage.submitButton.scrollIntoViewIfNeeded();

    // With empty form, button should be disabled
    await expect(registerPage.submitButton).toBeDisabled();

    // Fill only some fields
    await registerPage.nameInput.fill('Test User');
    await registerPage.emailInput.fill('test@example.com');

    // Scroll again after filling (page may have shifted)
    await registerPage.submitButton.scrollIntoViewIfNeeded();

    // Button should still be disabled
    await expect(registerPage.submitButton).toBeDisabled();
  });

  test('should enable submit button when form is complete and valid', async ({ registerPage }) => {
    const testUser = generateTestUser();

    await registerPage.fillForm(testUser);

    // Scroll to submit button to make it visible
    await registerPage.submitButton.scrollIntoViewIfNeeded();

    // Give time for validation
    await registerPage.page.waitForTimeout(500);

    await expect(registerPage.submitButton).toBeEnabled();
  });
});
