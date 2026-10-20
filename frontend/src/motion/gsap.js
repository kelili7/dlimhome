import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, CustomEase, ScrollToPlugin)
CustomEase.create('dlim-reveal', '0.25,0.46,0.45,0.94')

export { gsap, ScrollTrigger }
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let anchorScroll
export function stopAnchorScroll() { anchorScroll?.kill(); anchorScroll = undefined }
export function scrollToAnchor(element) {
  stopAnchorScroll()
  anchorScroll = gsap.to(window, {
    scrollTo: { y: element, offsetY: 110, autoKill: true },
    duration: Math.min(1, Math.max(0.4, Math.abs(element.getBoundingClientRect().top - 110) / 1800)),
    ease: 'power3.inOut',
    onComplete: () => { anchorScroll = undefined },
    onInterrupt: () => { anchorScroll = undefined },
  })
}

// A route must be mounted before Vue Router restores its scroll position.
// Resolving all waiters also lets superseded navigations finish without scrolling.
let mountedPage
const waiters = new Set()
export function pageMounted(path, element) {
  mountedPage = { path, element }
  waiters.forEach(resolve => resolve())
  waiters.clear()
  return () => { if (mountedPage?.element === element) mountedPage = undefined }
}
export function pageLeaving(element) {
  if (mountedPage?.element === element) mountedPage = undefined
}
export async function waitForPage(path, isCurrent) {
  while (mountedPage?.path !== path && isCurrent()) {
    await new Promise(resolve => waiters.add(resolve))
  }
}
