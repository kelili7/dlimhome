<script setup>
import GradientButton from './GradientButton.vue'
defineProps({ product: { type: Object, required: true } })
</script>

<template>
  <article class="product-card">
    <RouterLink :to="`/product/${product.handle}`" class="product-image-link" :aria-label="`View ${product.name}`">
      <img :src="product.image" :alt="`${product.name} sample photography`" width="640" height="640" loading="lazy" />
    </RouterLink>
    <h3>{{ product.name }}</h3>
    <p class="product-price">${{ product.price.toFixed(2) }} <span>per month</span></p>
    <GradientButton :to="`/product/${product.handle}`">Get Started</GradientButton>
  </article>
</template>
