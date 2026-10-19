<script setup>
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
 <main id="main-content">
  <PageHero page="about" image="gathering"><GradientButton to="/products">{{ t('common.explore') }}</GradientButton></PageHero>
  <section id="company-background" class="section-space section-muted">
   <div class="container">
    <div class="company-intro two-columns">
     <div><div class="company-intro-label"><Building2 :size="22" :stroke-width="1.4" aria-hidden="true" /><p class="eyebrow">{{ t('background.label') }}</p></div><h2>{{ t('background.title') }}</h2></div>
     <div><h3 class="company-name">{{ t('background.name') }}</h3><p class="lead">{{ t('background.copy') }}</p><p class="body-copy">{{ t('background.detail') }}</p></div>
    </div>
    <dl class="company-facts"><div v-for="(fact, i) in t('background.facts')" :key="fact.label"><dt><component :is="factIcons[i]" :size="18" :stroke-width="1.5" aria-hidden="true" />{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div></dl>
    <div class="values-grid"><article v-for="(item, i) in t('background.pillars')" :key="item.title" class="editorial-card editorial-card--illustrated"><EditorialCardHeader :number="`0${i + 1}`" :icon="pillarIcons[i]" /><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article></div>
    <div class="company-markets"><p class="eyebrow">{{ t('background.marketsLabel') }}</p><h3>{{ t('background.marketsTitle') }}</h3><div class="two-columns"><article v-for="(market, i) in t('background.markets')" :key="market.label"><div class="market-heading"><p class="eyebrow">{{ market.label }}</p><component :is="marketIcons[i]" :size="28" :stroke-width="1.3" aria-hidden="true" /></div><h4>{{ market.title }}</h4><p class="body-copy">{{ market.text }}</p></article></div></div>
   </div>
  </section>
  <section class="section-space"><div class="container two-columns"><img class="editorial-image" src="/images/ceramics/ritual.jpg" :alt="t('common.imageNote')" loading="lazy" width="640" height="640" /><div><p class="eyebrow">{{ t('about.storyLabel') }}</p><h2>{{ t('about.storyTitle') }}</h2><p class="lead">{{ t('about.storyCopy') }}</p><RouterLink to="/factory" class="text-link">{{ t('common.factory') }} ↗</RouterLink></div></div></section>
  <section class="section-space section-muted"><div class="container"><div class="section-heading"><h2>{{ t('about.valuesTitle') }}</h2></div><div class="values-grid"><article v-for="(value, i) in brandValues" :key="value.number" class="editorial-card editorial-card--illustrated"><EditorialCardHeader :number="value.number" :icon="valueIcons[i]" /><h3>{{ tx(value.title) }}</h3><p>{{ tx(value.text) }}</p></article></div></div></section>
  <section class="section-space"><div class="container two-columns"><div><p class="eyebrow">{{ t('about.channelsLabel') }}</p><h2>{{ t('about.channelsTitle') }}</h2><p class="lead">{{ t('about.channelsCopy') }}</p><StoreLinks /></div><img class="editorial-image" src="/images/ceramics/dining.jpg" :alt="t('common.imageNote')" loading="lazy" width="640" height="640" /></div></section>
 </main>
</template>
