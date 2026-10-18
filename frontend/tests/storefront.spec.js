import { test, expect } from '@playwright/test'

test('landing page renders all sections and local images without runtime errors', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Compounded Semaglutide for Weight Loss')
  await expect(page.locator('main > section')).toHaveCount(7)
  await expect(page.locator('.product-card')).toHaveCount(3)
  await expect(page.locator('.science-badge')).toHaveCount(6)
  await expect(page.locator('.guide-card')).toHaveCount(4)
  for (const section of await page.locator('main > section').all()) await section.scrollIntoViewIfNeeded()
  await page.locator('footer').scrollIntoViewIfNeeded()
  // Inactive carousel slides intentionally defer loading. Verify their assets too.
  await page.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager' }))
  await expect.poll(() => page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src))).toEqual([])
  expect(errors).toEqual([])
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({ path: testInfo.outputPath('desktop.png'), animations: 'disabled' })
  await page.screenshot({ path: testInfo.outputPath('full-page.png'), fullPage: true, animations: 'disabled' })
})

test('marquees loop in opposite directions at the specified speed', async ({ page }) => {
  await page.goto('/')
  const tracks = page.locator('.marquee-track')
  const animations = await tracks.evaluateAll(items => items.map(item => { const s = getComputedStyle(item); return { name: s.animationName, duration: s.animationDuration, timing: s.animationTimingFunction, repeat: s.animationIterationCount, height: item.getBoundingClientRect().height } }))
  expect(animations.map(a => a.name)).toEqual(['marquee', 'marquee-reverse'])
  expect(animations.every(a => a.duration === '30s' && a.timing === 'linear' && a.repeat === 'infinite')).toBe(true)
  const initial = await tracks.first().evaluate(el => getComputedStyle(el).transform)
  await expect.poll(() => tracks.first().evaluate(el => getComputedStyle(el).transform)).not.toBe(initial)
  for (const track of await tracks.all()) {
    const groups = track.locator('.marquee-group')
    expect(await groups.nth(0).innerHTML()).toBe(await groups.nth(1).innerHTML())
    const heights = await groups.evaluateAll(items => items.map(el => el.getBoundingClientRect().height))
    expect(heights[0]).toBeCloseTo(heights[1], 2)
  }
  const login = page.getByRole('button', { name: 'Login', exact: true })
  await login.hover()
  await expect(login).toHaveCSS('animation-duration', '0.8s')
  await expect(login).toHaveCSS('animation-name', 'gradient-shift')
})

test('carousel supports buttons, wrapping, dots and keyboard', async ({ page }) => {
  await page.goto('/')
  const slides = page.locator('.carousel-slide')
  await expect(slides.nth(0)).toHaveAttribute('aria-hidden', 'false')
  await page.getByRole('button', { name: 'Next program' }).click()
  await expect(slides.nth(1)).toHaveAttribute('aria-hidden', 'false')
  await expect(slides.nth(0)).toHaveAttribute('inert', '')
  await page.getByRole('button', { name: 'Previous program' }).click()
  await page.getByRole('button', { name: 'Previous program' }).click()
  await expect(slides.nth(2)).toHaveAttribute('aria-hidden', 'false')
  await page.getByRole('button', { name: 'Show Hair Growth Serum' }).click()
  await expect(slides.nth(1)).toHaveAttribute('aria-hidden', 'false')
  await page.keyboard.press('ArrowRight')
  await expect(slides.nth(2)).toHaveAttribute('aria-hidden', 'false')
})

test('FAQ opens one answer, closes it, and supports keyboard focus', async ({ page }) => {
  await page.goto('/#faq')
  const questions = page.locator('.faq-trigger')
  await questions.nth(0).click()
  await expect(questions.nth(0)).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#faq-panel-0')).toBeVisible()
  await questions.nth(1).click()
  await expect(questions.nth(0)).toHaveAttribute('aria-expanded', 'false')
  await expect(questions.nth(1)).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('ArrowDown')
  await expect(questions.nth(2)).toBeFocused()
  await page.keyboard.press('End')
  await expect(questions.nth(4)).toBeFocused()
  await page.keyboard.press('Home')
  await expect(questions.nth(0)).toBeFocused()
  await questions.nth(1).click()
  await expect(questions.nth(1)).toHaveAttribute('aria-expanded', 'false')
})

test('product links support direct loads, back navigation and unknown routes', async ({ page }) => {
  await page.goto('/')
  await page.locator('.product-card').first().getByRole('link', { name: 'Get Started', exact: true }).click()
  await expect(page).toHaveURL(/\/product\/semaglutide$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Weight Loss Program')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Weight Loss Program')
  await page.getByRole('link', { name: 'Back to all products' }).click()
  await expect(page).toHaveURL(/\/#products$/)
  await page.goto('/product/missing')
  await expect(page.getByRole('heading', { name: 'Page not found.' })).toBeVisible()
})

test('dialog traps focus and returns focus when dismissed', async ({ page }) => {
  await page.goto('/')
  const login = page.getByRole('button', { name: 'Login', exact: true })
  await login.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Got it' }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(login).toBeFocused()
})

test('newsletter validates input and clearly reports a local preview', async ({ page }) => {
  await page.goto('/')
  const input = page.getByRole('textbox', { name: 'Email address' })
  await input.fill('invalid')
  await page.getByRole('button', { name: 'Subscribe to newsletter' }).click()
  await expect(page.getByText('Preview only — your email has not been submitted.')).toHaveCount(0)
  await input.fill('preview@example.com')
  await page.getByRole('button', { name: 'Subscribe to newsletter' }).click()
  await expect(page.getByText('Preview only — your email has not been submitted.')).toBeVisible()
})

for (const width of [320, 390, 768]) {
  test(`responsive layout at ${width}px has no horizontal overflow`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    if (width === 390) {
      for (const section of await page.locator('main > section').all()) await section.scrollIntoViewIfNeeded()
      await page.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager' }))
      await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true, animations: 'disabled' })
    }
    await expect(page.locator('.hero-marquees')).toBeHidden()
    await expect(page.locator('.desktop-nav')).toBeHidden()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.locator('footer').scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
}

test('reduced motion turns off continuous effects', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.marquee-track').first()).toHaveCSS('animation-name', 'none')
  const login = page.getByRole('button', { name: 'Login', exact: true })
  await login.hover()
  await expect(login).toHaveCSS('animation-name', 'none')
})

test('health status degrades without blocking the storefront', async ({ page }) => {
  await page.route('**/api/health/', route => route.fulfill({ status: 503, body: '{}' }))
  await page.goto('/')
  await expect(page.getByText('后台服务暂未启动')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
