<script setup>
import { publicAsset } from '../utils/assets.js'
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X, Languages, ChevronDown } from 'lucide-vue-next'
import { navigation } from '../data/site'
import { useLocale } from '../composables/useLocale'
import GradientButton from './GradientButton.vue'
const { locale, setLocale, t } = useLocale()
const route = useRoute(), menu = ref(false), contactOpen = ref(false), toggle = ref(null), contactToggle = ref(null)
watch(() => route.fullPath, () => { menu.value = false; contactOpen.value = false })
async function closeMenu() {
 if (contactOpen.value) { contactOpen.value = false; await nextTick(); contactToggle.value?.focus() }
 else if (menu.value) { menu.value = false; await nextTick(); toggle.value?.focus() }
}
function closeOnLeave(event) { if (!event.currentTarget.contains(event.relatedTarget)) contactOpen.value = false }
</script>
<template>
<header class="site-header" @keydown.esc="closeMenu">
 <div class="container navbar">
  <RouterLink to="/" class="logo" aria-label="DLIM HOME"><img :src="publicAsset('/images/brand/dlim-home.svg')" alt="DLIM HOME" width="912" height="612" /></RouterLink>
  <nav class="desktop-nav" :aria-label="t('nav.main')">
   <template v-for="link in navigation" :key="link.key">
    <RouterLink v-if="!link.children" class="primary-nav-item" :to="link.to">{{ t(`nav.${link.key}`) }}</RouterLink>
    <div v-else class="nav-dropdown" @focusout="closeOnLeave" @pointerleave="contactOpen = false">
     <button :ref="el => contactToggle = el" class="nav-dropdown-trigger primary-nav-item" :class="{ 'is-active': route.path.startsWith('/contact/') }" type="button" :aria-expanded="contactOpen" aria-controls="contact-navigation" @click="contactOpen = !contactOpen">{{ t(`nav.${link.key}`) }}<ChevronDown :size="14" aria-hidden="true" /></button>
     <div v-if="contactOpen" id="contact-navigation" class="nav-dropdown-panel">
      <RouterLink v-for="child in link.children" :key="child.key" :to="child.to" @click="contactOpen = false">{{ t(`nav.${child.key}`) }}</RouterLink>
     </div>
    </div>
   </template>
  </nav>
  <div class="nav-actions">
   <RouterLink to="/contact/business-enquiry#stores" class="button button-dark nav-start">{{ t('common.shop') }}</RouterLink>
   <GradientButton class="language-switch" :aria-label="locale === 'en' ? 'Switch to Chinese' : '切换至英文'" @click="setLocale(locale === 'en' ? 'zh' : 'en')"><Languages :size="17" />{{ locale === 'en' ? '中文' : 'EN' }}</GradientButton>
   <button ref="toggle" class="icon-button menu-toggle" type="button" :aria-label="t(menu ? 'nav.close' : 'nav.open')" :aria-expanded="menu" aria-controls="mobile-navigation" @click="menu = !menu; contactOpen = false"><component :is="menu ? X : Menu" /></button>
  </div>
 </div>
 <nav v-if="menu" id="mobile-navigation" class="mobile-nav container" :aria-label="t('nav.main')">
  <template v-for="link in navigation" :key="link.key">
   <RouterLink v-if="!link.children" :to="link.to">{{ t(`nav.${link.key}`) }}</RouterLink>
   <div v-else class="mobile-nav-group"><span>{{ t(`nav.${link.key}`) }}</span><RouterLink v-for="child in link.children" :key="child.key" :to="child.to" @click="menu = false">{{ t(`nav.${child.key}`) }}</RouterLink></div>
  </template>
 </nav>
</header>
</template>
