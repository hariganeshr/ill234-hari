import { test, expect } from '@playwright/test';

/** End-to-end coverage for filtering roles by department and location. */
test.describe('Role filters', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('filters by department', async ({ page }) => {
        await page.getByTestId('department-filter').selectOption('Finance');
        const cards = page.getByTestId('role-card').filter({ visible: true });
        await expect(cards).toHaveCount(2);
        for (const department of await cards.getByTestId('role-department').allTextContents()) {
            expect(department).toBe('Finance');
        }
        await expect(page).toHaveURL(/department=Finance/);
    });

    test('filters by location', async ({ page }) => {
        await page.getByTestId('location-filter').selectOption('Woodinville, WA, USA');
        const cards = page.getByTestId('role-card').filter({ visible: true });
        await expect(cards).toHaveCount(3);
        await expect(cards.getByTestId('role-location')).toHaveText([
            'Woodinville, WA, USA',
            'Woodinville, WA, USA',
            'Woodinville, WA, USA',
        ]);
    });

    test('combines department and location (either matches)', async ({ page }) => {
        await page.getByTestId('department-filter').selectOption('Security');
        await page.getByTestId('location-filter').selectOption('Mumbai, India');
        const cards = page.getByTestId('role-card').filter({ visible: true });
        const departments = await cards.getByTestId('role-department').allTextContents();
        const locations = await cards.getByTestId('role-location').allTextContents();
        expect(departments.length).toBeGreaterThan(0);
        departments.forEach((department, index) => {
            expect(department === 'Security' || locations[index] === 'Mumbai, India').toBe(true);
        });
        expect(departments).toContain('Security');
        expect(locations).toContain('Mumbai, India');
    });

    test('reset restores the full list', async ({ page }) => {
        const total = await page.getByTestId('role-card').count();
        await page.getByTestId('department-filter').selectOption('Finance');
        await expect(page.getByTestId('role-card').filter({ visible: true })).toHaveCount(2);
        await page.getByTestId('filters-reset').click();
        await expect(page.getByTestId('role-card').filter({ visible: true })).toHaveCount(total);
        await expect(page.getByTestId('department-filter')).toHaveValue('');
        await expect(page).not.toHaveURL(/department=/);
    });

    test('shows an empty state when no roles match', async ({ page }) => {
        await page.goto('/?department=Nope&location=Nowhere');
        await expect(page.getByTestId('empty-state')).toBeVisible();
        await expect(page.getByTestId('role-card').filter({ visible: true })).toHaveCount(0);
        await page.getByTestId('filters-reset').click();
        await expect(page.getByTestId('empty-state')).toBeHidden();
        await expect(page.getByTestId('role-card').first()).toBeVisible();
    });
});
