<script setup>
import { publicAsset } from '../utils/assets.js'
import AnimatedContent from '../components/AnimatedContent.vue'
import WorldMapDemo from '../components/WorldMapDemo.vue'
import { usePageMotion } from '../composables/usePageMotion'
const motionRoot = usePageMotion()
import { Building2, MapPin, Shapes, Layers, Factory, BadgeCheck, Leaf, Coffee, House, Globe2, Store } from 'lucide-vue-next'
import EditorialCardHeader from '../components/EditorialCardHeader.vue'
import { brandValues } from '../data/site'
import { useLocale } from '../composables/useLocale'
import PageHero from '../components/PageHero.vue'
import StoreLinks from '../components/StoreLinks.vue'
import GradientButton from '../components/GradientButton.vue'
const { t, tx } = useLocale()
const factIcons = [MapPin, Layers, Shapes]
const pillarIcons = [Shapes, Factory, BadgeCheck]
const valueIcons = [Leaf, Coffee, House]
const marketIcons = [Globe2, Store]
</script>
<template>
 <main ref="motionRoot" id="main-content">
  <PageHero page="about" image="gathering"><GradientButton to="/products">{{ t('common.explore') }}</GradientButton></PageHero>
  <section id="company-background" class="section-space section-muted">
   <div class="container">
    <div class="company-intro two-columns">
     <AnimatedContent :stagger="0.08"><div class="company-intro-label"><Building2 :size="22" :stroke-width="1.4" aria-hidden="true" /><p class="eyebrow">{{ t('background.label') }}</p></div><h2>{{ t('background.title') }}</h2></AnimatedContent>
     <AnimatedContent :stagger="0.08"><h3 class="company-name"><img :src="publicAsset('/images/brand/dlim-home.svg')" :alt="t('background.name')" width="912" height="612" /></h3><p class="lead">{{ t('background.copy') }}</p><p class="body-copy">{{ t('background.detail') }}</p></AnimatedContent>
    </div>
    <AnimatedContent tag="dl" :stagger="0.08" class="company-facts"><div v-for="(fact, i) in t('background.facts')" :key="fact.label"><dt><component :is="factIcons[i]" :size="18" :stroke-width="1.5" aria-hidden="true" />{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div></AnimatedContent>
    <AnimatedContent :stagger="0.08" class="values-grid"><article v-for="(item, i) in t('background.pillars')" :key="item.title" class="editorial-card editorial-card--illustrated"><EditorialCardHeader :number="`0${i + 1}`" :icon="pillarIcons[i]" /><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article></AnimatedContent>
    <div class="company-markets"><AnimatedContent tag="p" class="eyebrow">{{ t('background.marketsLabel') }}</AnimatedContent><AnimatedContent tag="h3">{{ t('background.marketsTitle') }}</AnimatedContent><div class="two-columns"><AnimatedContent tag="article" :stagger="0.08" v-for="(market, i) in t('background.markets')" :key="market.label"><div class="market-heading"><p class="eyebrow">{{ market.label }}</p><component :is="marketIcons[i]" :size="28" :stroke-width="1.3" aria-hidden="true" /></div><h4>{{ market.title }}</h4><p class="body-copy">{{ market.text }}</p></AnimatedContent></div><WorldMapDemo /></div>
   </div>
  </section>
  <section class="section-space"><div class="container two-columns"><AnimatedContent tag="img" class="editorial-image" :src="publicAsset('/images/ceramics/ritual.jpg')" :alt="t('common.imageNote')" loading="lazy" width="640" height="640" /><AnimatedContent :stagger="0.08"><p class="eyebrow">{{ t('about.storyLabel') }}</p><h2>{{ t('about.storyTitle') }}</h2><p class="lead">{{ t('about.storyCopy') }}</p><RouterLink to="/factory" class="text-link">{{ t('common.factory') }} ↗</RouterLink></AnimatedContent></div></section>
  <section class="section-space section-muted"><div class="container"><AnimatedContent :stagger="0.08" class="section-heading"><h2>{{ t('about.valuesTitle') }}</h2></AnimatedContent><AnimatedContent :stagger="0.08" class="values-grid"><article v-for="(value, i) in brandValues" :key="value.number" class="editorial-card editorial-card--illustrated"><EditorialCardHeader :number="value.number" :icon="valueIcons[i]" /><h3>{{ tx(value.title) }}</h3><p>{{ tx(value.text) }}</p></article></AnimatedContent></div></section>
  <section class="section-space"><div class="container two-columns"><AnimatedContent :stagger="0.08"><p class="eyebrow">{{ t('about.channelsLabel') }}</p><h2>{{ t('about.channelsTitle') }}</h2><p class="lead">{{ t('about.channelsCopy') }}</p><StoreLinks /></AnimatedContent><AnimatedContent tag="img" class="editorial-image" :src="publicAsset('/images/ceramics/dining.jpg')" :alt="t('common.imageNote')" loading="lazy" width="640" height="640" /></div></section>
 </main>
</template>
