<script setup>
import { products } from '../data/site'
const columns = [
  [products[0], { image: '/images/tubes.jpg' }, products[2], { image: '/images/ritual.jpg' }],
  [products[1], { image: '/images/ritual.jpg' }, { image: '/images/botanical.jpg' }, { image: '/images/care.jpg' }],
]
</script>

<template>
  <div class="hero-marquees" aria-hidden="true">
    <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="marquee-window">
      <div class="marquee-track" :class="{ reverse: columnIndex === 1 }">
        <div v-for="copy in 2" :key="copy" class="marquee-group">
          <img v-for="(product, index) in column" :key="index" :src="product.image" alt="" width="640" height="640" />
        </div>
      </div>
    </div>
  </div>
</template>
