<script setup>
// Vue adaptation of React Bits AnimatedContent, Copyright (c) 2026 David Haz.
// https://reactbits.dev/r/AnimatedContent-JS-CSS.json
// Full MIT + Commons Clause terms: ../../public/licenses/react-bits-LICENSE.md
import { onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { whenImagesReady } from '../motion/imageReady'

// Wipe masks and motion semantics follow the official JS/CSS registry source.
const wipes = {
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  center: 'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
}

const props = defineProps({
  tag: { type: String, default: 'div' },
  container: { type: [Object, String], default: null },
  distance: { type: Number, default: 100 },
  direction: { type: String, default: 'vertical', validator: value => ['vertical', 'horizontal'].includes(value) },
  reverse: { type: Boolean, default: false },
  duration: { type: Number, default: 0.8 },
  ease: { type: [String, Function], default: 'power3.out' },
  initialOpacity: { type: Number, default: 0 },
  animateOpacity: { type: Boolean, default: true },
  scale: { type: Number, default: 1 },
  blur: { type: Number, default: 0 },
  rotate: { type: Number, default: 0 },
  tilt: { type: Number, default: 0 },
  wipe: { type: String, default: 'none', validator: value => ['none', 'up', 'down', 'left', 'right', 'center'].includes(value) },
  stagger: { type: Number, default: 0 },
  staggerFrom: { type: [String, Number], default: 'start' },
  once: { type: Boolean, default: true },
  scrub: { type: [Boolean, Number], default: false },
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
  let pointerDown = false
  let finishForFocus = () => {}
  // Prepare the start pose synchronously in onMounted, before the first paint.
  // Only scroll measurements wait for Vue Router to restore the page position.
  const scroller = typeof props.container === 'string'
    ? document.querySelector(props.container) : props.container || document.getElementById('snap-main-container')
  media = gsap.matchMedia()
  media.add({ reduce: '(prefers-reduced-motion: reduce)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
    if (context.conditions.reduce) {
      contentReady.value = true
      emit('complete')
      return
    }
    const targets = props.stagger > 0 && el.children.length ? Array.from(el.children) : [el]
    const mask = wipes[props.wipe]
    const clearProps = 'transform,filter,maskImage,webkitMaskImage,--ac-wipe'
    const axis = props.direction === 'horizontal' ? 'x' : 'y'
    const offset = props.distance * (props.reverse ? -1 : 1)
    const from = { [axis]: offset, scale: props.scale, opacity: props.animateOpacity ? props.initialOpacity : 1 }
    const to = { [axis]: 0, scale: 1, opacity: 1, duration: props.duration, ease: props.ease }
    if (props.blur > 0) { from.filter = `blur(${props.blur}px)`; to.filter = 'blur(0px)' }
    if (props.rotate) { from.rotation = props.rotate * (props.reverse ? -1 : 1); to.rotation = 0 }
    if (props.tilt) {
      const tiltAxis = axis === 'x' ? 'rotationY' : 'rotationX'
      from[tiltAxis] = props.tilt * (props.reverse ? -1 : 1) * (axis === 'x' ? -1 : 1)
      to[tiltAxis] = 0
      from.transformPerspective = to.transformPerspective = 900
    }
    if (mask) {
      gsap.set(targets, { maskImage: mask, webkitMaskImage: mask })
      from['--ac-wipe'] = 0
      to['--ac-wipe'] = 1
    }
    if (props.stagger > 0) to.stagger = { each: props.stagger, from: props.staggerFrom }
    let trigger
    let triggerFrame
    let departure
    let cancelImageWait = () => {}
    let waitingForImages = false
    let focused = el.contains(document.activeElement)
    context.add('disappear', () => {
      if (props.disappearAfter <= 0 || focused) return
      departure = gsap.to(targets, {
        [axis]: -offset, scale: 0.8,
        opacity: props.animateOpacity ? props.initialOpacity : 0,
        delay: props.disappearAfter, duration: props.disappearDuration, ease: props.disappearEase,
        ...(props.blur > 0 ? { filter: `blur(${props.blur}px)` } : {}),
        ...(props.stagger > 0 ? { stagger: to.stagger } : {}),
        onComplete: () => emit('disappearance-complete'),
      })
    })
    const timeline = gsap.timeline({
      paused: true,
      onStart: () => { contentReady.value = true; emit('start') },
      onComplete: () => {
        if (!props.scrub) gsap.set(targets, { clearProps })
        contentReady.value = true
        emit('complete')
        if (props.once && !props.scrub) context.disappear()
      },
    })
    timeline.fromTo(targets, from, to, props.scrub ? 0 : Math.max(0, props.delay))
    const playWhenReady = () => {
      if (waitingForImages) return
      waitingForImages = true
      cancelImageWait = whenImagesReady(el, () => {
        waitingForImages = false
        if (!disposed && !focused) timeline.play()
      })
    }
    context.add('finishForFocus', (reveal = true) => {
      focused = true
      departure?.kill()
      // Pointer focus happens between down and up. Moving the target here
      // would put mouseup outside the link/button and swallow its click.
      if (!reveal) return
      cancelImageWait()
      contentReady.value = true
      trigger?.kill()
      timeline.pause()
      gsap.set(targets, { opacity: 1, clearProps })
    })
    context.add('connectScroll', () => {
      if (disposed || focused) return
      const threshold = Math.min(1, Math.max(0, props.threshold))
      const scrollOptions = { trigger: el, scroller: scroller || undefined, start: `top ${(1 - threshold) * 100}%` }
      trigger = ScrollTrigger.create(props.scrub ? {
        ...scrollOptions,
        end: `top ${Math.max((1 - threshold) * 100 - 45, 5)}%`,
        scrub: props.scrub === true ? true : Math.max(Number(props.scrub) || 0, 0.01),
        animation: timeline,
      } : {
        ...scrollOptions, once: props.once,
        onEnter: playWhenReady,
        onLeaveBack: props.once ? undefined : () => {
          cancelImageWait()
          waitingForImages = false
          if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask })
          timeline.reverse()
        },
      })
    })
    finishForFocus = context.finishForFocus
    if (focused) finishForFocus()
    else if (props.trigger === 'mount') playWhenReady()
    else {
      triggerFrame = requestAnimationFrame(() => {
        triggerFrame = requestAnimationFrame(() => context.connectScroll())
      })
    }
    return () => {
      cancelImageWait()
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
  const onPointerDown = () => { pointerDown = true }
  const onPointerUp = () => { pointerDown = false }
  const onFocus = () => finishForFocus(!pointerDown)
  el.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
  el.addEventListener('focusin', onFocus)
  dispose = () => {
    disposed = true
    cancelAnimationFrame(frame)
    resize?.disconnect()
    media?.revert()
    el.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
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
  <component :is="tag" ref="element" data-animated-content><slot /></component>
</template>
