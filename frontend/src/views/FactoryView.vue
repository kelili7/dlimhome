<script setup>
import { publicAsset } from '../utils/assets.js'
import AnimatedContent from '../components/AnimatedContent.vue'
import { usePageMotion } from '../composables/usePageMotion'
const motionRoot = usePageMotion()
import { CircleCheck, Compass, Shapes, Palette, PackageCheck } from 'lucide-vue-next'
import { craftSteps } from '../data/site'
import { useLocale } from '../composables/useLocale'
import EditorialCardHeader from '../components/EditorialCardHeader.vue'
import PageHero from '../components/PageHero.vue'
import GradientButton from '../components/GradientButton.vue'
const { t, tx } = useLocale()
const craftIcons = [Compass, Shapes, Palette, PackageCheck]
</script>
<template><main ref="motionRoot" id="main-content"><PageHero page="factory" image="craft" :caption="t('factory.caption')"><GradientButton to="/contact/business-enquiry?interest=2">{{ t('factory.sample') }}</GradientButton></PageHero><section class="section-space section-muted"><div class="container"><AnimatedContent :stagger="0.08" class="section-heading"><p class="eyebrow">{{ t('factory.processLabel') }}</p><h2>{{ t('factory.processTitle') }}</h2></AnimatedContent><AnimatedContent :stagger="0.08" class="process-grid"><article v-for="(step, i) in craftSteps" :key="step.number" class="editorial-card editorial-card--illustrated"><EditorialCardHeader :number="step.number" :icon="craftIcons[i]" /><h3>{{ tx(step.title) }}</h3><p>{{ tx(step.text) }}</p></article></AnimatedContent></div></section><section class="section-space"><div class="container two-columns"><AnimatedContent tag="img" class="editorial-image" :src="publicAsset('/images/ceramics/atelier.jpg')" :alt="t('common.imageNote')" loading="lazy" width="640" height="640" /><AnimatedContent :stagger="0.08"><p class="eyebrow">DLIM HOME · {{ t('common.details') }}</p><h2>{{ t('factory.qualityTitle') }}</h2><p class="lead">{{ t('factory.qualityCopy') }}</p><ul class="plan-features"><li v-for="point in t('factory.qualityPoints')" :key="point"><CircleCheck :size="20" /><span>{{ point }}</span></li></ul></AnimatedContent></div></section><section class="section-space section-muted"><div class="container two-columns"><AnimatedContent :stagger="0.08"><p class="eyebrow">{{ t('factory.customLabel') }}</p><h2>{{ t('factory.customTitle') }}</h2><p class="lead">{{ t('factory.customCopy') }}</p><GradientButton to="/contact/business-enquiry?interest=2">{{ t('factory.sample') }}</GradientButton></AnimatedContent><AnimatedContent tag="img" class="editorial-image customization-image" :src="publicAsset('/images/ceramics/personalized-customization.png')" :alt="t('factory.customImageAlt')" loading="lazy" width="1536" height="1024" /></div></section></main></template>