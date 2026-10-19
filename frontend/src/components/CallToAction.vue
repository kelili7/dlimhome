<script setup>
import { useLocale } from '../composables/useLocale'
import GradientButton from './GradientButton.vue'
defineProps({ title: { type: String, required: true }, copy: { type: String, required: true } })
const { t } = useLocale()
</script>
<template><section class="section-space section-muted"><div class="container"><div class="cta-panel"><div><h2>{{ title }}</h2><p class="lead">{{ copy }}</p></div><GradientButton to="/contact">{{ t('common.enquire') }}</GradientButton></div></div></section></template>