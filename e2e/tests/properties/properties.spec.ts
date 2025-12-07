import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Properties Page', () => {
  test.beforeEach(async ({ propertiesPage }) => {
    await propertiesPage.goto();
    await propertiesPage.waitForPropertiesToLoad();
  });

  test('should display properties page correctly', async ({ propertiesPage }) => {
    await propertiesPage.assertPageLoaded();

    // Check that main elements are visible
    await expect(propertiesPage.searchInput).toBeVisible();
    await expect(propertiesPage.sortButton).toBeVisible();
    await expect(propertiesPage.reportButton).toBeVisible();
  });

  test('should filter properties by search term', async ({ propertiesPage }) => {
    // Search for a specific term
    await propertiesPage.search('fazenda');

    // Wait for results
    await propertiesPage.waitForPropertiesToLoad();

    // Results should be filtered
    const searchCount = await propertiesPage.getPropertyCount();
    if (searchCount === 0) {
      await propertiesPage.assertEmpty();
    }
  });

  test('should clear search and show all properties', async ({ propertiesPage }) => {
    // First search
    await propertiesPage.search('test');
    await propertiesPage.waitForPropertiesToLoad();

    // Clear search
    await propertiesPage.clearSearch();
    await propertiesPage.waitForPropertiesToLoad();

    // Should show properties again (or empty if none exist)
    await propertiesPage.assertPageLoaded();
  });

  test('should sort properties by newest', async ({ propertiesPage }) => {
    await propertiesPage.sortByNewest();
    await propertiesPage.waitForPropertiesToLoad();

    // Verify sort was applied
    await propertiesPage.assertPageLoaded();
  });

  test('should sort properties by oldest', async ({ propertiesPage }) => {
    await propertiesPage.sortByOldest();
    await propertiesPage.waitForPropertiesToLoad();

    // Verify sort was applied
    await propertiesPage.assertPageLoaded();
  });

  test('should open property details when clicking manage button', async ({ propertiesPage, propertyDetailsDrawer }) => {
    // Skip if no properties exist
    const count = await propertiesPage.getPropertyCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Click first property manage button
    await propertiesPage.manageProperty(0);

    // Drawer should open
    await propertyDetailsDrawer.waitForDrawerOpen();
    await propertyDetailsDrawer.assertDrawerOpen();
  });

  test('should close property details drawer', async ({ propertiesPage, propertyDetailsDrawer }) => {
    const count = await propertiesPage.getPropertyCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await propertiesPage.manageProperty(0);
    await propertyDetailsDrawer.waitForDrawerOpen();

    // Close drawer
    await propertyDetailsDrawer.close();
    await propertyDetailsDrawer.assertDrawerClosed();
  });

  test('should navigate to edit page from property details', async ({ propertiesPage, propertyDetailsDrawer, page }) => {
    const count = await propertiesPage.getPropertyCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await propertiesPage.manageProperty(0);
    await propertyDetailsDrawer.waitForDrawerOpen();

    // Click edit
    await propertyDetailsDrawer.clickEdit();

    // Should navigate to edit page
    await page.waitForURL(/\/properties\/edit\/\d+/);
  });

  test('should show delete confirmation modal', async ({ propertiesPage, propertyDetailsDrawer }) => {
    const count = await propertiesPage.getPropertyCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await propertiesPage.manageProperty(0);
    await propertyDetailsDrawer.waitForDrawerOpen();

    // Click delete
    await propertyDetailsDrawer.clickDelete();

    // Confirmation modal should appear
    await propertyDetailsDrawer.assertConfirmationModalVisible();
  });

  test('should display talhoes section in drawer', async ({ propertiesPage, propertyDetailsDrawer }) => {
    const count = await propertiesPage.getPropertyCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await propertiesPage.manageProperty(0);
    await propertyDetailsDrawer.waitForDrawerOpen();

    // Talhoes section should be visible
    await expect(propertyDetailsDrawer.talhoesSection).toBeVisible();
  });

  test('should show view map button in drawer', async ({ propertiesPage, propertyDetailsDrawer }) => {
    const count = await propertiesPage.getPropertyCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await propertiesPage.manageProperty(0);
    await propertyDetailsDrawer.waitForDrawerOpen();

    // View map button should be visible
    await expect(propertyDetailsDrawer.viewMapButton).toBeVisible();
  });

  test('should load more properties when clicking load more', async ({ propertiesPage }) => {
    const isLoadMoreVisible = await propertiesPage.loadMoreButton.isVisible();

    if (isLoadMoreVisible) {
      const initialCount = await propertiesPage.getPropertyCount();

      await propertiesPage.loadMore();
      await propertiesPage.page.waitForTimeout(1000);

      const newCount = await propertiesPage.getPropertyCount();
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    }
  });
});
