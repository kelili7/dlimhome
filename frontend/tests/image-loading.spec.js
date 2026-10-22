import { test, expect } from '@playwright/test'

const cases = [
  ['/products', '.page-hero figure', '.page-hero figure img'],
  ['/', '#craft .weight-loss-image', '#craft .weight-loss-image'],
  ['/contact/join-us', '.workplace-gallery > figure', '.workplace-gallery img'],
]

for (const width of [390, 1366]) {
  for (const [path, targetSelector, imageSelector] of cases) {
    test(`image waits for loading before a continuous entrance: ${path} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 977 })
      let release
      const gate = new Promise(resolve => { release = resolve })
      await page.route('**/images/**', async route => {
        if (route.request().resourceType() === 'image') await gate
        await route.continue()
      })
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      const target = page.locator(targetSelector).first()
      const image = page.locator(imageSelector).first()
      await target.scrollIntoViewIfNeeded()
      // Longer than the entrance: loading must not consume the animation.
      await page.waitForTimeout(1100)
      expect(await image.evaluate(el => el.complete)).toBe(false)
      await expect(target).toHaveCSS('opacity', '0')
      await target.evaluate(el => {
        window.imageSamples = []
        const sample = () => {
          const style = getComputedStyle(el)
          window.imageSamples.push({ opacity: Number(style.opacity), y: new DOMMatrixReadOnly(style.transform).m42 })
          window.imageFrame = requestAnimationFrame(sample)
        }
        sample()
      })
      release()
      await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true)
      await expect(target).toHaveCSS('transform', 'none')
      await page.waitForTimeout(150)
      const samples = await page.evaluate(() => { cancelAnimationFrame(window.imageFrame); return window.imageSamples })
      expect(samples.some(s => s.opacity > 0 && s.opacity < 0.95 && s.y > 5)).toBe(true)
      for (let i = 1; i < samples.length; i++) {
        expect(samples[i].opacity).toBeGreaterThanOrEqual(samples[i - 1].opacity)
        expect(samples[i].y).toBeLessThanOrEqual(samples[i - 1].y + 0.01)
      }
      await expect(target).toHaveCSS('opacity', '1')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    })
  }
}

test('loaded images wait for decoding, and reduced motion cancels that wait', async ({ page }) => {
  await page.addInitScript(() => {
    const decode = HTMLImageElement.prototype.decode
    const gate = new Promise(resolve => { window.releaseDecode = resolve })
    HTMLImageElement.prototype.decode = async function () {
      await decode.call(this)
      await gate
    }
  })
  await page.goto('/products')
  const figure = page.locator('.page-hero figure')
  expect(await figure.locator('img').evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true)
  await page.waitForTimeout(1000)
  await expect(figure).toHaveCSS('opacity', '0')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(figure).toHaveCSS('opacity', '1')
  await expect(figure).toHaveCSS('transform', 'none')
  await page.evaluate(() => window.releaseDecode())
  await page.waitForTimeout(300)
  await expect(figure).toHaveCSS('opacity', '1')
  await expect(figure).toHaveCSS('transform', 'none')
})

test('failed images do not leave their figure permanently hidden', async ({ page }) => {
  await page.route('**/images/ceramics/dining.jpg', route => route.abort())
  await page.goto('/products')
  const figure = page.locator('.page-hero figure')
  await expect(figure).toHaveCSS('opacity', '1')
  await expect(figure).toHaveCSS('transform', 'none')
  expect(await figure.locator('img').evaluate(el => el.complete && el.naturalWidth === 0)).toBe(true)
})

test('navigating away during image loading cancels the pending entrance', async ({ page }) => {
  let release
  const gate = new Promise(resolve => { release = resolve })
  await page.route('**/images/ceramics/dining.jpg', async route => { await gate; await route.continue() })
  await page.goto('/products', { waitUntil: 'domcontentloaded' })
  await page.locator('.page-hero figure').waitFor({ state: 'attached' })
  await page.evaluate(() => { window.oldFigure = document.querySelector('.page-hero figure') })
  await page.locator('.desktop-nav a[href="/factory"]').click()
  await expect(page).toHaveURL('/factory')
  await expect(page.locator('.page-hero figure')).toHaveCSS('transform', 'none')
  const afterUnmount = await page.evaluate(() => window.oldFigure.getAttribute('style'))
  release()
  await page.waitForTimeout(1000)
  expect(await page.evaluate(() => window.oldFigure.getAttribute('style'))).toBe(afterUnmount)
  expect(await page.evaluate(async () => {
    const { gsap, ScrollTrigger } = await import('/src/motion/gsap.js')
    return ScrollTrigger.getAll().some(t => !t.trigger.isConnected)
      || gsap.globalTimeline.getChildren().some(t => t.targets?.().some(el => el.nodeType === 1 && !el.isConnected))
  })).toBe(false)
})
