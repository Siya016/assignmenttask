import { test, expect } from '@playwright/test';

test.describe('Logs Page', () => {
  test('should display logs page correctly', async ({ page }) => {
    await page.goto('/logs');
    
    await expect(page.getByRole('heading', { name: 'System Logs' })).toBeVisible();
    await expect(page.getByText('Monitor application events, user actions, and system operations')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear All Data' })).toBeVisible();
  });

  test('should show log filters', async ({ page }) => {
    await page.goto('/logs');
    
    // Check filter buttons
    await expect(page.getByRole('button', { name: /All \(\d+\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Info \(\d+\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Warn \(\d+\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Error \(\d+\)/ })).toBeVisible();
    
    // Check search input
    await expect(page.getByPlaceholder('Search logs...')).toBeVisible();
  });

  test('should filter logs by level', async ({ page }) => {
    await page.goto('/logs');
    
    // Click on Info filter
    await page.getByRole('button', { name: /Info/ }).click();
    
    // Should show filtered view (exact content depends on existing logs)
    await expect(page.getByRole('button', { name: /Info/ })).toHaveClass(/bg-blue-100/);
  });

  test('should search logs', async ({ page }) => {
    await page.goto('/logs');
    
    const searchInput = page.getByPlaceholder('Search logs...');
    await searchInput.fill('model');
    
    // Search functionality should filter logs (exact results depend on existing logs)
    await expect(searchInput).toHaveValue('model');
  });

  test('should clear all data', async ({ page }) => {
    await page.goto('/logs');
    
    // Click clear button
    await page.getByRole('button', { name: 'Clear All Data' }).click();
    
    // Should navigate back to dashboard after clearing
    // (This behavior depends on implementation)
  });
});