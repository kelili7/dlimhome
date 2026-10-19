import { test, expect } from '@playwright/test'

test('landing page renders all sections and local images without runtime errors', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Considered ceramics. Made for living.')
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
  const languageButton = page.getByRole('button', { name: 'Switch to Chinese', exact: true })
  await languageButton.hover()
  await expect(languageButton).toHaveCSS('animation-duration', '0.8s')
  await expect(languageButton).toHaveCSS('animation-name', 'gradient-shift')
})

test('carousel supports buttons, wrapping, dots and keyboard', async ({ page }) => {
  await page.goto('/')
  const slides = page.locator('.carousel-slide')
  await expect(slides.nth(0)).toHaveAttribute('aria-hidden', 'false')
  await page.getByRole('button', { name: 'Next collection' }).click()
  await expect(slides.nth(1)).toHaveAttribute('aria-hidden', 'false')
  await expect(slides.nth(0)).toHaveAttribute('inert', '')
  await page.getByRole('button', { name: 'Previous collection' }).click()
  await page.getByRole('button', { name: 'Previous collection' }).click()
  await expect(slides.nth(2)).toHaveAttribute('aria-hidden', 'false')
  await page.getByRole('button', { name: 'Show The Vintage Platter Collection' }).click()
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
  await page.locator('.product-card').first().getByRole('link', { name: 'View collection', exact: true }).click()
  await expect(page).toHaveURL(/\/product\/heart-coffee-cups$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Heart Detail Coffee Cups')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Heart Detail Coffee Cups')
  await page.getByRole('link', { name: 'Back to products' }).click()
  await expect(page).toHaveURL('/')
  await page.goto('/product/missing')
  await expect(page.getByRole('heading', { name: 'This page is still unwritten.' })).toBeVisible()
})

test('store policy dialog traps focus and returns focus', async ({ page }) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Store policies', exact: true })
  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Understood' }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(trigger).toBeFocused()
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
  const languageButton = page.getByRole('button', { name: 'Switch to Chinese', exact: true })
  await languageButton.hover()
  await expect(languageButton).toHaveCSS('animation-name', 'none')
})

const routes = [
  ['/', 'Home', 'Considered ceramics. Made for living.', '首页', '把日常， 过成美好。'],
  ['/products', 'Products', 'A place for every piece.', '产品', '让每件器物，各得其所。'],
  ['/factory', 'Factory', 'The beauty is in the making.', '工厂', '器物之美， 始于制作。'],
  ['/about', 'About Us', 'Everyday objects. Lasting meaning.', '关于我们', '日常器物， 长久的意义。'],
  ['/support', 'Support', 'Care for the pieces. Enjoy the moments.', '服务支持', '照料好器物， 享受每一刻。'],
  ['/contact/business-enquiry', 'Business Enquiry', 'Something beautiful starts here.', '业务咨询', '美好的合作， 从这里开始。'],
  ['/contact/join-us', 'Join Us', 'Make everyday life a little more considered.', '加入我们', '一起，为日常 多做一点用心的事。'],
]
for (const [path, nav, heading, zhNav, zhHeading] of routes) {
 test(`${nav} supports direct loading, both languages, and narrow screens`, async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(path)
  await expect(page.locator('h1')).toHaveText(heading)
  await expect(page).toHaveTitle(`${nav} | DLIM HOME`)
  await expect(page.locator('.desktop-nav .primary-nav-item')).toHaveText(['Home', 'Products', 'Factory', 'About Us', 'Support', 'Contact Us'])
  await page.locator('img').evaluateAll(imgs => imgs.forEach(img => { img.loading = 'eager' }))
  await expect.poll(() => page.locator('img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true)
  for (const section of await page.locator('main > section').all()) await section.scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({ path: testInfo.outputPath('english-desktop.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Switch to Chinese' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('h1')).toHaveText(zhHeading)
  await expect(page.locator('.desktop-nav .primary-nav-item')).toHaveText(['首页', '产品', '工厂', '关于我们', '服务支持', '联系我们'])
  await page.reload()
  await expect(page).toHaveTitle(`${zhNav} | DLIM HOME`)
  for (const width of [320, 390, 768, 1024]) {
   await page.setViewportSize({ width, height: 844 })
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('img').evaluateAll(imgs => imgs.forEach(img => { img.loading = 'eager' }))
  await expect.poll(() => page.locator('img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('chinese-mobile.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: '切换至英文' }).click()
  expect(errors).toEqual([])
 })
}

test('mobile navigation includes both contact destinations, closes after selection and restores focus on Escape', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 })
 await page.goto('/')
 await page.getByRole('button', { name: 'Open menu' }).click()
 await expect(page.locator('#mobile-navigation a')).toHaveCount(7)
 await page.keyboard.press('Escape')
 await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
 await page.getByRole('button', { name: 'Open menu' }).click()
 await page.locator('#mobile-navigation').getByRole('link', { name: 'Factory', exact: true }).click()
 await expect(page).toHaveURL(/\/factory$/)
 await expect(page.locator('#mobile-navigation')).toHaveCount(0)
 await page.getByRole('button', { name: 'Switch to Chinese' }).click()
 await page.getByRole('button', { name: '展开导航' }).click()
 await page.locator('#mobile-navigation').getByRole('link', { name: '产品', exact: true }).click()
 await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
 await expect(page.locator('h1')).toHaveText('让每件器物，各得其所。')
})

test('catalog filters and search work together, survive language changes, and reset', async ({ page }) => {
 await page.goto('/products')
 await expect(page.locator('.product-card')).toHaveCount(8)
 await page.getByRole('button', { name: 'Bowls', exact: true }).click()
 await expect(page.locator('.product-card')).toHaveCount(1)
 await page.getByRole('button', { name: 'Switch to Chinese' }).click()
 await expect(page.getByRole('button', { name: '碗类系列' })).toHaveAttribute('aria-pressed', 'true')
 await page.locator('#catalogue-search').fill('no-match')
 await expect(page.getByText('暂未找到相关器物。')).toBeVisible()
 await page.getByRole('button', { name: '清除筛选' }).click()
 await expect(page.locator('.product-card')).toHaveCount(8)
 await page.locator('#catalogue-search').fill('烘焙')
 await expect(page.locator('.product-card')).toHaveCount(1)
 await page.reload()
 await expect(page.locator('#catalogue-search')).toHaveValue('烘焙')
 await page.locator('#footer-search').fill('platter')
 await page.locator('footer').getByRole('button', { name: '搜索', exact: true }).click()
 await expect(page.locator('.product-card')).toHaveCount(1)
 await expect(page.locator('.product-card h3')).toHaveText('复古浮点长盘系列')
})

test('product gallery, enquiry context and official stores are connected', async ({ page }) => {
 await page.goto('/product/everyday-dinnerware')
 await page.getByRole('button', { name: 'Show 2', exact: true }).click()
 await expect(page.locator('.product-gallery > img')).toHaveAttribute('src', '/images/ceramics/dining.jpg')
 await page.getByRole('link', { name: 'Visit Amazon' }).first().evaluate(a => {
  if (!a.href.includes('/stores/DLIMHOME/page/C4D9CF2D-0C18-4E7E-8167-46A01ED081DA')) throw new Error('Wrong store URL')
 })
 await page.locator('.product-enquire').click()
 await expect(page.locator('.selected-product')).toContainText('Everyday Tableware')
 await expect(page.locator('select[name=interest]')).toHaveValue('1')
 await page.goto('/missing')
 await expect(page.locator('h1')).toHaveText('This page is still unwritten.')
})

test('enquiry validates email, creates a local draft, translates and downloads without sending', async ({ page }) => {
 const requests = []
 page.on('request', request => { if (request.method() === 'POST') requests.push(request.url()) })
 await page.goto('/contact?interest=2')
 await page.locator('input[name=name]').fill('Taylor')
 await page.locator('input[name=email]').fill('invalid')
 await page.locator('textarea[name=message]').fill('White plates for a new collection.')
 await page.getByRole('checkbox').check()
 await page.getByRole('button', { name: 'Prepare enquiry', exact: true }).click()
 await expect(page.locator('.enquiry-result')).toHaveCount(0)
 await page.locator('input[name=email]').fill('taylor@example.com')
 await page.getByRole('button', { name: 'Prepare enquiry', exact: true }).click()
 await expect(page.locator('.enquiry-result')).toContainText('It has not been sent yet.')
 await expect(page.locator('#enquiry-draft')).toHaveValue(/Taylor/)
 await page.getByRole('button', { name: 'Switch to Chinese' }).click()
 await expect(page.locator('#enquiry-draft')).toHaveValue(/咨询类型: 定制系列/)
 const downloadEvent = page.waitForEvent('download')
 await page.getByRole('button', { name: '下载摘要' }).click()
 const download = await downloadEvent
 expect(download.suggestedFilename()).toBe('DLIM-HOME-enquiry.txt')
 const stream = await download.createReadStream()
 const chunks = []
 for await (const chunk of stream) chunks.push(chunk)
 const text = Buffer.concat(chunks).toString('utf8')
 expect(text).toContain('taylor@example.com')
 expect(text).toContain('White plates for a new collection.')
 expect(text).toContain('DLIM HOME — 咨询需求')
 await page.getByRole('button', { name: '修改内容' }).click()
 await expect(page.locator('input[name=name]')).toHaveValue('Taylor')
 await expect(page.locator('input[name=name]')).toBeFocused()
 expect(requests).toEqual([])
})
