import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Solar Ops Mini-Cockpit/);
    await expect(page.getByRole('heading', { name: 'Solar Ops Mini-Cockpit' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upload Solar Data Files' })).toBeVisible();
  });

  test('should navigate to logs page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: 'Logs' }).click();
    await expect(page).toHaveURL('/logs');
    await expect(page.getByRole('heading', { name: 'System Logs' })).toBeVisible();
  });

  test('should show file uploader and triage panel', async ({ page }) => {
    await page.goto('/');
    
    // Check file uploader
    await expect(page.getByText('Drag and drop XLSX files here')).toBeVisible();
    await expect(page.getByText('Browse Files')).toBeVisible();
    
    // Check triage panel
    await expect(page.getByRole('heading', { name: 'Operations Triage' })).toBeVisible();
    await expect(page.getByText('MODEL ON')).toBeVisible();
    await expect(page.getByText('Upload solar data files to begin analysis')).toBeVisible();
  });

  test('should toggle model on/off', async ({ page }) => {
    await page.goto('/');
    
    const modelToggle = page.getByRole('checkbox', { name: 'Enable AI model' });
    
    // Should be ON by default
    await expect(page.getByText('MODEL ON')).toBeVisible();
    await expect(modelToggle).toBeChecked();
    
    // Toggle OFF
    await modelToggle.click();
    await expect(page.getByText('MODEL OFF')).toBeVisible();
    await expect(modelToggle).not.toBeChecked();
    
    // Toggle back ON
    await modelToggle.click();
    await expect(page.getByText('MODEL ON')).toBeVisible();
    await expect(modelToggle).toBeChecked();
  });

  test('should show empty state messages', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Upload solar data files to begin analysis')).toBeVisible();
  });
});