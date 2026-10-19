<script setup>
import GradientButton from './GradientButton.vue'
import { useLocale } from '../composables/useLocale'
defineProps({ product: { type: Object, required: true } })
const { t, tx } = useLocale()
</script>
<template><article class="product-card"><RouterLink :to="`/product/${product.handle}`" class="product-image-link" :aria-label="`${t('common.view')}: ${tx(product.name)}`"><img :class="{ 'product-object': !product.editorial }" :src="product.image" :alt="tx(product.name)" width="640" height="640" loading="lazy" /></RouterLink><h3>{{ tx(product.name) }}</h3><p class="product-subtitle">{{ tx(product.subtitle) }}</p><GradientButton :to="`/product/${product.handle}`">{{ t('common.view') }}</GradientButton></article></template>