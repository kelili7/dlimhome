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

test('scroll reveals complete, preserve geometry, and release promoted layers', async ({ page }) => {
  await openPage(page, '/')
  await expect.poll(async () => (await motionState(page)).triggers).toBeGreaterThan(5)
  const card = page.locator('.guide-card').first()
  const before = await card.evaluate(el => ({ top: el.offsetTop, height: el.offsetHeight, width: el.offsetWidth }))
  await card.evaluate(el => {
    // Record the transient promotion before Playwright waits for scrolling to
    // settle; polling afterwards can miss a short animation under CPU load.
    const observer = new MutationObserver(() => {
      if (el.style.willChange === 'transform') {
        el.dataset.promotionSeen = 'true'
        observer.disconnect()
      }
    })
    observer.observe(el, { attributes: true, attributeFilter: ['style'] })
  })
  await card.scrollIntoViewIfNeeded()
  await expect(card).toHaveAttribute('data-promotion-seen', 'true')
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
  await expect.poll(async () => (await motionState(page)).triggers).toBe(0)
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

test('text entrances start with page content; other pages retain the interruptible wipe', async ({ page }) => {
  await openPage(page, '/')
  await page.locator('.desktop-nav a[href="/about"]').click()
  await expect(page.locator('main')).toHaveCSS('clip-path', 'none')
  await expect(page.locator('h1')).toHaveAttribute('data-split-state', 'playing')
  await expect(page.locator('.page-hero .lead')).toHaveCSS('opacity', '1')
  await page.locator('.desktop-nav a[href="/products"]').click()
  await expect(page.locator('main')).toHaveCSS('clip-path', 'none')
  await page.locator('.product-card a').first().click()
  const main = page.locator('main')
  await expect(main).not.toHaveCSS('clip-path', 'none')
  await page.mouse.wheel(0, 80)
  await expect(main).toHaveCSS('clip-path', 'none', { timeout: 500 })
  await expect.poll(() => main.evaluate(el => el.style.willChange)).toBe('')
})

test('resizing reinitializes depth for photographs revealed by desktop layout', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 })
  await openPage(page, '/contact/business-enquiry')
  const photo = page.locator('.enquiry-photo img')
  await expect(photo).toBeHidden()
  for (const width of [1200, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    if (width >= 1024) {
      await expect(photo).toBeVisible()
      await expect(photo).not.toHaveCSS('clip-path', 'none')
      await expect.poll(() => photo.evaluate(async el => {
        const { ScrollTrigger } = await import('/src/motion/gsap.js')
        return ScrollTrigger.getAll().filter(t => t.vars.id?.startsWith('dlim-depth-') && t.animation.targets().includes(el)).length
      })).toBe(1)
    } else {
      await expect(photo).toBeHidden()
      await expect(photo).toHaveCSS('clip-path', 'none')
      await expect(photo).toHaveCSS('transform', 'none')
    }
    expect((await motionState(page)).detached).toBe(0)
  }
})

for (const width of [390, 1440]) {
  test(`photographic depth follows scroll inside original image bounds at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openPage(page, '/factory')
    const photo = page.locator('.page-hero figure > img')
    await expect(page.locator('main')).toHaveCSS('clip-path', 'none')
    await expect(photo).not.toHaveCSS('clip-path', 'none')
    const readPhoto = () => photo.evaluate(el => {
      const style = getComputedStyle(el)
      const transform = new DOMMatrixReadOnly(style.transform)
      const rect = el.getBoundingClientRect()
      const inset = style.clipPath.match(/inset\((.*?)\s+round/)?.[1].split(/\s+/).map(parseFloat)
      // The transformed rectangle minus the mask is the actual painted frame.
      return {
        y: transform.m42,
        frame: inset ? [rect.left + inset[1] * transform.a, rect.top + scrollY + inset[0] * transform.d,
          rect.width - inset[1] * 2 * transform.a, rect.height - (inset[0] + inset[2]) * transform.d]
          : [rect.left, rect.top + scrollY, rect.width, rect.height],
        layout: [el.offsetWidth, el.offsetHeight, el.parentElement.childElementCount],
      }
    })
    const before = await readPhoto()
    await page.evaluate(() => window.scrollTo({ top: 450, behavior: 'instant' }))
    await expect.poll(async () => (await readPhoto()).y).toBeLessThan(before.y - 0.2)
    const moving = await readPhoto()
    expect(moving.layout).toEqual(before.layout)
    moving.frame.forEach((value, index) => expect(Math.abs(value - before.frame[index])).toBeLessThan(1))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(photo).toHaveCSS('transform', 'none')
    await expect(photo).toHaveCSS('clip-path', 'none')
    await expect.poll(() => photo.evaluate(el => el.style.willChange)).toBe('')
    const staticPhoto = await readPhoto()
    staticPhoto.frame.forEach((value, index) => expect(Math.abs(value - before.frame[index])).toBeLessThan(1))
    expect(staticPhoto.layout).toEqual(before.layout)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

for (const width of [390, 1366]) {
  test(`legacy scroll content keeps full opacity when entering and revisiting at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 977 })
    await page.addInitScript(() => localStorage.setItem('dlim-locale', 'zh'))
    await openPage(page, '/')
    await expect(page.locator('main')).toHaveCSS('clip-path', 'none')
    await expect.poll(async () => (await motionState(page)).triggers).toBeGreaterThan(5)
    const samples = await page.evaluate(async () => {
      const elements = [...document.querySelectorAll('#products .product-card, #values .science-badge, #guides .guide-card')]
      const samples = elements.map(el => ({ label: el.className, minOpacity: 1, visibleFrames: 0 }))
      const end = Math.min(document.documentElement.scrollHeight - innerHeight,
        Math.ceil(document.querySelector('#guides').getBoundingClientRect().bottom + scrollY - innerHeight))
      for (const direction of [1, -1]) {
        for (let position = direction === 1 ? 0 : end;
          direction === 1 ? position <= end : position >= 0; position += direction * 100) {
          scrollTo({ top: position, behavior: 'instant' })
          await new Promise(requestAnimationFrame)
          elements.forEach((el, i) => {
            const rect = el.getBoundingClientRect()
            if (rect.bottom > 100 && rect.top < innerHeight) {
              samples[i].visibleFrames++
              samples[i].minOpacity = Math.min(samples[i].minOpacity, Number(getComputedStyle(el).opacity))
            }
          })
        }
      }
      return samples
    })
    for (const sample of samples) {
      expect(sample.visibleFrames, sample.label).toBeGreaterThan(0)
      expect(sample.minOpacity, sample.label).toBe(1)
    }
  })
}

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
