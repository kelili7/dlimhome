<script setup>
import AnimatedContent from './AnimatedContent.vue'
import { MessageSquareText } from 'lucide-vue-next'
import { useLocale } from '../composables/useLocale'
import GradientButton from './GradientButton.vue'
defineProps({ title: { type: String, required: true }, copy: { type: String, required: true } })
const { t } = useLocale()
</script>
<template><section class="section-space section-muted"><div class="container"><AnimatedContent :stagger="0.08" class="cta-panel"><div><span class="cta-icon" aria-hidden="true"><MessageSquareText :size="26" :stroke-width="1.4" /></span><h2>{{ title }}</h2><p class="lead">{{ copy }}</p></div><GradientButton to="/contact/business-enquiry">{{ t('common.enquire') }}</GradientButton></AnimatedContent></div></section></template>