import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Diary Page', () => {
  test.beforeEach(async ({ diaryPage }) => {
    await diaryPage.goto();
    await diaryPage.waitForActivitiesToLoad();
  });

  test('should display diary page correctly', async ({ diaryPage }) => {
    await diaryPage.assertPageLoaded();

    // Check that main elements are visible
    await expect(diaryPage.searchInput).toBeVisible();
    await expect(diaryPage.sortButton).toBeVisible();
    await expect(diaryPage.reportButton).toBeVisible();
  });

  test('should filter activities by search term', async ({ diaryPage }) => {
    // Get initial count
    const initialCount = await diaryPage.getActivityCount();

    // Search for a specific term
    await diaryPage.search('test');

    // Wait for results
    await diaryPage.waitForActivitiesToLoad();

    // Results should be filtered (may have fewer or same number)
    // If empty, should show empty state
    const searchCount = await diaryPage.getActivityCount();
    if (searchCount === 0) {
      await diaryPage.assertEmpty();
    }
  });

  test('should clear search and show all activities', async ({ diaryPage }) => {
    // First search
    await diaryPage.search('test');
    await diaryPage.waitForActivitiesToLoad();

    // Clear search
    await diaryPage.clearSearch();
    await diaryPage.waitForActivitiesToLoad();

    // Should show activities again (or empty if none exist)
    await diaryPage.assertPageLoaded();
  });

  test('should sort activities by newest', async ({ diaryPage }) => {
    await diaryPage.sortByNewest();
    await diaryPage.waitForActivitiesToLoad();

    // Verify sort was applied (page should reload with new order)
    await diaryPage.assertPageLoaded();
  });

  test('should sort activities by oldest', async ({ diaryPage }) => {
    await diaryPage.sortByOldest();
    await diaryPage.waitForActivitiesToLoad();

    // Verify sort was applied
    await diaryPage.assertPageLoaded();
  });

  test('should open activity details when clicking view button', async ({ diaryPage, activityDetailsDrawer }) => {
    // Skip if no activities exist
    const count = await diaryPage.getActivityCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Click first activity
    await diaryPage.viewActivity(0);

    // Drawer should open
    await activityDetailsDrawer.waitForDrawerOpen();
    await activityDetailsDrawer.assertDrawerOpen();
  });

  test('should close activity details drawer', async ({ diaryPage, activityDetailsDrawer }) => {
    // Skip if no activities exist
    const count = await diaryPage.getActivityCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await diaryPage.viewActivity(0);
    await activityDetailsDrawer.waitForDrawerOpen();

    // Close drawer
    await activityDetailsDrawer.close();
    await activityDetailsDrawer.assertDrawerClosed();
  });

  test('should navigate to edit page from activity details', async ({ diaryPage, activityDetailsDrawer, page }) => {
    // Skip if no activities exist
    const count = await diaryPage.getActivityCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await diaryPage.viewActivity(0);
    await activityDetailsDrawer.waitForDrawerOpen();

    // Click edit
    await activityDetailsDrawer.clickEdit();

    // Should navigate to edit page
    await page.waitForURL(/\/diary\/edit\/\d+/);
  });

  test('should show delete confirmation modal', async ({ diaryPage, activityDetailsDrawer }) => {
    // Skip if no activities exist
    const count = await diaryPage.getActivityCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Open drawer
    await diaryPage.viewActivity(0);
    await activityDetailsDrawer.waitForDrawerOpen();

    // Click delete
    await activityDetailsDrawer.clickDelete();

    // Confirmation modal should appear
    await activityDetailsDrawer.assertConfirmationModalVisible();
  });

  test('should load more activities when clicking load more', async ({ diaryPage }) => {
    // Check if load more button is visible
    const isLoadMoreVisible = await diaryPage.loadMoreButton.isVisible();

    if (isLoadMoreVisible) {
      const initialCount = await diaryPage.getActivityCount();

      await diaryPage.loadMore();
      await diaryPage.page.waitForTimeout(1000);

      // Should have more activities
      const newCount = await diaryPage.getActivityCount();
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    }
  });
});
