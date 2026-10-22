import { test, expect } from '@playwright/test'
import { openPage } from './helpers/navigation.js'

async function motionState(page) {
  return page.evaluate(async () => {
    const { gsap, ScrollTrigger } = await import('/src/motion/gsap.js')
    return {
      triggers: ScrollTrigger.getAll().length,
      detached: ScrollTrigger.getAll().filter(t => !t.trigger?.isConnected).length,
      active: gsap.globalTimeline.getChildren(true, true, false).filter(t => t.isActive()).length,
      pins: document.querySelectorAll('.pin-spacer').length,
    }
  })
}

test('content reveals fade in, preserve geometry, and settle without promoted layers', async ({ page }) => {
  await openPage(page, '/')
  await expect.poll(async () => (await motionState(page)).triggers).toBeGreaterThan(5)
  const card = page.locator('.guide-card').first()
  const before = await card.evaluate(el => ({ top: el.offsetTop, height: el.offsetHeight, width: el.offsetWidth }))
  await expect(card).toHaveCSS('opacity', '0')
  await card.scrollIntoViewIfNeeded()
  await expect(card).toHaveCSS('opacity', '1')
  await expect(card).toHaveCSS('transform', 'none')
  await expect.poll(() => card.evaluate(el => el.style.willChange)).toBe('')
  expect(await card.evaluate(el => ({ top: el.offsetTop, height: el.offsetHeight, width: el.offsetWidth }))).toEqual(before)
  expect((await motionState(page)).pins).toBe(0)
})

test('rapid navigation, history and missing products leave one live page and no stale triggers', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await openPage(page, '/')
  for (const path of ['/about', '/factory', '/products', '/about']) {
    await page.locator(`.desktop-nav a[href="${path}"]`).click()
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('main')).toHaveCSS('opacity', '1')
    await expect.poll(async () => (await motionState(page)).detached).toBe(0)
  }
  await page.evaluate(async () => {
    const router = document.querySelector('#app').__vue_app__.config.globalProperties.$router
    router.push('/factory')
    await new Promise(resolve => setTimeout(resolve, 30))
    router.push('/support')
    await new Promise(resolve => setTimeout(resolve, 30))
    await router.push('/product/missing')
  })
  await expect(page.locator('h1')).toHaveText('This page is still unwritten.')
  await expect(page.locator('main')).toHaveCSS('opacity', '1')
  await expect(page.locator('h1')).toHaveCSS('transform', 'none')
  await expect.poll(async () => (await motionState(page)).detached).toBe(0)
  expect(await page.evaluate(async () => {
    const { ScrollTrigger } = await import('/src/motion/gsap.js')
    // The 404 page now owns an entrance too; only its live trigger may remain.
    return ScrollTrigger.getAll().every(t => t.trigger.closest('main') === document.querySelector('main.not-found'))
  })).toBe(true)
  expect(errors).toEqual([])
})

test('live reduced motion restores content and removes all GSAP work', async ({ page }) => {
  await openPage(page, '/')
  await expect.poll(async () => (await motionState(page)).triggers).toBeGreaterThan(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(async () => (await motionState(page)).triggers).toBe(0)
  await expect.poll(async () => (await motionState(page)).active).toBe(0)
  await expect(page.locator('h1')).toHaveCSS('opacity', '1')
  await page.locator('.desktop-nav a[href="/about"]').click()
  await expect(page.locator('main')).toHaveCSS('opacity', '1')
  await expect(page.locator('h1')).toHaveCSS('transform', 'none')
  expect((await motionState(page)).triggers).toBe(0)
})

test('catalogue changes stay visible and do not accumulate detached triggers', async ({ page }) => {
  await openPage(page, '/products')
  await page.locator('#catalogue-search').scrollIntoViewIfNeeded()
  for (const query of ['glass', 'no-match', '', 'cup', '']) {
    await page.locator('#catalogue-search').fill(query)
    await expect.poll(async () => (await motionState(page)).detached).toBe(0)
  }
  await expect(page.locator('.product-card')).toHaveCount(8)
  for (const card of await page.locator('.product-card').all()) {
    await card.scrollIntoViewIfNeeded()
    await expect(card).toHaveCSS('opacity', '1')
  }
})

test('continuous marquee pauses outside the viewport', async ({ page }) => {
  await openPage(page, '/')
  const track = page.locator('.marquee-track').first()
  await expect(track).toHaveCSS('animation-play-state', 'running')
  await page.locator('#guides').scrollIntoViewIfNeeded()
  await expect(track).toHaveCSS('animation-play-state', 'paused')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(track).toHaveCSS('animation-play-state', 'running')
})

for (const reducedMotion of ['no-preference', 'reduce']) {
  test(`same-page anchors preserve history, offset and page instance: ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    await openPage(page, '/products?category=drinkware')
    await page.locator('main').evaluate(el => { window.originalMain = el })
    await page.locator('.page-hero a[href="#catalogue"]').click()
    await expect(page).toHaveURL('/products?category=drinkware#catalogue')
    await expect.poll(() => page.locator('#catalogue').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(110)
    expect(await page.locator('main').evaluate(el => el === window.originalMain)).toBe(true)
    await page.goBack()
    await expect(page).toHaveURL('/products?category=drinkware')
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  })
}

test('content and product detail entrances remain visible without a page wipe', async ({ page }) => {
  await openPage(page, '/')
  for (const path of ['/about', '/products']) {
    await page.locator(`.desktop-nav a[href="${path}"]`).click()
    await expect(page.locator('main')).toHaveCSS('clip-path', 'none')
    await expect(page.locator('h1')).toHaveCSS('opacity', '1')
  }
  await page.locator('.product-card a').first().click()
  await expect(page.locator('.product-gallery')).toBeVisible()
  await expect(page.locator('main')).toHaveCSS('clip-path', 'none')
  await expect(page.locator('h1')).toHaveCSS('opacity', '1')
})

test('responsive enquiry photograph keeps its layout and does not receive a second animation', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 })
  await openPage(page, '/contact/business-enquiry')
  const photo = page.locator('.enquiry-photo img')
  await page.locator('#enquiry').scrollIntoViewIfNeeded()
  for (const width of [1200, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    if (width >= 1024) await expect(photo).toBeVisible()
    else await expect(photo).toBeHidden()
    await expect(photo).toHaveCSS('clip-path', 'none')
    await expect(photo).toHaveCSS('transform', 'none')
    expect((await motionState(page)).detached).toBe(0)
  }
})

test('viewport changes do not restart the already displayed hero', async ({ page }) => {
  await openPage(page, '/')
  const heading = page.locator('h1')
  await expect(heading).toHaveCSS('transform', 'none')
  await expect.poll(async () => (await motionState(page)).triggers).toBeGreaterThan(5)
  await expect.poll(() => heading.evaluate(el => el.style.willChange)).toBe('')
  // Record every style write, including brief changes that a final-style assertion misses.
  await heading.evaluate(el => {
    window.heroMotionWrites = []
    window.heroMotionObserver = new MutationObserver(records => {
      for (const record of records) window.heroMotionWrites.push(record.oldValue || '')
      window.heroMotionWrites.push(el.getAttribute('style') || '')
    })
    window.heroMotionObserver.observe(el, { attributes: true, attributeFilter: ['style'], attributeOldValue: true })
  })
  for (const width of [900, 390, 1440]) {
    await page.setViewportSize({ width, height: 977 })
    await page.waitForTimeout(250)
  }
  const writes = await page.evaluate(() => {
    window.heroMotionObserver.disconnect()
    return window.heroMotionWrites
  })
  expect(writes.filter(style => /translate|opacity:\s*0|will-change:\s*transform/.test(style))).toEqual([])
})
