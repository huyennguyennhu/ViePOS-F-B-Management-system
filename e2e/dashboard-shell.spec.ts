import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { E2E_ROOT_EMAIL, E2E_ROOT_PASSWORD } from './e2e-env';
const screenshotDir = path.join(
  process.cwd(),
  'plans/260520-1749-pos-internal-ui-shell-implementation/reports/screenshots'
);

const loginAsRoot = async (page: Page) => {
  const response = await page.request.post('/api/app-auth/login', {
    data: { email: E2E_ROOT_EMAIL, password: E2E_ROOT_PASSWORD, rememberMe: true },
  });

  expect(response.ok()).toBe(true);
};

const openDashboard = async (page: Page) => {
  await loginAsRoot(page);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator('.dashboard-shell')).toBeVisible();
};

test.describe('authenticated dashboard shell', () => {
  test('renders root admin navigation without dropping RBAC-visible routes', async ({ page }) => {
    await openDashboard(page);

    await expect(page.getByRole('link', { name: /Bán hàng/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Đơn hàng/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Menu$/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Nhân viên/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Duyệt tài khoản/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Phân quyền/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Cài đặt/ })).toBeVisible();
  });

  for (const viewport of [
    { width: 2560, height: 1440 },
    { width: 1920, height: 1080 },
    { width: 1440, height: 1024 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    test(`keeps shell usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      mkdirSync(screenshotDir, { recursive: true });
      await page.setViewportSize(viewport);
      await openDashboard(page);

      const topbar = page.locator('.dashboard-topbar');
      await expect(topbar).toBeVisible();
      await expect(topbar).toHaveCSS('height', '60px');

      if (viewport.width >= 1024) {
        const sidebarBox = await page.locator('.dashboard-sidebar').boundingBox();
        expect(sidebarBox?.width).toBe(225);
      } else {
        await expect(page.locator('.dashboard-sidebar')).toHaveAttribute('aria-hidden', 'true');
        await page.getByRole('button', { name: 'Mở menu' }).click();
        await expect(page.locator('.dashboard-sidebar')).toHaveClass(/is-open/);
        await expect(page.locator('.dashboard-sidebar')).toHaveAttribute('aria-hidden', 'false');
        await expect(page.locator('.dashboard-topbar')).toHaveAttribute('aria-hidden', 'true');
        await expect(page.locator('.dashboard-main')).toHaveAttribute('aria-hidden', 'true');
      }

      const minTargetHeight = await page
        .locator('.dashboard-nav-link')
        .evaluateAll((links) => Math.min(...links.map((link) => link.getBoundingClientRect().height)));
      expect(minTargetHeight).toBeGreaterThanOrEqual(44);

      const contentWidth = await page
        .locator('.dashboard-content')
        .evaluate((element) => element.getBoundingClientRect().width);
      expect(contentWidth).toBeLessThanOrEqual(1600);

      await page.screenshot({
        fullPage: true,
        path: path.join(screenshotDir, `dashboard-${viewport.width}x${viewport.height}.png`),
      });
    });
  }
});
