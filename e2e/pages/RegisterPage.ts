import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Register page.
 */
export class RegisterPage extends BasePage {
  // Locators
  readonly nameInput: Locator;
  readonly cpfInput: Locator;
  readonly birthDateInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly generalErrorMessage: Locator;
  readonly logo: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);

    // Form inputs
    this.nameInput = page.locator('input[name="name"]');
    this.cpfInput = page.locator('input[name="cpf"]');
    this.birthDateInput = page.locator('input[name="birthDate"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.submitButton = page.locator('button[type="submit"]');

    // Links
    this.loginLink = page.locator('a[href="/login"]');

    // Error messages
    this.generalErrorMessage = page.locator('div').filter({
      hasText: /já está cadastrado|Erro ao criar conta/
    }).first();

    // Page elements
    this.logo = page.locator('img[alt="AgroDiário Logo"]');
    this.title = page.locator('h2', { hasText: 'Crie sua conta' });
  }

  /**
   * Navigate to register page
   */
  async goto() {
    await super.goto('/register');
  }

  /**
   * Fill the registration form with blur events to trigger validation
   */
  async fillForm(data: {
    name: string;
    cpf: string;
    birthDate: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.nameInput.blur();

    await this.cpfInput.fill(data.cpf);
    await this.cpfInput.blur();

    await this.birthDateInput.fill(data.birthDate);
    await this.birthDateInput.blur();

    await this.phoneInput.fill(data.phone);
    await this.phoneInput.blur();

    await this.emailInput.fill(data.email);
    await this.emailInput.blur();

    await this.passwordInput.fill(data.password);
    await this.passwordInput.blur();

    await this.confirmPasswordInput.fill(data.confirmPassword);
    await this.confirmPasswordInput.blur();
  }

  /**
   * Submit the registration form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Navigate to login page via link
   */
  async goToLogin() {
    await this.loginLink.click();
  }

  /**
   * Assert page is loaded correctly
   */
  async assertPageLoaded() {
    await expect(this.logo).toBeVisible();
    await expect(this.title).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Assert general error message is visible
   */
  async assertGeneralError(expectedText?: string) {
    if (expectedText) {
      await expect(this.page.locator(`text=${expectedText}`)).toBeVisible();
    } else {
      await expect(this.generalErrorMessage).toBeVisible();
    }
  }

  /**
   * Assert field validation error
   */
  async assertFieldError(errorText: string) {
    await expect(this.page.locator(`text=${errorText}`)).toBeVisible();
  }

  /**
   * Assert successful registration by checking redirect
   */
  async assertRegistrationSuccess() {
    // After registration, user is redirected to app
    await this.page.waitForURL('**/diary**', { timeout: 10000 });
  }
}
