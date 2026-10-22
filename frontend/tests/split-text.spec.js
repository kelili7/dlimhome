import { test, expect } from '@playwright/test'

for (const locale of ['zh', 'en']) {
  test(`homepage title stays unsplit across motion preferences: ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(value => localStorage.setItem('dlim-locale', value), locale)
    await page.goto('/')
    const heading = page.locator('#hero-title')
    await expect(heading).toBeVisible()
    await expect(heading.locator('*')).toHaveCount(0)
    await expect(heading).toHaveCSS('opacity', '1')
    await expect(heading).toHaveCSS('transform', 'none')
    await expect(heading).toHaveCSS('white-space', 'pre-line')
    const original = await heading.evaluate(el => ({ text: el.textContent, height: el.offsetHeight }))
    expect(original.text.trim().length).toBeGreaterThan(4)
    await expect(heading).toHaveAccessibleName(original.text.replace(/\s+/g, ' ').trim())
    for (const reducedMotion of ['reduce', 'no-preference']) {
      await page.emulateMedia({ reducedMotion })
      expect(await heading.evaluate(el => ({ text: el.textContent, height: el.offsetHeight }))).toEqual(original)
      await expect(page.locator('[data-split-text], .split-char')).toHaveCount(0)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
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
    await expect(page.locator('h1')).toHaveCSS('opacity', '1')
    await expect(page.locator('h1')).toHaveCSS('transform', 'none')
    await expect(page.locator('[data-split-text]')).toHaveCount(0)
  }
  expect(await page.evaluate(async () => {
    const { ScrollTrigger } = await import('/src/motion/gsap.js')
    return ScrollTrigger.getAll().filter(trigger => !trigger.trigger?.isConnected).length
  })).toBe(0)
  expect(errors).toEqual([])
})

test('homepage content headings inherit one block entrance without a second character animation', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-animated-content] [data-split-text]')).toHaveCount(0)
  for (const id of ['products-title', 'craft-title', 'values-title', 'guides-title']) {
    const heading = page.locator(`#${id}`)
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toHaveCSS('opacity', '1')
    await expect(heading).toHaveCSS('transform', 'none')
    expect((await heading.textContent()).trim().length).toBeGreaterThan(4)
  }
})
