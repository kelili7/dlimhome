<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X, Languages } from 'lucide-vue-next'
import { navigation } from '../data/site'
import { useLocale } from '../composables/useLocale'
import GradientButton from './GradientButton.vue'
const { locale, setLocale, t } = useLocale()
const route = useRoute(), menu = ref(false), toggle = ref(null)
watch(() => route.fullPath, () => { menu.value = false })
async function closeMenu() { menu.value = false; await nextTick(); toggle.value?.focus() }
</script>
<template>
<header class="site-header" @keydown.esc="closeMenu">
 <div class="container navbar">
  <RouterLink to="/" class="logo" aria-label="DLIM HOME">DLIM HOME<span class="brand-dot">.</span></RouterLink>
  <nav class="desktop-nav" :aria-label="t('nav.main')"><RouterLink v-for="link in navigation" :key="link.key" :to="link.to">{{ t(`nav.${link.key}`) }}</RouterLink></nav>
  <div class="nav-actions"><RouterLink to="/contact#stores" class="button button-dark nav-start">{{ t('common.shop') }}</RouterLink><GradientButton class="language-switch" :aria-label="locale === 'en' ? 'Switch to Chinese' : '切换至英文'" @click="setLocale(locale === 'en' ? 'zh' : 'en')"><Languages :size="17" />{{ locale === 'en' ? '中文' : 'EN' }}</GradientButton><button ref="toggle" class="icon-button menu-toggle" type="button" :aria-label="t(menu ? 'nav.close' : 'nav.open')" :aria-expanded="menu" aria-controls="mobile-navigation" @click="menu = !menu"><component :is="menu ? X : Menu" /></button></div>
 </div>
 <nav v-if="menu" id="mobile-navigation" class="mobile-nav container" :aria-label="t('nav.main')"><RouterLink v-for="link in navigation" :key="link.key" :to="link.to">{{ t(`nav.${link.key}`) }}</RouterLink></nav>
</header>
</template>