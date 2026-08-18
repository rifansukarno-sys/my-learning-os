const { test, expect } = require('@playwright/test');

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBeFalsy();
}

async function captureErrors(page) {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}

test.describe('My Learning OS', () => {
  test('dashboard renders cleanly with no legacy duplicate layers', async ({ page }) => {
    const errors = await captureErrors(page);
    await page.goto('./', { waitUntil: 'networkidle' });
    await expect(page.locator('.root-dashboard')).toBeVisible();
    await expect(page.locator('.root-dash-hero')).toBeVisible();
    await expect(page.locator('#rootProgressChart')).toBeVisible();
    await expect(page.locator('#rootTrackChart')).toBeVisible();
    await expect(page.locator('.legacy-dashboard')).toHaveCount(0);
    await expect(page.locator('.legacy-skill-hero')).toHaveCount(0);
    await assertNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('mobile dashboard stays usable and overflow-free', async ({ page }) => {
    await page.goto('./', { waitUntil: 'networkidle' });
    await expect(page.locator('.root-dash-hero')).toBeVisible();
    await expect(page.locator('#rootProgressChart')).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('motivation card changes quote', async ({ page }) => {
    await page.goto('./', { waitUntil: 'networkidle' });
    const quote = page.locator('#motivationQuote');
    const source = page.locator('#motivationSource');
    const before = await quote.textContent();
    await expect(source).not.toHaveText('');
    await page.locator('#nextMotivation').click();
    await expect(quote).not.toHaveText(before);
  });

  test('learning track, search, check-all and clear-all work', async ({ page }) => {
    await page.goto('./', { waitUntil: 'networkidle' });
    await expect(page.locator('#trackTabs')).toBeVisible();
    const tabs = page.locator('#trackTabs button, #trackTabs [role="tab"]');
    await expect(tabs.first()).toBeVisible();
    await tabs.first().click();
    await expect(page.locator('#levelList')).toBeVisible();
    await page.locator('#search').fill('python');
    await expect(page.locator('#levelList')).toBeVisible();
    await page.locator('#search').fill('');
    await page.locator('#checkAll').click();
    await expect(page.locator('#doneCount')).not.toHaveText('0');
    await page.locator('#clearAll').click();
    await expect(page.locator('#doneCount')).toHaveText('0');
  });

  test('authentication modal opens and switches mode', async ({ page }) => {
    await page.goto('./', { waitUntil: 'networkidle' });
    await page.locator('#loginBtn').click();
    await expect(page.locator('#authModal')).toBeVisible();
    await expect(page.locator('#authTitle')).toHaveText('Login');
    await page.locator('#authSwitch').click();
    await expect(page.locator('#authTitle')).toHaveText('Daftar');
  });
});

test.describe('BINUS Online', () => {
  test('dashboard has required layout and no removed cards', async ({ page }) => {
    await page.goto('./binus-online/', { waitUntil: 'networkidle' });
    await expect(page.locator('.binus-dashboard')).toBeVisible();
    await expect(page.locator('.binus-dash-hero')).toBeVisible();
    await expect(page.locator('.binus-progress-panel')).toBeVisible();
    for (const label of ['Jadwal Mendatang', 'Fokus Kuliah Hari Ini', 'Akses Cepat', 'Semester Aktif']) {
      await expect(page.getByText(label, { exact: true })).toHaveCount(0);
    }
  });

  test('progress graph and curriculum render', async ({ page }) => {
    await page.goto('./binus-online/', { waitUntil: 'networkidle' });
    await expect(page.locator('#binusSemesterChart')).toBeVisible();
    await expect(page.locator('#binusChartLabels')).toContainText('Sem 1');
    await expect(page.locator('#binusChartLabels')).toContainText('Sem 8');
    await expect(page.locator('#curriculumList')).toBeVisible();
    await expect(page.locator('.semester').first()).toBeVisible();
  });

  test('curriculum search filters and restores content', async ({ page }) => {
    await page.goto('./binus-online/', { waitUntil: 'networkidle' });
    const search = page.locator('#search');
    await search.fill('quality engineering');
    await expect(page.locator('#curriculumList')).toContainText('Quality Engineering');
    await search.fill('');
    await expect(page.locator('#curriculumList')).toContainText('Probability Theory and Applied Statistics');
  });

  test('calendar month navigation, today and unauthenticated add-event flow work', async ({ page }) => {
    await page.goto('./binus-online/', { waitUntil: 'networkidle' });
    await expect(page.locator('#calendarGrid')).toBeVisible();
    const before = await page.locator('#monthLabel').textContent();
    await page.locator('#nextMonth').click();
    await expect(page.locator('#monthLabel')).not.toHaveText(before);
    await page.locator('#prevMonth').click();
    await page.locator('#todayBtn').click();
    await page.locator('#addEventBtn').click();
    await expect(page.locator('#authModal')).toBeVisible();
  });

  test('phone notification card is visible and activation path responds', async ({ page }) => {
    await page.goto('./binus-online/', { waitUntil: 'networkidle' });
    await expect(page.locator('#push-card')).toBeVisible();
    await expect(page.locator('#enablePushBtn')).toBeVisible();
    await expect(page.locator('#pushStatus')).toBeVisible();
    await page.locator('#enablePushBtn').click();
    await expect(page.locator('#pushStatus')).not.toHaveText('');
  });

  test('login modal opens from account controls', async ({ page }) => {
    await page.goto('./binus-online/', { waitUntil: 'networkidle' });
    await page.locator('#loginBtn').click();
    await expect(page.locator('#authModal')).toBeVisible();
    await expect(page.locator('#authTitle')).toHaveText('Login');
  });

  test('initial load has no page errors and no horizontal overflow', async ({ page }) => {
    const errors = await captureErrors(page);
    await page.goto('./binus-online/', { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });
});
