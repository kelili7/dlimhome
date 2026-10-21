<script setup>
import SplitText from './SplitText.vue'
import { useLocale } from '../composables/useLocale'
defineProps({ page: { type: String, required: true }, image: { type: String, default: '' }, imageSrc: { type: String, default: '' }, imageAlt: { type: String, default: '' }, caption: { type: String, default: '' } })
const { t } = useLocale()
</script>
<template><section class="page-hero container two-columns"><div><p class="eyebrow">{{ t(`${page}.label`) }}</p><SplitText tag="h1" :text="t(`${page}.title`)" /><p class="lead">{{ t(`${page}.intro`) }}</p><slot /></div><figure><img :src="imageSrc || `/images/ceramics/${image}.jpg`" :alt="imageAlt || t('common.imageNote')" width="720" height="720" /><figcaption v-if="caption">{{ caption }}</figcaption></figure></section></template>