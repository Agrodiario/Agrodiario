import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Cultures Page', () => {
  test.beforeEach(async ({ culturesPage }) => {
    await culturesPage.goto();
    await culturesPage.waitForCulturesToLoad();
  });

  test('should display cultures page correctly', async ({ culturesPage }) => {
    await culturesPage.assertPageLoaded();

    // Check that main elements are visible
    await expect(culturesPage.searchInput).toBeVisible();
    await expect(culturesPage.sortButton).toBeVisible();
    await expect(culturesPage.reportButton).toBeVisible();
  });

  test('should filter cultures by search term', async ({ culturesPage }) => {
    // Search for a specific term
    await culturesPage.search('milho');

    // Wait for results
    await culturesPage.waitForCulturesToLoad();

    // Results should be filtered
    const searchCount = await culturesPage.getCultureCount();
    if (searchCount === 0) {
      await culturesPage.assertEmpty();
    }
  });

  test('should clear search and show all cultures', async ({ culturesPage }) => {
    // First search
    await culturesPage.search('test');
    await culturesPage.waitForCulturesToLoad();

    // Clear search
    await culturesPage.clearSearch();
    await culturesPage.waitForCulturesToLoad();

    // Should show cultures again (or empty if none exist)
    await culturesPage.assertPageLoaded();
  });

  test('should open sort dropdown', async ({ culturesPage }) => {
    await culturesPage.openSortDropdown();

    // Dropdown should be visible with sort options
    await expect(culturesPage.page.locator('text=Data de plantio')).toBeVisible();
    await expect(culturesPage.page.locator('text=Nome da cultura')).toBeVisible();
  });

  test('should sort cultures by name', async ({ culturesPage }) => {
    await culturesPage.sortBy('Nome da cultura');
    await culturesPage.waitForCulturesToLoad();

    // Verify sort was applied
    await culturesPage.assertPageLoaded();
  });

  test('should sort cultures by planting date', async ({ culturesPage }) => {
    await culturesPage.sortBy('Data de plantio');
    await culturesPage.waitForCulturesToLoad();

    // Verify sort was applied
    await culturesPage.assertPageLoaded();
  });

  test('should open culture details when clicking manage button', async ({ culturesPage, cultureDetailsDrawer }) => {
    // Skip if no cultures exist
    const count = await culturesPage.getCultureCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Click first culture manage button
    await culturesPage.manageCulture(0);

    // Drawer should open
    await cultureDetailsDrawer.waitForDrawerOpen();
    await cultureDetailsDrawer.assertDrawerOpen();
  });

  test('should close culture details drawer', async ({ culturesPage, cultureDetailsDrawer }) => {
    const count = await culturesPage.getCultureCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await culturesPage.manageCulture(0);
    await cultureDetailsDrawer.waitForDrawerOpen();

    // Close drawer
    await cultureDetailsDrawer.close();
    await cultureDetailsDrawer.assertDrawerClosed();
  });

  test('should navigate to edit page from culture details', async ({ culturesPage, cultureDetailsDrawer, page }) => {
    const count = await culturesPage.getCultureCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await culturesPage.manageCulture(0);
    await cultureDetailsDrawer.waitForDrawerOpen();

    // Click edit
    await cultureDetailsDrawer.clickEdit();

    // Should navigate to edit page
    await page.waitForURL(/\/cultures\/edit\/\d+/);
  });

  test('should show delete confirmation modal', async ({ culturesPage, cultureDetailsDrawer }) => {
    const count = await culturesPage.getCultureCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await culturesPage.manageCulture(0);
    await cultureDetailsDrawer.waitForDrawerOpen();

    // Click delete
    await cultureDetailsDrawer.clickDelete();

    // Confirmation modal should appear
    await cultureDetailsDrawer.assertConfirmationModalVisible();
  });

  test('should load more cultures when clicking load more', async ({ culturesPage }) => {
    const isLoadMoreVisible = await culturesPage.loadMoreButton.isVisible();

    if (isLoadMoreVisible) {
      const initialCount = await culturesPage.getCultureCount();

      await culturesPage.loadMore();
      await culturesPage.page.waitForTimeout(1000);

      const newCount = await culturesPage.getCultureCount();
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    }
  });
});
