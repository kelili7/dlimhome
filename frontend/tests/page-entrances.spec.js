import { test, expect } from '@playwright/test'
import { openPage } from './helpers/navigation.js'

const cases = [
  ['/', '#craft > .two-columns > img.weight-loss-image'],
  ['/products', '#packaging .packaging-card'],
  ['/factory', 'img.editorial-image'],
  ['/about', 'img.editorial-image'],
  ['/support', 'img.editorial-image'],
  ['/contact/business-enquiry', '.contact-path'],
  ['/contact/join-us', '.workplace-gallery > figure'],
  ['/product/heart-coffee-cups', '.cta-panel > div'],
]

for (const width of [390, 1366]) {
  for (const [path, selector] of cases) {
    test(`content and images share the homepage entrance: ${path} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 977 })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await openPage(page, path)
      await expect(page.locator('[data-animated-content] [data-animated-content]')).toHaveCount(0)
      await expect(page.locator('[data-animated-content] [data-split-text]')).toHaveCount(0)
      const target = page.locator(selector).first()
      await expect(target).toHaveCSS('opacity', '0')
      const layout = await target.evaluate(el => [el.tagName, el.offsetWidth, el.offsetHeight])
      const samples = await target.evaluate(async el => {
        const { ScrollTrigger } = await import('/src/motion/gsap.js')
        const root = el.closest('[data-animated-content]')
        // The route's scroll restoration and trigger registration finish in two frames.
        for (let i = 0; i < 30 && !ScrollTrigger.getAll().some(t => t.trigger === root); i++) await new Promise(requestAnimationFrame)
        const triggers = ScrollTrigger.getAll().filter(t => t.trigger === root)
        if (triggers.length !== 1) throw new Error(`Expected one entrance, found ${triggers.length}`)
        window.scrollTo({ top: triggers[0].start + 15, behavior: 'instant' })
        const samples = []
        const start = performance.now()
        while (performance.now() - start < 1100) {
          await new Promise(requestAnimationFrame)
          const style = getComputedStyle(el)
          samples.push({ opacity: Number(style.opacity), y: new DOMMatrixReadOnly(style.transform).m42 })
        }
        return samples
      })
      expect(samples.some(s => s.opacity > 0 && s.opacity < 0.95 && s.y > 5)).toBe(true)
      for (const sample of samples) expect(Math.abs(sample.y - 100 * (1 - sample.opacity))).toBeLessThan(0.15)
      await expect(target).toHaveCSS('opacity', '1')
      await expect(target).toHaveCSS('transform', 'none')
      expect(await target.evaluate(el => [el.tagName, el.offsetWidth, el.offsetHeight])).toEqual(layout)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await target.scrollIntoViewIfNeeded()
      await expect(target).toHaveCSS('opacity', '1')
      await expect(target).toHaveCSS('transform', 'none')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect(errors).toEqual([])
      if (path === '/' || path === '/factory') await page.screenshot({ path: `/tmp/dlim-entrance-${path === '/' ? 'home' : 'factory'}-${width}.png` })
    })
  }
}

test('all page entrances immediately restore readable content with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [path] of cases) {
    await openPage(page, path)
    await expect(page.locator('h1')).toHaveCSS('opacity', '1')
    expect(await page.locator('[data-animated-content]').evaluateAll(elements => elements.every(root =>
      [root, ...root.children].every(el => getComputedStyle(el).opacity === '1')))).toBe(true)
    expect(await page.evaluate(async () => {
      const { ScrollTrigger } = await import('/src/motion/gsap.js')
      return ScrollTrigger.getAll().length
    })).toBe(0)
  }
})
