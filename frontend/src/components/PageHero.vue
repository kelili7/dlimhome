<script setup>
import AnimatedContent from './AnimatedContent.vue'
import { useLocale } from '../composables/useLocale'
defineProps({ page: { type: String, required: true }, image: { type: String, default: '' }, imageSrc: { type: String, default: '' }, imageAlt: { type: String, default: '' }, caption: { type: String, default: '' } })
const { t } = useLocale()
</script>
<template><section class="page-hero container two-columns"><AnimatedContent :stagger="0.08"><p class="eyebrow">{{ t(`${page}.label`) }}</p><h1>{{ t(`${page}.title`) }}</h1><p class="lead">{{ t(`${page}.intro`) }}</p><slot /></AnimatedContent><AnimatedContent tag="figure"><img :src="imageSrc || `/images/ceramics/${image}.jpg`" :alt="imageAlt || t('common.imageNote')" width="720" height="720" /><figcaption v-if="caption">{{ caption }}</figcaption></AnimatedContent></section></template>