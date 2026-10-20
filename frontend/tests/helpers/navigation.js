import { expect } from '@playwright/test'

export async function ensureEnglish(page) {
  await page.locator('h1').waitFor()
  if (await page.locator('html').getAttribute('lang') !== 'en') {
    await page.getByRole('button', { name: '切换至英文', exact: true }).click()
  }
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
}

export async function openPage(page, path) {
  await page.goto(path)
  await page.locator('h1').waitFor()
}
