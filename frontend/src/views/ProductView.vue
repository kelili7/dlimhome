<script setup>
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { products } from '../data/site'
import GradientButton from '../components/GradientButton.vue'
const route = useRoute()
const product = computed(() => products.find(item => item.handle === route.params.handle))
const openDialog = inject('openDialog')
</script>
<template>
  <main id="main-content" class="container product-detail section-space"><RouterLink class="back-link" to="/#products"><ArrowLeft :size="18" /> Back to all products</RouterLink><div v-if="product" class="two-columns"><img :src="product.image" :alt="product.name" width="640" height="640" /><div><p class="eyebrow">{{ product.category }}</p><h1>{{ product.name }}</h1><p class="detail-price">${{ product.price.toFixed(2) }}<span> / month</span></p><p class="detail-description">Explore care that fits your everyday life.</p><GradientButton @click="openDialog('Get started', 'This is the product entry point in the frontend template. Enrollment and checkout have not been connected. No order has been created.')">Get Started</GradientButton><p class="fine-print">Template preview · Sample product and pricing. The supplied reference describes the landing page; this detail page is a navigation placeholder for future development.</p></div></div><div v-else class="not-found"><h1>Page not found.</h1><p>Explore the available programs from our homepage.</p><GradientButton to="/">Back to home</GradientButton></div></main>
</template>
