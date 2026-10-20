<script setup>
import { usePageMotion } from '../composables/usePageMotion'
const motionRoot = usePageMotion()
import { useLocale } from '../composables/useLocale'
import GradientButton from '../components/GradientButton.vue'
const { t } = useLocale()
</script>
<template><main ref="motionRoot" id="main-content" class="container not-found"><p class="eyebrow">404 · DLIM HOME</p><h1>{{ t('common.missing') }}</h1><p>{{ t('common.missingCopy') }}</p><GradientButton to="/">{{ t('common.home') }}</GradientButton></main></template>