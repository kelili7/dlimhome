import { test, expect } from '@playwright/test'

const additions = [
 ['heart-coffee-cups', 'Heart Detail Coffee Cups', '爱心点缀咖啡杯系列', 'Ceramic'],
 ['amber-textured-glasses', 'Amber Footed Textured Glasses', '琥珀杯脚纹理杯系列', 'Glass'],
 ['amber-stem-glasses', 'Amber Stem Glassware', '琥珀杯脚高脚杯系列', 'Glass'],
 ['kitchen-lid-racks', 'Kitchen Lid & Utensil Racks', '厨房锅盖置物架系列', null],
]

test('all supplied photographs appear in both seamless marquee copies', async ({ page }) => {
 await page.goto('/')
 for (const [handle] of additions) {
  const images = page.locator(`.hero-marquees img[src="/images/products/${handle}.jpg"]`)
  await expect(images).toHaveCount(2)
  for (const img of await images.all()) {
   await expect.poll(() => img.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true)
   await expect(img).toHaveCSS('object-fit', 'contain')
  }
 }
})

test('new categories, bilingual search and collection links work', async ({ page }, testInfo) => {
 await page.goto('/products#catalogue')
 await expect(page.locator('.product-card')).toHaveCount(8)
 await page.getByRole('button', { name: 'Drinkware', exact: true }).click()
 await expect(page.locator('.product-card')).toHaveCount(3)
 await page.getByRole('button', { name: 'Switch to Chinese' }).click()
 await expect(page.getByRole('button', { name: '杯具系列' })).toHaveAttribute('aria-pressed', 'true')
 await page.locator('#catalogue-search').fill('琥珀')
 await expect(page.locator('.product-card')).toHaveCount(2)
 await page.reload()
 await expect(page.locator('.product-card')).toHaveCount(2)
 await page.getByRole('button', { name: '清除筛选' }).click()
 await page.getByRole('button', { name: '厨房配件', exact: true }).click()
 await expect(page.locator('.product-card h3')).toHaveText('厨房锅盖置物架系列')
 await page.getByRole('link', { name: '查看产品', exact: true }).click()
 await expect(page).toHaveURL(/\/product\/kitchen-lid-racks$/)
 await page.goto('/products#catalogue')
 await page.locator('img').evaluateAll(imgs => imgs.forEach(img => { img.loading = 'eager' }))
 await expect.poll(() => page.locator('img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true)
 await page.screenshot({ path: testInfo.outputPath('expanded-catalogue-desktop.png'), fullPage: true, animations: 'disabled' })
 await page.setViewportSize({ width: 390, height: 844 })
 await page.screenshot({ path: testInfo.outputPath('expanded-catalogue-mobile.png'), fullPage: true, animations: 'disabled' })
})

for (const [handle, title, zhTitle, material] of additions) {
 test(`${handle} loads its image, correct material and enquiry context`, async ({ page }) => {
  await page.goto(`/product/${handle}`)
  await expect(page.locator('h1')).toHaveText(title)
  const photo = page.locator('.product-gallery > img')
  await expect(photo).toHaveAttribute('src', `/images/products/${handle}.jpg`)
  await expect.poll(() => photo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
  await expect(photo).toHaveCSS('object-fit', 'contain')
  if (material) await expect(page.locator('.product-specs > div').filter({ has: page.locator('dt', { hasText: /^Material$/ }) }).locator('dd')).toHaveText(material)
  else await expect(page.locator('.product-specs dt', { hasText: /^Material$/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Switch to Chinese' }).click()
  await expect(page.locator('h1')).toHaveText(zhTitle)
  for (const width of [320, 390, 768]) {
   await page.setViewportSize({ width, height: 844 })
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.locator('.product-enquire').click()
  await expect(page.locator('.selected-product')).toContainText(zhTitle)
  await expect(page.locator('select[name=interest]')).toHaveValue('1')
 })
}
