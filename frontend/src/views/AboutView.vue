<script setup>
import SplitText from '../components/SplitText.vue'
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
     <div><div class="company-intro-label"><Building2 :size="22" :stroke-width="1.4" aria-hidden="true" /><p class="eyebrow">{{ t('background.label') }}</p></div><SplitText tag="h2" :text="t('background.title')" /></div>
     <div><h3 class="company-name"><img src="/images/brand/dlim-home.svg" :alt="t('background.name')" width="912" height="612" /></h3><p class="lead">{{ t('background.copy') }}</p><p class="body-copy">{{ t('background.detail') }}</p></div>
    </div>
    <dl class="company-facts"><div v-for="(fact, i) in t('background.facts')" :key="fact.label"><dt><component :is="factIcons[i]" :size="18" :stroke-width="1.5" aria-hidden="true" />{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div></dl>
    <div class="values-grid"><article v-for="(item, i) in t('background.pillars')" :key="item.title" class="editorial-card editorial-card--illustrated"><EditorialCardHeader :number="`0${i + 1}`" :icon="pillarIcons[i]" /><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article></div>
    <div class="company-markets"><p class="eyebrow">{{ t('background.marketsLabel') }}</p><SplitText tag="h3" :text="t('background.marketsTitle')" /><div class="two-columns"><article v-for="(market, i) in t('background.markets')" :key="market.label"><div class="market-heading"><p class="eyebrow">{{ market.label }}</p><component :is="marketIcons[i]" :size="28" :stroke-width="1.3" aria-hidden="true" /></div><h4>{{ market.title }}</h4><p class="body-copy">{{ market.text }}</p></article></div><WorldMapDemo /></div>
   </div>
  </section>
  <section class="section-space"><div class="container two-columns"><img class="editorial-image" src="/images/ceramics/ritual.jpg" :alt="t('common.imageNote')" loading="lazy" width="640" height="640" /><div><p class="eyebrow">{{ t('about.storyLabel') }}</p><SplitText tag="h2" :text="t('about.storyTitle')" /><p class="lead">{{ t('about.storyCopy') }}</p><RouterLink to="/factory" class="text-link">{{ t('common.factory') }} ↗</RouterLink></div></div></section>
  <section class="section-space section-muted"><div class="container"><div class="section-heading"><SplitText tag="h2" :text="t('about.valuesTitle')" /></div><div class="values-grid"><article v-for="(value, i) in brandValues" :key="value.number" class="editorial-card editorial-card--illustrated"><EditorialCardHeader :number="value.number" :icon="valueIcons[i]" /><h3>{{ tx(value.title) }}</h3><p>{{ tx(value.text) }}</p></article></div></div></section>
  <section class="section-space"><div class="container two-columns"><div><p class="eyebrow">{{ t('about.channelsLabel') }}</p><SplitText tag="h2" :text="t('about.channelsTitle')" /><p class="lead">{{ t('about.channelsCopy') }}</p><StoreLinks /></div><img class="editorial-image" src="/images/ceramics/dining.jpg" :alt="t('common.imageNote')" loading="lazy" width="640" height="640" /></div></section>
 </main>
</template>
