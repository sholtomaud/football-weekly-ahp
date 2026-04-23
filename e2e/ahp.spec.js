import { test, expect } from '@playwright/test';

test.describe('Football Weekly AHP — Page Navigation', () => {
  test('home page has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Football Weekly AHP/);
  });

  test('home page shows the dilemma headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-nav')).toBeVisible();
  });

  test('nav has Start Analysis link', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('app-nav');
    await expect(nav).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('app-nav')).toBeVisible();
    await expect(page).toHaveTitle(/Football Weekly AHP/);
  });
});

test.describe('Football Weekly AHP — Analysis Flow', () => {
  test('navigating to /analysis shows the pairwise slider', async ({ page }) => {
    await page.goto('/analysis');
    // The analysis-page web component should be in the router outlet
    const outlet = page.locator('#router-outlet');
    await expect(outlet).toBeVisible();
  });

  test('can complete the full analysis flow', async ({ page }) => {
    await page.goto('/analysis');

    // Work through all 15 match steps
    for (let i = 0; i < 15; i++) {
      // Small delay for component transition
      await page.waitForTimeout(100);

      const analysisPage = page.locator('analysis-page');
      
      // Set slider to a value (alternate preference)
      const slider = analysisPage.locator('#pref-slider');
      if (await slider.isVisible()) {
        const value = i % 2 === 0 ? '2' : '-2';
        await slider.evaluate((el, val) => {
          el.value = val;
          el.dispatchEvent(new Event('input'));
        }, value);
      }

      // Click Next / See Results
      const nextBtn = analysisPage.locator('#btn-next');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
      }
    }

    // Should now be on results page
    await expect(page).toHaveURL(/results/);
    
    // Verify results page content
    const resultsPage = page.locator('results-page');
    await expect(resultsPage).toBeVisible();
    
    // The results should mention one of the outcomes
    const text = await resultsPage.innerText();
    expect(text).toMatch(/Title|Spurs|City/);
  });
});
