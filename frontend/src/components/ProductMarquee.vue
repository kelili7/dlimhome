<script setup>
import { publicAsset } from '../utils/assets.js'
import { onMounted, onUnmounted, ref } from 'vue'
const marquee = ref(null)
let observer
let inView = false
function updatePlayback() {
 const paused = !inView || document.hidden
 marquee.value?.querySelectorAll('.marquee-track').forEach(track => {
  track.style.animationPlayState = paused ? 'paused' : 'running'
 })
}
onMounted(() => {
 observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updatePlayback() })
 observer.observe(marquee.value)
 document.addEventListener('visibilitychange', updatePlayback)
})
onUnmounted(() => {
 observer?.disconnect()
 document.removeEventListener('visibilitychange', updatePlayback)
})
import { products } from '../data/site'
const productImage = handle => products.find(product => product.handle === handle).image
// Keep identical copies in each column for a seamless loop. Lead with the
// supplied table scenes and keep white-background packshots out of this section.
const columns = [
  [publicAsset('/images/ceramics/sage-table-setting.jpg'), productImage('heart-coffee-cups'), publicAsset('/images/ceramics/dining.jpg'), productImage('amber-textured-glasses'), publicAsset('/images/ceramics/ritual.jpg')],
  [publicAsset('/images/ceramics/sage-breakfast-table.jpg'), productImage('amber-stem-glasses'), productImage('kitchen-lid-racks'), publicAsset('/images/ceramics/gathering.jpg'), publicAsset('/images/ceramics/dinnerware.jpg')],
]
</script>
<template><div ref="marquee" class="hero-marquees" aria-hidden="true"><div v-for="(column, columnIndex) in columns" :key="columnIndex" class="marquee-window"><div class="marquee-track" :class="{ reverse: columnIndex === 1 }"><div v-for="copy in 2" :key="copy" class="marquee-group"><img v-for="src in column" :key="src" :src="src" :class="{ 'product-photograph': src.startsWith(publicAsset('/images/products/')) }" alt="" width="640" height="640" /></div></div></div></div></template>
