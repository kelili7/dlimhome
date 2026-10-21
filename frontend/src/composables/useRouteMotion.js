import { onMounted, onUnmounted } from 'vue'
import { gsap, reducedMotion, pageLeaving, stopAnchorScroll } from '../motion/gsap'
import { motionTiming } from '../motion/settings'

export function useRouteMotion() {
  const running = new Map()
  let preference

  function cancel(element) {
    const animation = running.get(element)
    if (!animation) return
    running.delete(element)
    cancelAnimationFrame(animation.frame)
    animation.context.revert()
  }

  function animate(element, done, entering) {
    cancel(element)
    if (!entering) pageLeaving(element)
    // Vue's out-in transition must finish its patch before releasing the next page.
    if (reducedMotion()) { queueMicrotask(done); return }
    // Component entrances start alongside the page content. A full-page wipe
    // would conceal the beginning of the text/block animations.
    if (entering && element.querySelector('[data-animated-content], [data-split-text]')) { queueMicrotask(done); return }
    const context = gsap.context(() => {}, element)
    const finish = () => {
      cancel(element)
      done()
    }
    const animation = { context, finish, entering, frame: undefined }
    running.set(element, animation)
    if (entering) {
      context.add(() => gsap.set(element, { clipPath: 'inset(100% 0 0 0)', willChange: 'clip-path' }))
      // Measure AFTER the router restores scroll. A percentage of the whole
      // long page would conceal its first screen for most of the animation.
      animation.frame = requestAnimationFrame(() => context.add(() => {
        const bounds = element.getBoundingClientRect()
        const top = Math.min(bounds.height, Math.max(0, -bounds.top))
        const bottom = Math.min(bounds.height, Math.max(top, innerHeight - bounds.top))
        gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: finish })
          .addLabel('uncover')
          .fromTo(element, { clipPath: `inset(${bottom}px 0 0 0)` },
            { clipPath: `inset(${top}px 0 0 0)`, duration: motionTiming.routeReveal }, 'uncover')
      }))
    } else {
      context.add(() => {
        gsap.timeline({ defaults: { ease: 'power1.in' }, onComplete: finish })
          .to(element, { opacity: 0, willChange: 'opacity', duration: motionTiming.routeLeave })
      })
    }
  }
  function finishOnInteraction(event) {
    if (event.type === 'keydown' && !['Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return
    for (const [element, animation] of [...running]) {
      if (animation.entering && (event.type !== 'focusin' || element.contains(event.target))) animation.finish()
    }
  }
  function finishForReducedMotion() {
    if (preference.matches) {
      stopAnchorScroll()
      ;[...running.values()].forEach(animation => animation.finish())
    }
  }
  onMounted(() => {
    preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference.addEventListener('change', finishForReducedMotion)
    for (const type of ['wheel', 'touchstart', 'keydown', 'focusin']) window.addEventListener(type, finishOnInteraction, { passive: true })
  })
  onUnmounted(() => {
    stopAnchorScroll()
    preference?.removeEventListener('change', finishForReducedMotion)
    for (const type of ['wheel', 'touchstart', 'keydown', 'focusin']) window.removeEventListener(type, finishOnInteraction)
    ;[...running.keys()].forEach(cancel)
  })

  return {
    enter: (element, done) => animate(element, done, true),
    leave: (element, done) => animate(element, done, false),
    cancel,
  }
}
