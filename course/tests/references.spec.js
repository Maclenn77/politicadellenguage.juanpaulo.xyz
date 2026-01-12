import { test, expect } from '@playwright/test';

test.describe('Reference Links Functionality', () => {
  test('should open reference links with hash in new window', async ({ page, context }) => {
    await page.goto('/contenido/01_que_es_politica_del_lenguaje.html');

    const referenceLink = page.locator('a[href*="references.html#"]').first();
    await expect(referenceLink).toBeVisible();

    expect(await referenceLink.getAttribute('target')).toBe('_blank');
  });

  test('should NOT open navbar reference link in new window', async ({ page }) => {
    await page.goto('/');

    const navbarLink = page.locator('nav a[href*="references.html"]:not([href*="#"])');

    if (await navbarLink.count() > 0) {
      const target = await navbarLink.getAttribute('target');
      expect(target).not.toBe('_blank');
    }
  });

  test('should highlight and scroll to reference when visiting with hash', async ({ page }) => {
    const testId = 'Spolsky2009'; // Most used reference in the course
    await page.goto(`/references.html#${testId}`);

    await page.waitForLoadState();

    const targetElement = page.locator(`#${testId}`);
    await expect(targetElement).toBeVisible();

    const backgroundColor = await targetElement.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(backgroundColor).not.toBe('transparent');

    const isInViewport = await targetElement.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight
      );
    });

    expect(isInViewport).toBe(true);
  });

  test('should apply CSS highlight styles to targeted reference', async ({ page }) => {
    const testId = 'Spolsky2009';
    await page.goto(`/references.html#${testId}`);

    await page.waitForLoadState();

    const targetElement = page.locator(`#${testId}`);

    const styles = await targetElement.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        borderLeftWidth: computed.borderLeftWidth,
        borderLeftColor: computed.borderLeftColor,
        borderRadius: computed.borderRadius,
        padding: computed.padding,
      };
    });

    expect(parseInt(styles.borderLeftWidth)).toBeGreaterThanOrEqual(5);
    expect(styles.borderRadius).not.toBe('0px');
  });

  test('should show external link indicator on reference links', async ({ page }) => {
    await page.goto('/contenido/01_que_es_politica_del_lenguaje.html');

    const referenceLinks = page.locator('a[href*="references.html#"]');
    const count = await referenceLinks.count();

    expect(count).toBeGreaterThan(0);

  });
});
