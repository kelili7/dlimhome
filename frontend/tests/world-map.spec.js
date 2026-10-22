import { test, expect } from '@playwright/test'
import { openPage } from './helpers/navigation'

test('business map loads below existing cards, animates on entry and translates', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await openPage(page, '/about')
  const map = page.locator('.company-markets > .world-map-demo')
  await expect(page.locator('.company-markets article')).toHaveCount(2)
  await expect(map).not.toHaveClass(/has-entered/)
  await map.scrollIntoViewIfNeeded()
  await expect(map).toHaveClass(/has-entered/)
  await expect.poll(() => map.locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
  const cards = await page.locator('.company-markets .two-columns').boundingBox()
  const mapBox = await map.boundingBox()
  expect(mapBox.y).toBeGreaterThanOrEqual(cards.y + cards.height)
  await expect(map.locator('.world-map-route').last()).toHaveCSS('stroke-dashoffset', '0px')
  await expect(map.getByRole('img')).toHaveAccessibleName(/Shenzhen.*Europe.*North America/)
  await map.screenshot({ path: testInfo.outputPath('world-map-desktop.png'), animations: 'disabled' })
  await page.getByRole('button', { name: 'Switch to Chinese' }).click()
  await expect(map.locator('h4')).toHaveText('从深圳出发，走进更多日常。')
  await expect(map.getByRole('img')).toHaveAccessibleName(/深圳与欧洲、北美/)
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const bounds = await map.boundingBox()
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await map.screenshot({ path: testInfo.outputPath('world-map-mobile.png'), animations: 'disabled' })
  expect(errors).toEqual([])
})

test('reduced motion keeps all connections visible and stops node pulses', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPage(page, '/about')
  const map = page.locator('.world-map-demo')
  await map.scrollIntoViewIfNeeded()
  for (const path of await map.locator('.world-map-route').all()) {
    await expect(path).toHaveCSS('animation-name', 'none')
    await expect(path).toHaveCSS('stroke-dashoffset', '0px')
  }
  await expect(map.locator('.world-map-pulse').first()).toHaveCSS('animation-name', 'none')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(map.locator('.world-map-route').first()).not.toHaveCSS('animation-name', 'none')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(map.locator('.world-map-route').first()).toHaveCSS('animation-name', 'none')
})
