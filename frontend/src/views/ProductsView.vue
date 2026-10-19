<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, X } from 'lucide-vue-next'
import { products, categories } from '../data/site'
import { useLocale } from '../composables/useLocale'
import PageHero from '../components/PageHero.vue'
import ProductCard from '../components/ProductCard.vue'
import CallToAction from '../components/CallToAction.vue'
const { t, tx } = useLocale(), route = useRoute(), router = useRouter()
const query = computed(() => typeof route.query.q === 'string' ? route.query.q : '')
const category = computed(() => categories.some(c => c.id === route.query.category) ? route.query.category : 'all')
function update(key, value) { router.replace({ path: '/products', query: { ...route.query, [key]: value && value !== 'all' ? value : undefined }, hash: route.hash }) }
const filtered = computed(() => products.filter(p => (category.value === 'all' || p.category === category.value) && [p.name.en, p.name.zh, p.subtitle.en, p.subtitle.zh, p.category].join(' ').toLowerCase().includes(query.value.trim().toLowerCase())))
</script>
<template><main id="main-content"><PageHero page="products" image="dining"><a href="#catalogue" class="button button-dark">{{ t('products.catalogue') }}</a></PageHero><section id="catalogue" class="section-space section-muted"><div class="container"><div class="catalogue-heading"><div><p class="eyebrow">{{ t('common.collection') }}</p><h2>{{ t('products.catalogue') }}</h2></div><div class="catalogue-search"><label for="catalogue-search" class="sr-only">{{ t('common.searchLabel') }}</label><Search :size="20" /><input id="catalogue-search" :value="query" type="search" :placeholder="t('common.search')" @input="update('q', $event.target.value)" /></div></div><div class="category-filters" role="group" :aria-label="t('common.filter')"><button v-for="item in categories" :key="item.id" type="button" :aria-pressed="category === item.id" @click="update('category', item.id)">{{ tx(item.label) }}</button></div><div class="catalogue-summary"><p role="status">{{ filtered.length }} {{ t('common.results') }}</p><button v-if="query || category !== 'all'" type="button" class="text-button" @click="router.replace('/products#catalogue')">{{ t('common.reset') }}<X :size="15" /></button></div><div v-if="filtered.length" class="products-grid catalogue-grid"><ProductCard v-for="product in filtered" :key="product.handle" :product="product" /></div><div v-else class="empty-state"><h3>{{ t('common.empty') }}</h3><p>{{ t('common.emptyCopy') }}</p></div><p class="fine-print">{{ t('products.note') }}</p></div></section><CallToAction :title="t('products.bannerTitle')" :copy="t('products.bannerCopy')" /></main></template>