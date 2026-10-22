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
  await expect(page.locator('[data-animated-content]')).toHaveCount(11)
  const container = page.locator('.weight-loss-content')
  const block = container.locator(':scope > h2')
  await expect.poll(() => block.evaluate(el => getComputedStyle(el).transform)).not.toBe('none')
  await expect.poll(() => container.evaluate(async el => {
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
    const container = page.locator('#values .section-heading')
    const block = container.locator(':scope > h2')
    await expect(block).toHaveCSS('opacity', '0')
    await expect.poll(() => container.evaluate(async el => {
      const { ScrollTrigger } = await import('/src/motion/gsap.js')
      return ScrollTrigger.getAll().filter(t => t.trigger === el).length
    })).toBe(1)
    const samples = await container.evaluate(async el => {
      const { ScrollTrigger } = await import('/src/motion/gsap.js')
      const trigger = ScrollTrigger.getAll().find(t => t.trigger === el)
      window.scrollTo({ top: trigger.start + 30, behavior: 'instant' })
      const samples = []
      const start = performance.now()
      while (performance.now() - start < 1000) {
        await new Promise(requestAnimationFrame)
        const style = getComputedStyle(el.firstElementChild)
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
  await expect(page.locator('[data-animated-content]')).toHaveCount(11)
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

test('homepage Rise matches the official 0.08s child stagger and power3.out trajectory', async ({ page }) => {
  await openPage(page, '/')
  const result = await page.locator('.products-grid').evaluate(async el => {
    const { gsap, ScrollTrigger } = await import('/src/motion/gsap.js')
    const children = Array.from(el.children)
    const timeline = gsap.globalTimeline.getChildren(false, false, true).find(timeline =>
      timeline.getChildren(true, true, false).some(tween => tween.targets().includes(children[0])))
    const duration = timeline.duration()
    const samples = [0.04, 0.12, 0.4, 0.72].map(time => {
      timeline.pause(time)
      return { time, states: children.map(child => ({
        opacity: Number(getComputedStyle(child).opacity),
        y: new DOMMatrixReadOnly(getComputedStyle(child).transform).m42,
      })) }
    })
    const childTriggers = ScrollTrigger.getAll().filter(t => children.includes(t.trigger)).length
    return { duration, samples, childTriggers, count: children.length }
  })
  expect(result.duration).toBeCloseTo(0.8 + (result.count - 1) * 0.08, 5)
  expect(result.childTriggers).toBe(0) // No legacy batch entrance on the same cards.
  for (const sample of result.samples) {
    sample.states.forEach((state, index) => {
      const progress = Math.min(1, Math.max(0, (sample.time - index * 0.08) / 0.8))
      const opacity = 1 - (1 - progress) ** 4 // GSAP power3.out
      expect(state.opacity).toBeCloseTo(opacity, 3)
      expect(state.y).toBeCloseTo(100 * (1 - opacity), 2)
    })
  }
})

test('blur, rotate, tilt and wipe use the official start pose and clear after entry', async ({ page }) => {
  await openPage(page, '/')
  const block = await mountExample(page, {
    trigger: 'mount', delay: 0.5, duration: 0.2, blur: 12, rotate: 15, tilt: 60, wipe: 'up',
  })
  const pose = await block.evaluate(async el => {
    const { gsap } = await import('/src/motion/gsap.js')
    return { blur: getComputedStyle(el).filter, mask: getComputedStyle(el).maskImage,
      rotation: gsap.getProperty(el, 'rotation'), tilt: gsap.getProperty(el, 'rotationX'),
      perspective: gsap.getProperty(el, 'transformPerspective'), wipe: el.style.getPropertyValue('--ac-wipe') }
  })
  expect(pose.blur).toBe('blur(12px)')
  expect(pose.mask).toContain('linear-gradient')
  expect(pose.rotation).toBe(15)
  expect(pose.tilt).toBe(60)
  expect(pose.perspective).toBe(900)
  expect(pose.wipe).toBe('0')
  await expect.poll(() => page.evaluate(() => window.acEvents)).toEqual(['complete'])
  await expect(block).toHaveCSS('filter', 'none')
  await expect(block).toHaveCSS('mask-image', 'none')
  await expect(block).toHaveCSS('transform', 'none')
})

test('once=false reverses on leave and replays without scheduling disappearance', async ({ page }) => {
  await openPage(page, '/')
  const block = await mountExample(page, { once: false, duration: 0.15, wipe: 'up', disappearAfter: 0.1 }, true)
  const host = page.locator('#animated-content-test')
  await expect(block).toHaveCSS('opacity', '0')
  await host.evaluate(el => { el.scrollTop = 550 })
  await expect(block).toHaveCSS('opacity', '1')
  await host.evaluate(el => { el.scrollTop = 0 })
  await expect(block).toHaveCSS('opacity', '0')
  await expect(block).not.toHaveCSS('mask-image', 'none')
  await host.evaluate(el => { el.scrollTop = 550 })
  await expect(block).toHaveCSS('opacity', '1')
  await expect.poll(() => page.evaluate(() => window.acEvents)).toEqual(['complete', 'complete'])
  await page.waitForTimeout(700)
  await expect(block).toHaveCSS('opacity', '1')
})

test('scrub follows the custom scroller in both directions and ignores entry delay', async ({ page }) => {
  await openPage(page, '/')
  const block = await mountExample(page, { scrub: true, delay: 5, disappearAfter: 0.1 }, true)
  await expect.poll(() => block.evaluate(async el => {
    const { ScrollTrigger } = await import('/src/motion/gsap.js')
    return ScrollTrigger.getAll().some(t => t.trigger === el)
  })).toBe(true)
  for (const progress of [0.5, 1, 0]) {
    await block.evaluate(async (el, progress) => {
      const { ScrollTrigger } = await import('/src/motion/gsap.js')
      const trigger = ScrollTrigger.getAll().find(t => t.trigger === el)
      document.querySelector('#animated-content-test').scrollTop = trigger.start + (trigger.end - trigger.start) * progress
      ScrollTrigger.update()
    }, progress)
    const expected = 1 - (1 - progress) ** 4
    await expect.poll(() => block.evaluate(el => Number(getComputedStyle(el).opacity))).toBeCloseTo(expected, 2)
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(block).toHaveCSS('opacity', '1')
  await expect(block).toHaveCSS('transform', 'none')
})

for (const width of [390, 1366]) {
  test(`returning home replays the hero entrance without splitting text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 977 })
    for (const path of ['/products', '/about']) {
      await openPage(page, path)
      await page.evaluate(() => {
        window.heroSamples = new Promise(resolve => {
          const samples = []
          let started
          const read = () => {
            const heading = document.querySelector('#hero-title')
            if (heading && started == null) started = performance.now()
            if (heading) {
              const visual = document.querySelector('.hero-visual')
              const copyStyle = getComputedStyle(heading)
              const imageStyle = getComputedStyle(visual)
              samples.push({
                opacity: Number(copyStyle.opacity), y: new DOMMatrixReadOnly(copyStyle.transform).m42,
                imageOpacity: Number(imageStyle.opacity), imageY: new DOMMatrixReadOnly(imageStyle.transform).m42,
                clip: getComputedStyle(document.querySelector('main')).clipPath,
              })
            }
            if (started != null && performance.now() - started > 1400) resolve(samples)
            else requestAnimationFrame(read)
          }
          requestAnimationFrame(read)
        })
      })
      await page.getByRole('banner').getByRole('link', { name: 'DLIM HOME', exact: true }).click()
      await expect(page).toHaveURL('/')
      const samples = await page.evaluate(() => window.heroSamples)
      expect(samples.some(s => s.opacity > 0 && s.opacity < 0.9 && s.y > 10)).toBe(true)
      for (const sample of samples) {
        expect(sample.clip).toBe('none')
        expect(Math.abs(sample.y - 100 * (1 - sample.opacity))).toBeLessThan(0.15)
      }
      if (width >= 1024) {
        expect(samples.some(s => s.imageOpacity > 0 && s.imageOpacity < 0.9 && s.imageY > 10)).toBe(true)
        await expect(page.locator('.hero-visual')).toHaveCSS('opacity', '1')
        await expect(page.locator('.hero-visual')).toHaveCSS('transform', 'none')
      }
      await expect(page.locator('#hero-title')).toHaveCSS('opacity', '1')
      await expect(page.locator('#hero-title')).toHaveCSS('transform', 'none')
      await expect(page.locator('#hero-title > *, [data-split-text]')).toHaveCount(0)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    }
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openPage(page, '/products')
    await page.getByRole('banner').getByRole('link', { name: 'DLIM HOME', exact: true }).click()
    await expect(page.locator('#hero-title')).toHaveCSS('opacity', '1')
    await expect(page.locator('#hero-title')).toHaveCSS('transform', 'none')
    await expect(page.locator('.hero-visual')).toHaveCSS('transform', 'none')
  })
}
