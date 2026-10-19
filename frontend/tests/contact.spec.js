import { test, expect } from '@playwright/test'

test('contact dropdown supports keyboard, active destinations, focus exit and back navigation', async ({ page }) => {
 await page.goto('/')
 const trigger = page.locator('.desktop-nav').getByRole('button', { name: 'Contact Us' })
 await trigger.focus()
 await page.keyboard.press('Enter')
 await expect(trigger).toHaveAttribute('aria-expanded', 'true')
 await page.keyboard.press('Tab')
 await expect(page.locator('#contact-navigation a').first()).toBeFocused()
 await page.keyboard.press('Escape')
 await expect(trigger).toBeFocused()
 await expect(trigger).toHaveAttribute('aria-expanded', 'false')
 await trigger.click()
 await page.locator('#contact-navigation').getByRole('link', { name: 'Business Enquiry' }).click()
 await expect(page).toHaveURL(/\/contact\/business-enquiry$/)
 await expect(trigger).toHaveClass(/is-active/)
 await expect(page.locator('.contact-navigation a[aria-current=page]')).toHaveText('Business Enquiry')
 await trigger.click()
 await page.locator('#contact-navigation').getByRole('link', { name: 'Join Us' }).click()
 await expect(page).toHaveURL(/\/contact\/join-us$/)
 await expect(page.locator('.contact-navigation a[aria-current=page]')).toHaveText('Join Us')
 await trigger.click()
 await page.getByRole('button', { name: 'Switch to Chinese' }).focus()
 await expect(trigger).toHaveAttribute('aria-expanded', 'false')
 await page.goBack()
 await expect(page).toHaveURL(/\/contact\/business-enquiry$/)
})

test('legacy contact URLs preserve product context, enquiry type and anchors', async ({ page }) => {
 await page.goto('/contact?product=serving-bowls&interest=2#enquiry')
 await expect(page).toHaveURL('/contact/business-enquiry?product=serving-bowls&interest=2#enquiry')
 await expect(page.locator('.selected-product')).toContainText('The Serving Bowl Collection')
 await expect(page.locator('select[name=interest]')).toHaveValue('2')
 await page.goto('/contact#stores')
 await expect(page).toHaveURL('/contact/business-enquiry#stores')
 await page.getByRole('link', { name: 'Start a business enquiry', exact: true }).click()
 await expect(page.locator('select[name=interest]')).toHaveValue('1')
 await expect(page).toHaveURL(/#enquiry$/)
})

test('background and careers include bilingual content and requested application details', async ({ page }) => {
 await page.goto('/about')
 await expect(page.locator('#company-background')).toContainText('DLIM Home')
 await page.getByRole('button', { name: 'Switch to Chinese' }).click()
 await expect(page.locator('#company-background')).toContainText('DLIM Home')
 await expect(page.locator('#company-background')).toContainText('私模自主研发')
 await expect(page.locator('#company-background')).toContainText('鞋服配饰')
 await page.goto('/contact/join-us')
 await expect(page.locator('.workplace-gallery img')).toHaveCount(3)
 for (const photo of await page.locator('.workplace-gallery img').all()) {
  await photo.scrollIntoViewIfNeeded()
  await expect.poll(() => photo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
 }
 for (const heading of ['为什么加入我们', '员工福利', '招聘流程', '简历投递']) {
  await expect(page.getByRole('heading', { name: heading, level: 2, exact: true })).toBeVisible()
 }
 const email = page.locator('.application-email')
 const zhMail = new URL(await email.getAttribute('href'))
 expect(zhMail.protocol).toBe('mailto:')
 expect(zhMail.pathname).toBe('hr@dlim.com')
 expect(zhMail.searchParams.get('subject')).toBe('应聘岗位+姓名')
 await expect(page.locator('.application-tip')).toHaveText('温馨提示：投递简历请注明“应聘岗位+姓名”。')
 await expect(page.locator('.application-privacy')).toContainText('您的简历仅用于招聘用途')
 await page.getByRole('button', { name: '切换至英文' }).click()
 for (const heading of ['Why Work With Us', 'Benefits', 'Recruitment Process', 'How to Apply']) {
  await expect(page.getByRole('heading', { name: heading, level: 2, exact: true })).toBeVisible()
 }
 expect(new URL(await email.getAttribute('href')).searchParams.get('subject')).toBe('Position + Name')
 await page.locator('.careers-contents').getByRole('link', { name: /How to Apply/ }).click()
 await expect(page).toHaveURL(/#apply$/)
})

for (const path of ['/about', '/contact/business-enquiry', '/contact/join-us']) {
 test(`expanded page ${path} fits narrow English screens and mobile contact navigation works`, async ({ page }) => {
  await page.goto(path)
  for (const width of [320, 390, 768, 1024]) {
   await page.setViewportSize({ width, height: 844 })
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.locator('#mobile-navigation').getByRole('link', { name: 'Join Us' }).click()
  await expect(page).toHaveURL(/\/contact\/join-us$/)
  await expect(page.locator('#mobile-navigation')).toHaveCount(0)
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.locator('#mobile-navigation').getByRole('link', { name: 'Business Enquiry' }).click()
  await expect(page).toHaveURL(/\/contact\/business-enquiry$/)
 })
}
