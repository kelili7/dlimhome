<script setup>
import { guides } from '../data/site'
import { useLocale } from '../composables/useLocale'
import PageHero from '../components/PageHero.vue'
import FaqSection from '../components/FaqSection.vue'
const { t, tx } = useLocale()
</script>
<template><main id="main-content"><PageHero page="support" image="ritual"><div class="support-shortcuts"><a v-for="guide in guides" :key="guide.id" :href="`#${guide.id}`" class="guide-link">{{ tx(guide.category) }} ↘</a></div></PageHero><section v-for="(guide, i) in guides" :id="guide.id" :key="guide.id" class="section-space guide-article" :class="{ 'section-muted': i % 2 === 0 }"><div class="container two-columns" :class="{ 'image-first': i % 2 === 0 }"><div><p class="eyebrow">0{{ i + 1 }} / {{ tx(guide.category) }}</p><h2>{{ tx(guide.title) }}</h2><p v-for="(paragraph, index) in guide.paragraphs" :key="index" class="lead">{{ tx(paragraph) }}</p><RouterLink v-if="guide.id === 'trade'" class="button button-dark" to="/contact/business-enquiry?interest=1">{{ t('common.enquire') }}</RouterLink></div><img class="editorial-image" :src="guide.image" :alt="tx(guide.category)" loading="lazy" width="640" height="640" /></div></section><FaqSection include-contact class="faq-section--last" /></main></template>