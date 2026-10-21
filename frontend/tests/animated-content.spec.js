import { test, expect } from '@playwright/test'
import { openPage } from './helpers/navigation.js'

async function mountExample(page, props = {}, customScroller = false) {
  await page.evaluate(async ({ props, customScroller }) => {
    // Use Vite's current dependency URL, including its optimizer version.
    const entry = await (await fetch('/src/main.js')).text()
    const vueUrl = entry.match(/from ["']([^"']+vue\.js[^"']*)["']/)[1]
    const { createApp, h, reactive } = await import(vueUrl)
    const { default: AnimatedContent } = await import('/src/components/AnimatedContent.vue')
    const host = document.createElement('div')
    host.id = 'animated-content-test'
    host.style.cssText = 'position:fixed;inset:120px 20px auto;z-index:1000;background:white;max-height:240px;overflow:auto'
    document.body.append(host)
    window.acEvents = []
    window.acProps = reactive(props)
    window.acApp = createApp({
      render: () => h('div', [
        ...(customScroller ? [h('div', { style: 'height:400px' })] : []),
        h(AnimatedContent, {
          ...window.acProps,
          ...(customScroller ? { container: '#animated-content-test' } : {}),
          onComplete: () => window.acEvents.push('complete'),
          onDisappearanceComplete: () => window.acEvents.push('disappear'),
        }, () => h('button', { style: 'height:60px' }, 'Animation test')),
        h('div', { style: 'height:400px' }),
      ]),
    })
    window.acApp.mount(host)
    const style = getComputedStyle(host.querySelector('[data-animated-content]'))
    window.acMountState = { opacity: Number(style.opacity), x: new DOMMatrixReadOnly(style.transform).m41 }
  }, { props, customScroller })
  return page.locator('#animated-content-test [data-animated-content]')
}

for (const width of [390, 768, 1440]) {
test(`homepage uses a single entrance per block and preserves layout at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 })
  await openPage(page, '/')
  await expect(page.locator('[data-animated-content]')).toHaveCount(4)
  const block = page.locator('.weight-loss-content')
  await expect.poll(() => block.evaluate(el => getComputedStyle(el).transform)).not.toBe('none')
  await expect.poll(() => block.evaluate(async el => {
    const { ScrollTrigger } = await import('/src/motion/gsap.js')
    return ScrollTrigger.getAll().filter(t => t.trigger === el).length
  })).toBe(1)
  await expect(block).toHaveCSS('opacity', '0')
  expect(await block.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)).toBe(100)
  const before = await block.evaluate(el => [el.offsetWidth, el.offsetHeight])
  await block.scrollIntoViewIfNeeded()
  await expect(block).toHaveCSS('transform', 'none')
  await expect(block).toHaveCSS('opacity', '1')
  expect(await block.evaluate(el => [el.offsetWidth, el.offsetHeight])).toEqual(before)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `/tmp/dlim-animated-content-${width}.png` })
})
}

test('mount parameters, callbacks and delayed disappearance work and unmount cleans up', async ({ page }) => {
  await openPage(page, '/')
  const block = await mountExample(page, {
    trigger: 'mount', direction: 'horizontal', reverse: true, distance: 40,
    scale: 0.9, duration: 0.15, delay: 0.3, disappearAfter: 0.3, disappearDuration: 0.15,
  })
  expect(await page.evaluate(() => window.acMountState)).toEqual({ opacity: 0, x: -40 })
  await expect(block).toHaveCSS('opacity', '0')
  expect(await block.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)).toBeLessThan(0)
  await expect.poll(() => page.evaluate(() => window.acEvents)).toEqual(['complete', 'disappear'])
  await expect(block).toHaveCSS('opacity', '0')
  await page.evaluate(() => window.acApp.unmount())
  expect(await page.evaluate(async () => {
    const { gsap, ScrollTrigger } = await import('/src/motion/gsap.js')
    return ScrollTrigger.getAll().some(t => !t.trigger.isConnected)
      || gsap.globalTimeline.getChildren().some(t => t.targets?.().some(el => el.nodeType === 1 && !el.isConnected))
  })).toBe(false)
})

test('custom scroller triggers entry, focus cancels disappearance, and prop updates clean up', async ({ page }) => {
  await openPage(page, '/')
  const block = await mountExample(page, { duration: 0.15, disappearAfter: 0.3 }, true)
  await expect(block).toHaveCSS('opacity', '0')
  await page.locator('#animated-content-test').evaluate(el => { el.scrollTop = 350 })
  await expect.poll(() => page.evaluate(() => window.acEvents)).toEqual(['complete'])
  await block.locator('button').focus()
  await page.waitForTimeout(900)
  await expect(block).toHaveCSS('opacity', '1')
  await expect(block).toHaveCSS('transform', 'none')
  expect(await page.evaluate(() => window.acEvents)).toEqual(['complete'])
  await page.evaluate(() => { window.acProps.distance = 80 })
  await expect(block).toHaveCSS('opacity', '1')
})

test('live reduced motion restores delayed content and prevents disappearance', async ({ page }) => {
  await openPage(page, '/')
  const block = await mountExample(page, { trigger: 'mount', delay: 5, disappearAfter: 0.1 })
  await expect(block).toHaveCSS('opacity', '0')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(block).toHaveCSS('opacity', '1')
  await expect(block).toHaveCSS('transform', 'none')
  await page.waitForTimeout(300)
  expect(await page.evaluate(() => window.acEvents)).toEqual(['complete'])
})

test('unmount cancels a pending departure callback and releases its tween', async ({ page }) => {
  await openPage(page, '/')
  const block = await mountExample(page, { trigger: 'mount', duration: 0.1, disappearAfter: 0.4 })
  await expect.poll(() => page.evaluate(() => window.acEvents)).toEqual(['complete'])
  await block.evaluate(el => { window.acRemovedElement = el })
  await page.evaluate(() => window.acApp.unmount())
  await page.waitForTimeout(1000)
  expect(await page.evaluate(async () => {
    const { gsap } = await import('/src/motion/gsap.js')
    return gsap.getTweensOf(window.acRemovedElement).length
  })).toBe(0)
  expect(await page.evaluate(() => window.acEvents)).toEqual(['complete'])
})

for (const width of [390, 1440]) {
  test(`official fade and 100px slide stay synchronized and do not replay at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await openPage(page, '/')
    const block = page.locator('#values .section-heading')
    await expect(block).toHaveCSS('opacity', '0')
    await expect.poll(() => block.evaluate(async el => {
      const { ScrollTrigger } = await import('/src/motion/gsap.js')
      return ScrollTrigger.getAll().filter(t => t.trigger === el).length
    })).toBe(1)
    const samples = await block.evaluate(async el => {
      const { ScrollTrigger } = await import('/src/motion/gsap.js')
      const trigger = ScrollTrigger.getAll().find(t => t.trigger === el)
      window.scrollTo({ top: trigger.start + 30, behavior: 'instant' })
      const samples = []
      const start = performance.now()
      while (performance.now() - start < 1000) {
        await new Promise(requestAnimationFrame)
        const style = getComputedStyle(el)
        samples.push({ opacity: Number(style.opacity), y: new DOMMatrixReadOnly(style.transform).m42 })
      }
      return samples
    })
    expect(samples.some(s => s.opacity > 0 && s.opacity < 0.9 && s.y > 10)).toBe(true)
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i].opacity).toBeGreaterThanOrEqual(samples[i - 1].opacity)
      expect(Math.abs(samples[i].y - 100 * (1 - samples[i].opacity))).toBeLessThan(0.1)
    }
    await expect(block).toHaveCSS('opacity', '1')
    await expect(block).toHaveCSS('transform', 'none')
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.setViewportSize({ width: width === 390 ? 768 : 1366, height: 844 })
    await block.scrollIntoViewIfNeeded()
    await expect(block).toHaveCSS('opacity', '1')
    await expect(block).toHaveCSS('transform', 'none')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('returning home does not cover AnimatedContent with the legacy route wipe', async ({ page }) => {
  await openPage(page, '/about')
  await page.locator('.desktop-nav a[href="/"]').click()
  await expect(page.locator('[data-animated-content]')).toHaveCount(4)
  const clips = await page.locator('main').evaluate(async el => {
    const clips = []
    const start = performance.now()
    while (performance.now() - start < 1000) {
      clips.push(getComputedStyle(el).clipPath)
      await new Promise(requestAnimationFrame)
    }
    return clips
  })
  expect(clips.every(value => value === 'none')).toBe(true)
})
