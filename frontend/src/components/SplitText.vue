<script setup>
// Vue entrance-only adaptation of React Bits SplitText, Copyright (c) 2026 David Haz.
// https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/SplitText-TS-CSS.json
// Full MIT + Commons Clause terms: ../../public/licenses/react-bits-LICENSE.md
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import { gsap, ScrollTrigger } from '../motion/gsap'

gsap.registerPlugin(GSAPSplitText)

const props = defineProps({
  text: { type: String, required: true },
  tag: { type: String, default: 'p' },
  delay: { type: Number, default: 50 }, // Milliseconds BETWEEN pieces, not an initial delay.
  duration: { type: Number, default: 1.25 }, // Seconds per piece.
  ease: { type: [String, Function], default: 'power3.out' },
  splitType: { type: String, default: 'chars' },
  from: { type: Object, default: () => ({ opacity: 0, y: 40 }) },
  to: { type: Object, default: () => ({ opacity: 1, y: 0 }) },
  threshold: { type: Number, default: 0.1 },
  rootMargin: { type: String, default: '-100px' },
  textAlign: { type: String, default: undefined },
})
const emit = defineEmits(['letter-animation-complete'])
const element = ref(null)
const parentReady = inject('animated-content-ready', null)
let dispose = () => {}
let completedText

function setupAnimation() {
  const el = element.value
  if (!el || !props.text) return
  let frame
  let disposed = false
  const media = gsap.matchMedia()
  const finish = () => {
    el.dataset.splitState = 'complete'
    if (completedText === props.text) return
    completedText = props.text
    emit('letter-animation-complete')
  }
  media.add({ reduce: '(prefers-reduced-motion: reduce)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
    if (context.conditions.reduce || completedText === props.text) { finish(); return }
    const margin = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(props.rootMargin)
    const value = margin ? Number(margin[1]) : 0
    const offset = value ? `${value < 0 ? '-=' : '+='}${Math.abs(value)}${margin[2] || 'px'}` : ''
    const start = `top ${(1 - Math.min(1, Math.max(0, props.threshold))) * 100}%${offset}`
    let connected = false
    let animation
    let scrollTrigger
    const split = GSAPSplitText.create(el, {
      type: props.splitType, tag: 'span', aria: 'auto',
      // Chinese must wrap between characters; English keeps whole words together.
      smartWrap: !/\p{Script=Han}/u.test(props.text),
      autoSplit: props.splitType.includes('lines'), reduceWhiteSpace: false,
      charsClass: 'split-char', wordsClass: 'split-word', linesClass: 'split-line',
      onSplit(self) {
        // The site uses white-space: pre-line. Keep real newlines for copying,
        // textContent and Vue's bilingual content, without introducing extra lines.
        if (!props.splitType.includes('lines')) {
          el.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode('\n')))
        }
        if (completedText === props.text) return
        const pieces = props.splitType.includes('chars') ? self.chars
          : props.splitType.includes('words') ? self.words : self.lines
        animation = gsap.fromTo(pieces, { ...props.from }, {
          ...props.to, paused: true, duration: props.duration, ease: props.ease,
          stagger: props.delay / 1000, immediateRender: true,
          onStart: () => { el.dataset.splitState = 'playing' },
          onComplete: () => { gsap.set(pieces, { clearProps: 'willChange' }); finish() },
        })
        // autoSplit rebuilds line animations when the available width changes.
        if (connected) {
          scrollTrigger?.kill()
          connected = false
          context.connect()
        }
        return animation
      },
    })
    el.dataset.splitState = 'waiting'
    context.add('connect', () => {
      if (disposed || connected || (parentReady && !parentReady.value)) return
      connected = true
      // Inside AnimatedContent, share its exact trigger instead of waiting for
      // a second (offset) scroll threshold after the parent has already begun.
      if (parentReady) animation.play()
      else scrollTrigger = ScrollTrigger.create({ trigger: el, animation, start, once: true, fastScrollEnd: true })
    })
    const connect = () => context.connect()
    const stop = parentReady ? watch(parentReady, connect, { flush: 'post' }) : () => {}
    // Match the existing router's scroll-restoration timing.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(connect)
    })
    return () => {
      cancelAnimationFrame(frame)
      stop()
      split.revert()
    }
  }, el)
  dispose = () => { disposed = true; cancelAnimationFrame(frame); media.revert() }
}

onMounted(setupAnimation)
watch(() => Object.values(props), () => {
  // A keyed root isolates GSAP's old DOM from Vue's new translated heading.
  dispose()
  setupAnimation()
}, { deep: true, flush: 'post' })
onBeforeUnmount(() => dispose())
</script>

<template>
  <component :is="tag" :key="`${tag}:${text}`" ref="element" data-split-text :style="{ textAlign }">{{ text }}</component>
</template>
