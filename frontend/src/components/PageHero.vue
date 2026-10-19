<script setup>
import { useLocale } from '../composables/useLocale'
defineProps({ page: { type: String, required: true }, image: { type: String, required: true }, caption: { type: String, default: '' } })
const { t } = useLocale()
</script>
<template><section class="page-hero container two-columns"><div><p class="eyebrow">{{ t(`${page}.label`) }}</p><h1>{{ t(`${page}.title`) }}</h1><p class="lead">{{ t(`${page}.intro`) }}</p><slot /></div><figure><img :src="`/images/ceramics/${image}.jpg`" :alt="t('common.imageNote')" width="720" height="720" /><figcaption v-if="caption">{{ caption }}</figcaption></figure></section></template>