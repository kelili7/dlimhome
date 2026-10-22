import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ScrollTrigger, pageMounted } from '../motion/gsap'

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
    let timer
    let resize
    let mutation
    let disposed = false
    const refresh = () => {
      clearTimeout(timer)
      timer = setTimeout(() => { if (!disposed) ScrollTrigger.refresh() }, 100)
    }
    // Measure after Vue Router restores scroll. Observe layout only, not the
    // inline transforms written by AnimatedContent on every animation frame.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (disposed) return
        resize = new ResizeObserver(refresh)
        resize.observe(root)
        mutation = new MutationObserver(refresh)
        mutation.observe(root, { childList: true, subtree: true })
        if (document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (!disposed) refresh() })
      })
    })
    cleanup = () => {
      cancelAnimationFrame(frame)
      disposed = true
      clearTimeout(timer)
      resize?.disconnect()
      mutation?.disconnect()
      root.removeEventListener('click', onAnchorClick)
      unmark()
    }
  })
  onUnmounted(() => cleanup())
  return motionRoot
}
