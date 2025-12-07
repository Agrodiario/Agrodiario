import { test as base } from '@playwright/test';
import {
  LoginPage,
  RegisterPage,
  DiaryPage,
  ActivityFormPage,
  ActivityDetailsDrawer,
  CulturesPage,
  CultureFormPage,
  CultureDetailsDrawer,
  PropertiesPage,
  PropertyFormPage,
  PropertyDetailsDrawer,
} from '../pages';

/**
 * Extended test fixtures with page objects pre-initialized.
 */
type PageFixtures = {
  // Auth
  loginPage: LoginPage;
  registerPage: RegisterPage;
  // Diary
  diaryPage: DiaryPage;
  activityFormPage: ActivityFormPage;
  activityDetailsDrawer: ActivityDetailsDrawer;
  // Cultures
  culturesPage: CulturesPage;
  cultureFormPage: CultureFormPage;
  cultureDetailsDrawer: CultureDetailsDrawer;
  // Properties
  propertiesPage: PropertiesPage;
  propertyFormPage: PropertyFormPage;
  propertyDetailsDrawer: PropertyDetailsDrawer;
};

export const test = base.extend<PageFixtures>({
  // Auth pages
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  // Diary pages
  diaryPage: async ({ page }, use) => {
    await use(new DiaryPage(page));
  },
  activityFormPage: async ({ page }, use) => {
    await use(new ActivityFormPage(page));
  },
  activityDetailsDrawer: async ({ page }, use) => {
    await use(new ActivityDetailsDrawer(page));
  },

  // Culture pages
  culturesPage: async ({ page }, use) => {
    await use(new CulturesPage(page));
  },
  cultureFormPage: async ({ page }, use) => {
    await use(new CultureFormPage(page));
  },
  cultureDetailsDrawer: async ({ page }, use) => {
    await use(new CultureDetailsDrawer(page));
  },

  // Property pages
  propertiesPage: async ({ page }, use) => {
    await use(new PropertiesPage(page));
  },
  propertyFormPage: async ({ page }, use) => {
    await use(new PropertyFormPage(page));
  },
  propertyDetailsDrawer: async ({ page }, use) => {
    await use(new PropertyDetailsDrawer(page));
  },
});

export { expect } from '@playwright/test';

/**
 * Test credentials - should be configured via environment or test database
 */
export const testCredentials = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123',
};

/**
 * Test data for user registration
 * CPF 784.015.260-00 is a valid CPF for testing (passes validation algorithm)
 */
export const testUser = {
  name: 'Test User',
  cpf: '78401526000',
  birthDate: '01011990',
  phone: '11999999999',
  email: `test+${Date.now()}@example.com`,
  password: 'TestPassword123',
  confirmPassword: 'TestPassword123',
};

/**
 * Generate a unique test user for registration tests
 * CPF 714.857.630-17 is a valid CPF for testing (passes validation algorithm)
 */
export function generateTestUser() {
  const timestamp = Date.now();
  return {
    name: `Test User ${timestamp}`,
    cpf: '78401526000',
    birthDate: '01011990',
    phone: '11999999999',
    email: `test+${timestamp}@example.com`,
    password: 'TestPassword123',
    confirmPassword: 'TestPassword123',
  };
}

/**
 * Generate test activity data
 */
export function generateTestActivity() {
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return {
    titulo: `Test Activity ${Date.now()}`,
    date: formattedDate,
    tipo: 'preparo' as const,
    operacao: 'Test operation',
    descricao: 'Test description for the activity',
    responsavel: 'Test User',
    hasInsumo: false,
  };
}

/**
 * Generate test culture data
 */
export function generateTestCulture() {
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return {
    cultureName: `Milho ${Date.now()}`,
    cultivar: 'AG 1051',
    cycle: '120',
    origin: 'conventional' as const,
    supplier: 'Test Supplier',
    plantingDate: formattedDate,
    plantingArea: '10',
    observations: 'Test observations',
  };
}

/**
 * Generate test property data
 */
export function generateTestProperty() {
  return {
    name: `Test Property ${Date.now()}`,
    address: 'Test Address, City, State',
    areaTotal: '100',
    areaProducao: '80',
    situacao: 'preparo' as const,
  };
}
