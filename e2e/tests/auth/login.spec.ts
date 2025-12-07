import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Login Page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ loginPage }) => {
    await loginPage.assertPageLoaded();

    // Check that all elements are visible
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test('should show validation error for empty email', async ({ loginPage }) => {
    // Focus and blur email field to trigger validation
    await loginPage.emailInput.focus();
    await loginPage.passwordInput.focus();

    await expect(loginPage.page.locator('text=E-mail é obrigatório')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ loginPage }) => {
    await loginPage.fillEmail('invalid-email');
    await loginPage.passwordInput.focus();

    await expect(loginPage.page.locator('text=E-mail inválido')).toBeVisible();
  });

  test('should show validation error for empty password', async ({ loginPage }) => {
    await loginPage.passwordInput.focus();
    await loginPage.emailInput.focus();

    await expect(loginPage.page.locator('text=Senha é obrigatória')).toBeVisible();
  });

  test('should show validation error for short password', async ({ loginPage }) => {
    await loginPage.fillPassword('12345');
    await loginPage.emailInput.focus();

    await expect(loginPage.page.locator('text=Senha deve ter pelo menos 6 caracteres')).toBeVisible();
  });

  test('should disable submit button when form has errors', async ({ loginPage }) => {
    await loginPage.fillEmail('invalid-email');
    await loginPage.passwordInput.focus();

    await expect(loginPage.submitButton).toBeDisabled();
  });

  test('should navigate to register page when clicking register link', async ({ loginPage }) => {
    await loginPage.goToRegister();

    await loginPage.page.waitForURL('**/register');
    await expect(loginPage.page).toHaveURL(/\/register$/);
  });

  test('should navigate to forgot password page when clicking forgot password link', async ({ loginPage }) => {
    await loginPage.goToForgotPassword();

    await loginPage.page.waitForURL('**/forgot-password');
    await expect(loginPage.page).toHaveURL(/\/forgot-password$/);
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.login('invalid@example.com', 'wrongpassword123');

    // Wait for error message to appear
    await expect(loginPage.page.locator('text=Credenciais incorretas')).toBeVisible({ timeout: 10000 });
  });

  test('should toggle remember me checkbox', async ({ loginPage }) => {
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();

    await loginPage.toggleRememberMe();
    await expect(loginPage.rememberMeCheckbox).toBeChecked();

    await loginPage.toggleRememberMe();
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
  });

  test('should toggle password visibility', async ({ loginPage }) => {
    // Initially password is hidden
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    // Click the eye icon to show password
    const toggleButton = loginPage.page.locator('button, span, div').filter({ has: loginPage.page.locator('svg') }).first();
    // The password field has an icon that toggles visibility
    await loginPage.page.locator('input[name="password"]').locator('..').locator('svg').click();

    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
  });

  test('should clear field error when user starts typing', async ({ loginPage }) => {
    // Trigger email error
    await loginPage.emailInput.focus();
    await loginPage.passwordInput.focus();
    await expect(loginPage.page.locator('text=E-mail é obrigatório')).toBeVisible();

    // Start typing in email field
    await loginPage.fillEmail('test@example.com');

    // Error should be cleared
    await expect(loginPage.page.locator('text=E-mail é obrigatório')).not.toBeVisible();
  });
});
