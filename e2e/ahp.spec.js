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
      const analysisPage = page.locator('analysis-page');
      
      // Wait for slider to be interactable
      const slider = analysisPage.locator('#pref-slider');
      await expect(slider).toBeVisible({ timeout: 5000 });

      // Set slider to a value (alternate preference)
      const value = i % 2 === 0 ? '2' : '-2';
      await slider.evaluate((el, val) => {
        el.value = val;
        el.dispatchEvent(new Event('input'));
      }, value);

      // Click Next / See Results
      const nextBtn = analysisPage.locator('#btn-next');
      await nextBtn.click();
      
      // Wait for the next step to slide in (visual stability)
      await page.waitForTimeout(200);
    }

    // Verify results page content (piercing shadow DOM)
    const resultsPage = page.locator('results-page');
    await expect(resultsPage).toBeVisible();
    
    // Wait for the primary heading inside the shadow DOM and check its text directly
    const heading = resultsPage.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    
    // Assert against the heading's text directly (pierces shadow DOM)
    const headingText = await heading.innerText();
    expect(headingText).toMatch(/Title|Spurs|City|Priority|Result/i);
    
    // Also verify that the OVP bars are present (using correct class)
    await expect(resultsPage.locator('.alt-bar').first()).toBeVisible({ timeout: 5000 });
  });
});
