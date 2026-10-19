<script setup>
import { ArrowUpRight } from 'lucide-vue-next'
import { stores } from '../data/site'
import { useLocale } from '../composables/useLocale'
const { t } = useLocale()
</script>
<template><div class="button-row store-links"><a v-for="(url, name) in stores" :key="name" :href="url" target="_blank" rel="noopener noreferrer" class="button store-button">{{ t(`common.${name}`) }}<ArrowUpRight :size="18" /></a></div></template>