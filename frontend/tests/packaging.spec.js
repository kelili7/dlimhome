import { test, expect } from '@playwright/test'
import { openPage } from './helpers/navigation.js'

async function checkAlignment(region, width) {
  if (width < 768) return
  // A viewport update can resolve before its media-query reflow is painted.
  // Keep the 1px requirement, but measure the settled responsive layout.
  await expect.poll(async () => {
    const rows = await region.locator('.packaging-card').evaluateAll(cards => cards.map(card => ({
      bottom: card.getBoundingClientRect().bottom,
      imageBottom: card.querySelector('img').getBoundingClientRect().bottom,
      copyTop: card.querySelector('.packaging-copy p').getBoundingClientRect().top,
    })))
    return Math.max(...['bottom', 'imageBottom', 'copyTop'].map(key =>
      Math.max(...rows.map(row => row[key])) - Math.min(...rows.map(row => row[key]))))
  }).toBeLessThanOrEqual(1)
}

async function captureSection(page, region, path) {
  await region.evaluate(el => {
    document.activeElement?.blur()
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 88)
  })
  await page.screenshot({ path })
}

test('packaging stays below collections, translates and remains visible with no search results', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPage(page, '/products')
  const packaging = page.getByRole('region', { name: 'Product packaging', exact: true })
  await expect(packaging).toHaveCount(1)
  expect(await packaging.evaluate(el => el.previousElementSibling.id)).toBe('catalogue')
  await page.locator('#catalogue-search').fill('no-matching-collection')
  await expect(page.locator('.empty-state')).toBeVisible()
  await expect(packaging.getByRole('article')).toHaveCount(3)
  await packaging.scrollIntoViewIfNeeded()
  await expect(packaging).toBeVisible()
  await page.getByRole('button', { name: 'Switch to Chinese' }).click()
  await expect(packaging).toHaveCount(0)
  const translated = page.getByRole('region', { name: '产品包装', exact: true })
  await expect(translated.getByRole('heading', { level: 3 })).toHaveText([
    '礼盒包装', '运输包装', '手提袋',
  ])
  await page.getByRole('button', { name: '清除筛选' }).click()
  await expect(page.locator('.product-card')).toHaveCount(8)
  for (const image of await translated.getByRole('img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true)
    await expect(image).toHaveAttribute('alt', /.+/)
  }
  for (const width of [1440, 1366, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    for (const heading of await translated.getByRole('heading').all()) {
      expect(await heading.evaluate(el => el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight))).toBeLessThanOrEqual(2.1)
    }
    await checkAlignment(translated, width)
    await captureSection(page, translated, testInfo.outputPath(`packaging-zh-${width}.png`))
  }
  await page.getByRole('button', { name: '切换至英文', exact: true }).click()
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    for (const heading of await packaging.getByRole('heading').all()) {
      expect(await heading.evaluate(el => el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight))).toBeLessThanOrEqual(2.1)
    }
    await checkAlignment(packaging, width)
    await captureSection(page, packaging, testInfo.outputPath(`packaging-en-${width}.png`))
  }
  await page.locator('.cta-panel a').click()
  await expect(page).toHaveURL(/\/contact\/business-enquiry$/)
})
