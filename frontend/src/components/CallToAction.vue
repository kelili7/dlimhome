<script setup>
import { MessageSquareText } from 'lucide-vue-next'
import { useLocale } from '../composables/useLocale'
import GradientButton from './GradientButton.vue'
defineProps({ title: { type: String, required: true }, copy: { type: String, required: true } })
const { t } = useLocale()
</script>
<template><section class="section-space section-muted"><div class="container"><div class="cta-panel"><div><span class="cta-icon" aria-hidden="true"><MessageSquareText :size="26" :stroke-width="1.4" /></span><h2>{{ title }}</h2><p class="lead">{{ copy }}</p></div><GradientButton to="/contact/business-enquiry">{{ t('common.enquire') }}</GradientButton></div></div></section></template>