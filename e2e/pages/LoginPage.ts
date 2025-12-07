import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Login page.
 */
export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly generalErrorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly logo: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);

    // Form inputs
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.rememberMeCheckbox = page.locator('input#rememberMe');
    this.submitButton = page.locator('button[type="submit"]');

    // Links
    this.registerLink = page.locator('a[href="/register"]');
    this.forgotPasswordLink = page.locator('a[href="/forgot-password"]');

    // Error messages
    this.generalErrorMessage = page.locator('div').filter({ hasText: /Credenciais incorretas|Conta inativa|Serviço indisponível|Erro ao fazer login/ }).first();
    this.emailError = page.locator('text=E-mail é obrigatório').or(page.locator('text=E-mail inválido'));
    this.passwordError = page.locator('text=Senha é obrigatória').or(page.locator('text=Senha deve ter pelo menos 6 caracteres'));

    // Page elements
    this.logo = page.locator('img[alt="AgroDiário Logo"]');
    this.title = page.locator('h2', { hasText: 'Entre na sua conta' });
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await super.goto('/login');
  }

  /**
   * Fill in email field
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill in password field
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Toggle remember me checkbox
   */
  async toggleRememberMe() {
    await this.rememberMeCheckbox.click();
  }

  /**
   * Submit the login form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Perform complete login flow
   */
  async login(email: string, password: string, rememberMe: boolean = false) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    if (rememberMe) {
      await this.toggleRememberMe();
    }
    await this.submit();
  }

  /**
   * Navigate to register page via link
   */
  async goToRegister() {
    await this.registerLink.click();
  }

  /**
   * Navigate to forgot password page via link
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Assert page is loaded correctly
   */
  async assertPageLoaded() {
    await expect(this.logo).toBeVisible();
    await expect(this.title).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
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
   * Assert successful login by checking URL
   */
  async assertLoginSuccess() {
    await this.page.waitForURL('**/diary**');
  }
}
