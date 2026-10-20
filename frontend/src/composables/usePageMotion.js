import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap, ScrollTrigger, pageMounted } from '../motion/gsap'
import { createPageParallax } from '../motion/pageParallax'
import { motionTiming } from '../motion/settings'

// Use existing blocks: no wrappers, text splitting, pin spacers or layout changes.
const revealSelector = [
  '.section-heading', '.two-columns > *', '.products-grid > *',
  '.science-grid > *', '.guide-grid > *', '.carousel-layout > *',
  '.company-facts > *', '.values-grid > *', '.process-grid > *',
  '.company-markets > *', '.catalogue-heading', '.category-filters',
  '.contact-path', '.enquiry-intro', '.workplace-heading',
  '.workplace-gallery > *', '.benefits-layout > *', '.application-panel > *',
  '.cta-panel > *',
].join(',')

export function usePageMotion() {
  const motionRoot = ref(null)
  const route = useRoute()
  const router = useRouter()
  const path = route.path
  let cleanup = () => {}

  onMounted(() => {
    const root = motionRoot.value
    if (!root) return // ProductView delegates unknown handles to NotFoundView.
    const unmark = pageMounted(path, root)
    // Keep native hash URLs/history while routing same-page links through ScrollTo.
    const onAnchorClick = event => {
      const anchor = event.target.closest('a[href^="#"]')
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || anchor.target || anchor.hasAttribute('download')) return
      const hash = anchor.getAttribute('href')
      if (!document.getElementById(hash.slice(1))) return
      event.preventDefault()
      router.push({ path: route.path, query: route.query, hash })
    }
    root.addEventListener('click', onAnchorClick)
    let frame
    let context
    // Keep playback history across responsive media-context rebuilds.
    const revealed = new WeakSet()
    let introPlayed = false
    // Let the router restore scroll before measuring or revealing a page.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        context = gsap.context(() => {
          const media = gsap.matchMedia()
          media.add({ mobile: '(max-width: 767px)', desktop: '(min-width: 768px)',
            // The enquiry photo is displayed only at this layout breakpoint.
            wide: '(min-width: 1024px)',
            reduce: '(prefers-reduced-motion: reduce)' }, mediaContext => {
            const playIntro = !introPlayed
            introPlayed = true
            if (mediaContext.conditions.reduce) return
            const mobile = mediaContext.conditions.mobile
            const distance = mobile ? 10 : 16
            const parallaxImages = createPageParallax(root, mobile)
            const visible = element => {
              const box = element.getBoundingClientRect()
              return box.height > 0 && box.bottom > 0 && box.top < innerHeight
            }
            const hero = root.querySelector('.hero, .page-hero, .product-detail') || (root.matches('.not-found') ? root : null)
            const copy = [...root.querySelectorAll('.hero-content > *, .page-hero > div > *, .product-detail .two-columns > *, .not-found > *')].filter(visible)
            // The route mask handles the reveal; do not dim visible content again.
            if (playIntro && copy.length) {
              gsap.timeline({ defaults: { duration: mobile ? motionTiming.introMobile : motionTiming.intro,
                ease: 'dlim-reveal', clearProps: 'transform,willChange' } })
                .from(copy, { y: distance, stagger: motionTiming.stagger, willChange: 'transform', force3D: false })
            }

            const seen = new WeakSet()
            const triggers = new Set()
            let refreshTimer
            let disposed = false
            mediaContext.add('reveal', elements => {
              if (disposed) return
              const targets = elements.filter(element => {
                if (!element.isConnected || revealed.has(element)) return false
                revealed.add(element)
                if (element.contains(document.activeElement)) {
                  gsap.set(element, { clearProps: 'transform,willChange' })
                  return false
                }
                return true
              })
              if (!targets.length) return
              gsap.to(targets, { y: 0, duration: mobile ? motionTiming.revealMobile : motionTiming.reveal,
                stagger: motionTiming.stagger,
                ease: 'dlim-reveal', willChange: 'transform', force3D: false,
                clearProps: 'transform,willChange', overwrite: 'auto' })
            })
            mediaContext.add('scan', () => {
              // Discard removed catalogue cards, and register only new blocks.
              for (const trigger of triggers) {
                if (!trigger.trigger.isConnected) { trigger.kill(); triggers.delete(trigger) }
              }
              const candidates = [...root.querySelectorAll(revealSelector)].filter(element => !hero?.contains(element) && !parallaxImages.has(element))
              const candidatesSet = new Set(candidates)
              const targets = candidates.filter(element => {
                for (let parent = element.parentElement; parent && parent !== root; parent = parent.parentElement) {
                  if (candidatesSet.has(parent)) return false
                }
                if (seen.has(element) || revealed.has(element)) return false
                seen.add(element)
                // A restored history position or a filter update should stay readable.
                if (element.getBoundingClientRect().top < innerHeight) {
                  revealed.add(element)
                  return false
                }
                return true
              })
              if (targets.length) {
                // Prepare ONLY below-screen elements, keeping full opacity. Once
                // visible, they move to rest instead of jumping back to a start pose.
                gsap.set(targets, { y: distance, force3D: false })
                ScrollTrigger.batch(targets, {
                  start: 'top bottom', once: true, interval: 0.03, batchMax: mobile ? 2 : 4,
                  onEnter: mediaContext.reveal,
                }).forEach(trigger => triggers.add(trigger))
              }
            })
            const refresh = () => {
              clearTimeout(refreshTimer)
              refreshTimer = setTimeout(() => {
                if (disposed) return
                mediaContext.scan()
                ScrollTrigger.refresh()
              }, 100)
            }
            mediaContext.scan()
            let previousSize = `${root.offsetWidth}:${root.offsetHeight}`
            const resize = new ResizeObserver(() => {
              const size = `${root.offsetWidth}:${root.offsetHeight}`
              if (size !== previousSize) { previousSize = size; refresh() }
            })
            resize.observe(root)
            const mutation = new MutationObserver(refresh)
            mutation.observe(root, { childList: true, subtree: true })
            // Reserved image dimensions need no refresh; actual height changes
            // (including FAQ transitions) are picked up by ResizeObserver.
            if (document.fonts.status !== 'loaded') {
              document.fonts.ready.then(() => { if (!disposed) refresh() })
            }
            return () => {
              disposed = true
              clearTimeout(refreshTimer)
              resize.disconnect()
              mutation.disconnect()
            }
          }, root)
        }, root)
      })
    })
    cleanup = () => {
      cancelAnimationFrame(frame)
      context?.revert()
      root.removeEventListener('click', onAnchorClick)
      unmark()
    }
  })
  onUnmounted(() => cleanup())
  return motionRoot
}
