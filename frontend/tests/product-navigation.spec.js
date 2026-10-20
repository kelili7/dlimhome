import { test, expect } from '@playwright/test'
import { openPage, ensureEnglish } from './helpers/navigation.js'

test.beforeEach(async ({ page }) => {
 await page.addInitScript(() => {
  const scrollTo = window.scrollTo.bind(window)
  window.routeScrolls = []
  window.scrollTo = (...args) => {
   scrollTo(...args)
   if (typeof args[0] === 'object') {
    window.routeScrolls.push({ path: location.pathname, behavior: args[0].behavior, top: args[0].top, actual: scrollY })
   }
  }
 })
})

async function expectInstantPosition(page, path, top) {
 // The URL changes before the outgoing page has finished its short fade.
 // Wait for the actual restoration call, not an outgoing page at the same Y.
 await expect.poll(() => page.evaluate(path => window.routeScrolls.filter(item => item.path === path).at(-1)?.actual, path)).toBeCloseTo(top, 0)
 await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(top, 0)
 const scroll = await page.evaluate(path => window.routeScrolls.filter(item => item.path === path).at(-1), path)
 expect(scroll.behavior).toBe('instant')
 expect(scroll.actual).toBeCloseTo(top, 0)
}

async function clickAndReadDeparturePosition(page, link) {
 // Record the click itself: Playwright may scroll again after waiting for a
 // moving card to settle. That final position is what history must restore.
 await link.evaluate(element => element.addEventListener('click', () => {
  window.departureScrollY = window.scrollY
 }, { once: true, capture: true }))
 await link.click()
 return page.evaluate(() => window.departureScrollY)
}

for (const width of [1440, 390]) {
 for (const source of ['/', '/products?category=drinkware&q=glass#catalogue']) {
  test(`product return restores ${source} at ${width}px, including after reload`, async ({ page }) => {
   await page.setViewportSize({ width, height: 900 })
   await openPage(page, source)
   const link = page.locator('.product-card').last().getByRole('link', { name: 'View collection', exact: true })
   await link.scrollIntoViewIfNeeded()
   const detail = await link.getAttribute('href')
   const position = await clickAndReadDeparturePosition(page, link)
   expect(position).toBeGreaterThan(0)
   await expect(page).toHaveURL(detail)
   await expectInstantPosition(page, detail, 0)
   await page.reload()
   await ensureEnglish(page)
   await expect(page.locator('.back-link')).toHaveAttribute('href', source)
   await page.locator('.back-link').click()
   await expect(page).toHaveURL(source)
   await expectInstantPosition(page, source.split('?')[0], position)
   if (source.startsWith('/products')) {
    await expect(page.locator('#catalogue-search')).toHaveValue('glass')
    await expect(page.getByRole('button', { name: 'Drinkware', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.product-card')).toHaveCount(2)
   }
  })
 }
}

test('browser back restores the catalogue position immediately', async ({ page }) => {
 await openPage(page, '/products')
 const link = page.locator('.product-card').last().locator('.product-image-link')
 await link.scrollIntoViewIfNeeded()
 const position = await clickAndReadDeparturePosition(page, link)
 await expect(page).toHaveURL(/\/product\/kitchen-lid-racks$/)
 await page.goBack()
 await expect(page).toHaveURL('/products')
 await expectInstantPosition(page, '/products', position)
})

test('a product visit without a catalogue origin returns to the catalogue without animation', async ({ page }) => {
 await openPage(page, '/product/heart-coffee-cups')
 await page.locator('.back-link').click()
 await expect(page).toHaveURL('/products#catalogue')
 await expect.poll(() => page.evaluate(() => window.routeScrolls.some(item => item.path === '/products'))).toBe(true)
 const scroll = await page.evaluate(() => window.routeScrolls.filter(item => item.path === '/products').at(-1))
 expect(scroll.behavior).toBe('instant')
 expect(scroll.actual).toBeCloseTo(scroll.top, 0)
 await expect(page.locator('#catalogue-search')).toBeInViewport()
})
