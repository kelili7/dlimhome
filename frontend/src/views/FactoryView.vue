<script setup>
import SplitText from '../components/SplitText.vue'
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
<template><main ref="motionRoot" id="main-content"><PageHero page="factory" image="craft" :caption="t('factory.caption')"><GradientButton to="/contact/business-enquiry?interest=2">{{ t('factory.sample') }}</GradientButton></PageHero><section class="section-space section-muted"><div class="container"><div class="section-heading"><p class="eyebrow">{{ t('factory.processLabel') }}</p><SplitText tag="h2" :text="t('factory.processTitle')" /></div><div class="process-grid"><article v-for="(step, i) in craftSteps" :key="step.number" class="editorial-card editorial-card--illustrated"><EditorialCardHeader :number="step.number" :icon="craftIcons[i]" /><h3>{{ tx(step.title) }}</h3><p>{{ tx(step.text) }}</p></article></div></div></section><section class="section-space"><div class="container two-columns"><img class="editorial-image" src="/images/ceramics/atelier.jpg" :alt="t('common.imageNote')" loading="lazy" width="640" height="640" /><div><p class="eyebrow">DLIM HOME · {{ t('common.details') }}</p><SplitText tag="h2" :text="t('factory.qualityTitle')" /><p class="lead">{{ t('factory.qualityCopy') }}</p><ul class="plan-features"><li v-for="point in t('factory.qualityPoints')" :key="point"><CircleCheck :size="20" /><span>{{ point }}</span></li></ul></div></div></section><section class="section-space section-muted"><div class="container two-columns"><div><p class="eyebrow">{{ t('factory.customLabel') }}</p><SplitText tag="h2" :text="t('factory.customTitle')" /><p class="lead">{{ t('factory.customCopy') }}</p><GradientButton to="/contact/business-enquiry?interest=2">{{ t('factory.sample') }}</GradientButton></div><img class="editorial-image customization-image" src="/images/ceramics/personalized-customization.png" :alt="t('factory.customImageAlt')" loading="lazy" width="1536" height="1024" /></div></section></main></template>