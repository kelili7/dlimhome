import { test, expect } from '@playwright/test'

const pages = [
  ['/', 5], ['/products', 1], ['/factory', 4], ['/about', 6],
  ['/support', 5], ['/contact/business-enquiry', 3], ['/contact/join-us', 1],
]

for (const locale of ['zh', 'en']) {
  for (const [path, count] of pages) {
    test(`annotated titles animate and keep accessible names: ${locale} ${path}`, async ({ page }) => {
      await page.addInitScript(value => localStorage.setItem('dlim-locale', value), locale)
      await page.goto(path)
      const headings = page.locator('[data-split-text]')
      await expect(headings).toHaveCount(count)
      for (const heading of await headings.all()) {
        await heading.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
        await expect(heading).toHaveAttribute('data-split-state', 'complete', { timeout: 8000 })
        const label = await heading.getAttribute('aria-label')
        expect(label.length).toBeGreaterThan(4)
        await expect(heading).toHaveAccessibleName(label)
        expect(await heading.locator('.split-char').count()).toBeGreaterThan(4)
        expect(await heading.locator('.split-char').evaluateAll(chars => chars.every(el => Number(getComputedStyle(el).opacity) === 1))).toBe(true)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    })
  }
}

for (const locale of ['zh', 'en']) {
  test(`mobile wrapping, explicit newlines and live reduced motion: ${locale}`, async ({ page }) => {
    test.setTimeout(60000)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(value => localStorage.setItem('dlim-locale', value), locale)
    for (const [path, count] of pages) {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(path)
      const headings = page.locator('[data-split-text]')
      await expect(headings).toHaveCount(count)
      const original = await headings.evaluateAll(elements => elements.map(el => ({ text: el.textContent, height: el.offsetHeight })))
      await expect(page.locator('.split-char')).toHaveCount(0)
      // A fresh mount with motion enabled should preserve each heading's geometry.
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.reload()
      await expect(page.locator('.split-char').first()).toBeAttached()
      const animated = await headings.evaluateAll(elements => elements.map(el => ({ text: el.getAttribute('aria-label'), height: el.offsetHeight })))
      expect(animated).toEqual(original)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await expect(page.locator('.split-char')).toHaveCount(0)
      expect(await headings.evaluateAll(elements => elements.map(el => ({ text: el.textContent, height: el.offsetHeight })))).toEqual(original)
    }
  })
}

test('locale changes, route reveal and repeated navigation release old text and triggers', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await page.getByRole('button', { name: 'Switch to Chinese', exact: true }).click()
  await expect(page.locator('#hero-title')).toHaveAccessibleName('把日常， 过成美好。')
  await page.getByRole('button', { name: '切换至英文', exact: true }).click()
  await expect(page.locator('#hero-title')).toHaveAccessibleName('Considered ceramics. Made for living.')
  for (const path of ['/factory', '/about', '/products']) {
    await page.locator(`.desktop-nav a[href="${path}"]`).click()
    await expect(page.locator('main')).toHaveCSS('clip-path', 'none')
    await expect(page.locator('h1')).toHaveAttribute('data-split-state', 'playing')
    await expect(page.locator('h1')).toHaveAttribute('data-split-state', 'complete', { timeout: 8000 })
  }
  expect(await page.evaluate(async () => {
    const { ScrollTrigger } = await import('/src/motion/gsap.js')
    return ScrollTrigger.getAll().filter(trigger => !trigger.trigger?.isConnected).length
  })).toBe(0)
  expect(errors).toEqual([])
})

test('homepage text and its content block start together', async ({ page }) => {
  await page.goto('/')
  const heading = page.locator('#products-title')
  await expect.poll(() => heading.evaluate(async el => {
    const { ScrollTrigger } = await import('/src/motion/gsap.js')
    return ScrollTrigger.getAll().some(trigger => trigger.trigger === el.closest('[data-animated-content]'))
  })).toBe(true)
  const timings = await heading.evaluate(async el => {
    const parent = el.closest('[data-animated-content]')
    const { ScrollTrigger } = await import('/src/motion/gsap.js')
    const trigger = ScrollTrigger.getAll().find(trigger => trigger.trigger === parent)
    // Stop just after the block's trigger, before the child's own -100px offset.
    scrollTo({ top: trigger.start + 3, behavior: 'instant' })
    let blockStart, textStart
    for (let i = 0; i < 120; i++) {
      await new Promise(requestAnimationFrame)
      if (Number(getComputedStyle(parent).opacity) > 0 && blockStart == null) blockStart = performance.now()
      if (el.dataset.splitState === 'playing' && textStart == null) textStart = performance.now()
      if (blockStart != null && textStart != null) break
    }
    return { blockStart, textStart }
  })
  expect(timings.blockStart).toBeDefined()
  expect(timings.textStart).toBeDefined()
  expect(Math.abs(timings.textStart - timings.blockStart)).toBeLessThan(100)
})
