const { test, expect } = require('@playwright/test');

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBeFalsy();
}

test.describe('My Learning OS', () => {
  test('desktop dashboard renders as a single bright layout', async ({ page }) => {
    await page.goto('./', { waitUntil: 'networkidle' });
    await expect(page.locator('.root-dashboard')).toBeVisible();
    await expect(page.locator('.root-dash-hero')).toBeVisible();
    await expect(page.locator('#rootProgressChart')).toBeVisible();
    await expect(page.locator('.legacy-dashboard')).toHaveCount(0);
    await expect(page.locator('.legacy-skill-hero')).toHaveCount(0);
    await assertNoHorizontalOverflow(page);
    await expect(page.locator('#rootTrackChart')).toBeVisible();
  });

  test('mobile dashboard stays usable', async ({ page }) => {
    await page.goto('./', { waitUntil: 'networkidle' });
    await expect(page.locator('.root-dash-hero')).toBeVisible();
    await expect(page.locator('#rootProgressChart')).toBeVisible();
  });
});

test.describe('BINUS Online', () => {
  test('dashboard renders without forbidden dashboard cards', async ({ page }) => {
    await page.goto('./binus-online/', { waitUntil: 'networkidle' });
    await expect(page.locator('.binus-dashboard')).toBeVisible();
    await expect(page.locator('.binus-dash-hero')).toBeVisible();
    await expect(page.locator('.binus-progress-panel')).toBeVisible();
    await expect(page.getByText('Jadwal Mendatang', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Fokus Kuliah Hari Ini', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Akses Cepat', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Semester Aktif', { exact: true })).toHaveCount(0);
  });

  test('BINUS progress graph is present on mobile', async ({ page }) => {
    await page.goto('./binus-online/', { waitUntil: 'networkidle' });
    await expect(page.locator('#binusSemesterChart')).toBeVisible();
    await expect(page.locator('#binusChartLabels')).toContainText('Sem 1');
    await expect(page.locator('#binusChartLabels')).toContainText('Sem 8');
  });

  test('no console errors on initial load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('./binus-online/', { waitUntil: 'networkidle' });
    expect(errors).toEqual([]);
  });
});
