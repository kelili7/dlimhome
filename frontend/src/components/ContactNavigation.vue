<script setup>
import { contactNavigation } from '../data/site'
import { useLocale } from '../composables/useLocale'
const { t } = useLocale()
</script>
<template>
 <nav class="contact-navigation container" :aria-label="t('nav.contact')">
  <span>{{ t('nav.contact') }}</span>
  <div><RouterLink v-for="link in contactNavigation" :key="link.key" :to="link.to">{{ t(`nav.${link.key}`) }}</RouterLink></div>
 </nav>
</template>
