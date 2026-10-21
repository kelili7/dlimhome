<script setup>
// Vue adaptation of React Bits AnimatedContent, Copyright (c) 2026 David Haz.
// https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/AnimatedContent-TS-CSS.json
// Full MIT + Commons Clause terms: ../../public/licenses/react-bits-LICENSE.md
import { onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { gsap, ScrollTrigger } from '../motion/gsap'

const props = defineProps({
  container: { type: [Object, String], default: null },
  distance: { type: Number, default: 100 },
  direction: { type: String, default: 'vertical', validator: value => ['vertical', 'horizontal'].includes(value) },
  reverse: { type: Boolean, default: false },
  duration: { type: Number, default: 0.8 },
  ease: { type: String, default: 'power3.out' },
  initialOpacity: { type: Number, default: 0 },
  animateOpacity: { type: Boolean, default: true },
  scale: { type: Number, default: 1 },
  threshold: { type: Number, default: 0.1 },
  delay: { type: Number, default: 0 },
  trigger: { type: String, default: 'scroll', validator: value => ['scroll', 'mount'].includes(value) },
  disappearAfter: { type: Number, default: 0 },
  disappearDuration: { type: Number, default: 0.5 },
  disappearEase: { type: String, default: 'power3.in' },
})
const emit = defineEmits(['start', 'complete', 'disappearance-complete'])
const element = ref(null)
const contentReady = ref(false)
provide('animated-content-ready', contentReady)
let dispose = () => {}
let stopWatching

function setupAnimation() {
  dispose()
  contentReady.value = false
  const el = element.value
  let frame
  let media
  let resize
  let disposed = false
  let finishForFocus = () => {}
  // Prepare the start pose synchronously in onMounted, before the first paint.
  // Only scroll measurements wait for Vue Router to restore the page position.
  const scroller = typeof props.container === 'string'
    ? document.querySelector(props.container) : props.container
  media = gsap.matchMedia()
  media.add({ reduce: '(prefers-reduced-motion: reduce)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
    if (context.conditions.reduce) {
      contentReady.value = true
      emit('complete')
      return
    }
    const axis = props.direction === 'horizontal' ? 'x' : 'y'
    const offset = props.distance * (props.reverse ? -1 : 1)
    let trigger
    let triggerFrame
    let departure
    let focused = el.contains(document.activeElement)
    context.add('disappear', () => {
      if (props.disappearAfter <= 0 || focused) return
      departure = gsap.to(el, {
        [axis]: -offset, scale: 0.8,
        opacity: props.animateOpacity ? props.initialOpacity : 0,
        delay: props.disappearAfter, duration: props.disappearDuration, ease: props.disappearEase,
        onComplete: () => emit('disappearance-complete'),
      })
    })
    const timeline = gsap.timeline({
      paused: true,
      onStart: () => { contentReady.value = true; emit('start') },
      onComplete: () => {
        gsap.set(el, { clearProps: 'transform' })
        contentReady.value = true
        emit('complete')
        context.disappear()
      },
    })
    timeline.fromTo(el,
      { [axis]: offset, scale: props.scale, opacity: props.animateOpacity ? props.initialOpacity : 1 },
      { [axis]: 0, scale: 1, opacity: 1, duration: props.duration, ease: props.ease, immediateRender: true },
      Math.max(0, props.delay),
    )
    context.add('finishForFocus', () => {
      focused = true
      contentReady.value = true
      trigger?.kill()
      departure?.kill()
      timeline.pause()
      gsap.set(el, { opacity: 1, clearProps: 'transform' })
    })
    context.add('connectScroll', () => {
      if (disposed || focused) return
      trigger = ScrollTrigger.create({
        trigger: el, scroller: scroller || undefined,
        start: `top ${(1 - Math.min(1, Math.max(0, props.threshold))) * 100}%`,
        once: true, onEnter: () => timeline.play(),
      })
    })
    finishForFocus = context.finishForFocus
    if (focused) finishForFocus()
    else if (props.trigger === 'mount') timeline.play()
    else {
      triggerFrame = requestAnimationFrame(() => {
        triggerFrame = requestAnimationFrame(() => context.connectScroll())
      })
    }
    return () => {
      cancelAnimationFrame(triggerFrame)
      finishForFocus = () => {}
    }
  }, el)
  const refresh = () => { if (!disposed) ScrollTrigger.refresh() }
  // ResizeObserver immediately delivers an initial notification. Register it
  // after scroll restoration too, so its refresh cannot restore stale scroll.
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => {
      if (disposed) return
      resize = new ResizeObserver(refresh)
      resize.observe(scroller || document.documentElement)
      resize.observe(el)
      if (document.fonts.status !== 'loaded') document.fonts.ready.then(refresh)
    })
  })
  const onFocus = () => finishForFocus()
  el.addEventListener('focusin', onFocus)
  dispose = () => {
    disposed = true
    cancelAnimationFrame(frame)
    resize?.disconnect()
    media?.revert()
    el.removeEventListener('focusin', onFocus)
  }
}

onMounted(() => {
  setupAnimation()
  stopWatching = watch(() => Object.values(props), setupAnimation, { flush: 'post' })
})
onUnmounted(() => { stopWatching?.(); dispose() })
</script>

<template>
  <div ref="element" data-animated-content><slot /></div>
</template>
