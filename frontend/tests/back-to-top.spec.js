import { test, expect } from '@playwright/test'

for (const reducedMotion of ['no-preference', 'reduce']) {
 test(`back to top visibility, focus and motion preference: ${reducedMotion}`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion })
  await page.goto('/')
  const button = page.getByRole('button', { name: 'Back to Top', exact: true })
  await expect(button).toHaveCount(0)
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }))
  await expect(button).toHaveCount(0)
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }))
  await expect(button).toBeVisible()
  await page.evaluate(() => {
   const original = window.scrollTo.bind(window)
   window.scrollTo = options => { window.lastScrollBehavior = options.behavior; original(options) }
  })
  await button.focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  expect(await page.evaluate(() => window.lastScrollBehavior)).toBe(reducedMotion === 'reduce' ? 'instant' : 'smooth')
  await expect(button).toHaveCount(0)
  await expect(page.locator('.site-header .logo')).toBeFocused()
  await page.goto('/about#company-background')
  await expect(button).toBeVisible()
  await page.locator('.site-header .logo').click()
  await expect(button).toHaveCount(0)
  await page.getByRole('button', { name: 'Switch to Chinese' }).click()
  await expect(page.locator('.hero-benefits')).toContainText('让世界每一个角落，都有DLIM HOME的温暖陪伴')
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }))
  await expect(page.getByRole('button', { name: '回到顶部', exact: true })).toBeVisible()
 })
}
