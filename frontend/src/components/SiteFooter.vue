<script setup>
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import { categories, navigation, contactNavigation } from '../data/site'
import { useLocale } from '../composables/useLocale'
import StoreLinks from './StoreLinks.vue'
const { t, tx } = useLocale(), router = useRouter(), search = ref('')
const openDialog = inject('openDialog')
function findProducts() { router.push({ path: '/products', query: search.value.trim() ? { q: search.value.trim() } : {} }) }
</script>
<template><footer class="site-footer"><div class="container">
<div class="footer-top"><div class="footer-signup"><RouterLink to="/" class="logo" aria-label="DLIM HOME"><img src="/images/brand/dlim-home.svg" alt="DLIM HOME" width="912" height="612" /></RouterLink><h2>{{ t('footer.title') }}</h2><p>{{ t('footer.copy') }}</p><form class="newsletter" role="search" @submit.prevent="findProducts"><label for="footer-search" class="sr-only">{{ t('common.searchLabel') }}</label><input id="footer-search" v-model="search" type="search" :placeholder="t('common.search')" /><button type="submit" :aria-label="t('common.searchButton')"><ArrowRight :size="22" /></button></form><p class="signup-privacy">{{ t('footer.searchNote') }}</p></div>
<div class="footer-links"><div><h3>{{ t('footer.collections') }}</h3><ul><li v-for="category in categories.slice(1)" :key="category.id"><RouterLink :to="`/products?category=${category.id}`">{{ tx(category.label) }}</RouterLink></li></ul></div><div><h3>{{ t('footer.company') }}</h3><ul><li v-for="link in navigation.filter(item => ['home', 'factory', 'about'].includes(item.key)).concat(contactNavigation)" :key="link.key"><RouterLink :to="link.to">{{ t(`nav.${link.key}`) }}</RouterLink></li></ul></div><div><h3>{{ t('footer.help') }}</h3><ul><li><RouterLink to="/support#care">{{ t('footer.care') }}</RouterLink></li><li><RouterLink to="/support#orders">{{ t('support.order') }}</RouterLink></li><li><RouterLink to="/contact/business-enquiry?interest=1">{{ t('footer.trade') }}</RouterLink></li><li><button type="button" @click="openDialog('common.policies', 'common.policiesCopy')">{{ t('footer.legal') }}</button></li></ul></div></div></div>
<div class="footer-middle"><StoreLinks /><p>{{ t('footer.line') }}</p></div><div class="footer-disclaimer"><p>{{ t('footer.small') }}</p></div><div class="footer-bottom"><span>© {{ new Date().getFullYear() }} DLIM HOME. {{ t('common.copyright') }}</span><span>{{ t('footer.bottom') }}</span></div>
</div></footer></template>