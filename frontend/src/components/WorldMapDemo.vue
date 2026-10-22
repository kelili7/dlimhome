<script setup>
// Vue adaptation of Manu Arora's Aceternity UI World Map / World Map Demo.
// Source: https://ui.aceternity.com/registry/world-map-demo.json
import { onMounted, onUnmounted, ref, useId } from 'vue'
import { useLocale } from '../composables/useLocale'
import mapImage from '../assets/world-map.svg'
import points from '../data/worldMap.json'

const { t } = useLocale()
const root = ref(null)
const entered = ref(false)
const visible = ref(false)
const gradientId = `world-map-gradient-${useId()}`
const paths = points.slice(1).map(end => {
  const start = points[0]
  return `M ${start.x} ${start.y} Q ${(start.x + end.x) / 2} ${Math.min(start.y, end.y) - 50} ${end.x} ${end.y}`
})
let observer

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    visible.value = entry.isIntersecting
    if (entry.isIntersecting) entered.value = true
  }, { threshold: 0.15 })
  observer.observe(root.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <figure ref="root" class="world-map-demo" :class="{ 'has-entered': entered, 'is-visible': visible }">
    <div class="world-map-heading">
      <p class="eyebrow">{{ t('background.mapLabel') }}</p>
      <h4>{{ t('background.mapTitle') }}</h4>
      <p class="body-copy">{{ t('background.mapCopy') }}</p>
    </div>
    <div class="world-map" role="img" :aria-label="t('background.mapAlt')">
      <img :src="mapImage" alt="" width="800" height="400" loading="lazy" draggable="false" />
      <svg viewBox="0 0 800 400" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0" />
            <stop offset="5%" stop-color="currentColor" />
            <stop offset="95%" stop-color="currentColor" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path v-for="(path, i) in paths" :key="i" class="world-map-route" :d="path"
          fill="none" :stroke="`url(#${gradientId})`" stroke-width="1.2" pathLength="1" :style="{ '--route-delay': `${i * 0.5}s` }" />
        <g v-for="(point, i) in points" :key="i" :transform="`translate(${point.x} ${point.y})`" fill="currentColor">
          <circle r="2.5" />
          <circle class="world-map-pulse" r="2.5" />
        </g>
      </svg>
    </div>
    <figcaption>{{ t('background.mapCaption') }}</figcaption>
  </figure>
</template>

<style scoped>
.world-map-demo { margin: 48px 0 0; padding: 48px 32px 24px; border-radius: 24px; background: hsl(var(--card)); overflow: hidden; }
.world-map-heading { max-width: 640px; margin: 0 auto 24px; text-align: center; }
.world-map-heading h4 { font-size: clamp(24px, 3vw, 36px); line-height: 1.3; letter-spacing: -.025em; margin-bottom: 16px; }
.world-map-heading .body-copy { margin: 0; }
.world-map { position: relative; aspect-ratio: 2 / 1; color: hsl(var(--ceramic-ink)); }
.world-map img { width: 100%; height: 100%; object-fit: fill; mask-image: linear-gradient(to bottom, transparent, white 10%, white 90%, transparent); user-select: none; }
.world-map svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.world-map-route { stroke-dasharray: 1; stroke-dashoffset: 1; }
.world-map-pulse { opacity: 0; }
.has-entered .world-map-route { animation: map-draw 1s ease-out var(--route-delay) both; }
.has-entered .world-map-pulse { animation: map-pulse 1.5s ease-out 3 both; transform-box: fill-box; transform-origin: center; }
.world-map-demo:not(.is-visible) .world-map-route, .world-map-demo:not(.is-visible) .world-map-pulse { animation-play-state: paused; }
figcaption { text-align: center; color: hsl(var(--muted-foreground)); font-size: 12px; line-height: 1.6; margin-top: 12px; }
@keyframes map-draw { to { stroke-dashoffset: 0; } }
@keyframes map-pulse { from { transform: scale(1); opacity: .5; } to { transform: scale(3.2); opacity: 0; } }
@media (max-width: 767px) {
  .world-map-demo { margin-top: 24px; padding: 32px 16px 20px; }
  .world-map-heading { margin-bottom: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .world-map-demo .world-map-route { animation: none; stroke-dashoffset: 0; }
  .world-map-demo .world-map-pulse { animation: none; opacity: 0; }
}
</style>
