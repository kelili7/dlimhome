<script setup>
import AnimatedContent from '../components/AnimatedContent.vue'
import { usePageMotion } from '../composables/usePageMotion'
const motionRoot = usePageMotion()
import { computed } from 'vue'
import { ArrowUpRight, BookOpen, Users, Coffee, HeartHandshake, Mail, ShieldCheck, Check, Shapes, Globe2 } from 'lucide-vue-next'
import { useLocale } from '../composables/useLocale'
import EditorialCardHeader from '../components/EditorialCardHeader.vue'
import PageHero from '../components/PageHero.vue'
import ContactNavigation from '../components/ContactNavigation.vue'
const { t } = useLocale()
const reasonIcons = [Shapes, Globe2, Users]
const benefitIcons = [BookOpen, Users, Coffee, HeartHandshake]
const workplacePhotos = ['shared-space', 'studio', 'office']
const sections = ['why', 'benefits', 'process', 'apply']
const applicationLink = computed(() => `mailto:hr@dlim.com?subject=${encodeURIComponent(t('careers.subject'))}`)
</script>
<template>
 <main ref="motionRoot" id="main-content" class="careers-page">
  <ContactNavigation />
  <PageHero page="careers" image-src="/images/company/office.jpg" :image-alt="t('careers.workplacePhotos')[2]"><a href="#apply" class="button button-dark">{{ t('careers.applyCta') }}<ArrowUpRight :size="18" aria-hidden="true" /></a></PageHero>
  <AnimatedContent tag="nav" :stagger="0.08" class="careers-contents container" :aria-label="t('careers.contents')"><a v-for="(section, i) in sections" :key="section" :href="`#${section}`"><span>0{{ i + 1 }}</span>{{ t(`careers.${section}Title`) }}<ArrowUpRight :size="16" aria-hidden="true" /></a></AnimatedContent>
  <section id="why" class="section-space section-muted"><div class="container">
   <AnimatedContent :stagger="0.08" class="section-heading"><p class="eyebrow">{{ t('careers.whyLabel') }}</p><h2>{{ t('careers.whyTitle') }}</h2><p class="lead">{{ t('careers.whyIntro') }}</p></AnimatedContent>
   <AnimatedContent :stagger="0.08" class="values-grid"><article v-for="(reason, i) in t('careers.reasons')" :key="reason.title" class="editorial-card editorial-card--illustrated"><EditorialCardHeader :number="`0${i + 1}`" :icon="reasonIcons[i]" /><h3>{{ reason.title }}</h3><p>{{ reason.text }}</p></article></AnimatedContent>
   <AnimatedContent :stagger="0.08" class="workplace-heading"><p class="eyebrow">{{ t('careers.workplaceLabel') }}</p><h3>{{ t('careers.workplaceTitle') }}</h3><p class="lead">{{ t('careers.workplaceCopy') }}</p></AnimatedContent>
   <AnimatedContent :stagger="0.08" class="workplace-gallery"><figure v-for="(photo, i) in workplacePhotos" :key="photo"><a :href="`/images/company/${photo}.jpg`" target="_blank" rel="noopener noreferrer" :aria-label="`${t('careers.viewPhoto')} · ${t('careers.workplacePhotos')[i]}`"><img :src="`/images/company/${photo}.jpg`" :alt="t('careers.workplacePhotos')[i]" loading="lazy" width="1350" height="1800" /><span class="photo-expand" aria-hidden="true"><ArrowUpRight :size="18" /></span></a><figcaption><span>0{{ i + 1 }}</span>{{ t('careers.workplacePhotos')[i] }}</figcaption></figure></AnimatedContent>
  </div></section>
  <section id="benefits" class="section-space"><div class="container benefits-layout">
   <AnimatedContent :stagger="0.08"><p class="eyebrow">{{ t('careers.benefitsLabel') }}</p><h2>{{ t('careers.benefitsTitle') }}</h2><p class="lead">{{ t('careers.benefitsIntro') }}</p></AnimatedContent>
   <AnimatedContent :stagger="0.08"><div class="benefits-grid"><article v-for="(benefit, i) in t('careers.benefits')" :key="benefit.title" class="benefit-item"><component :is="benefitIcons[i]" :size="26" :stroke-width="1.4" aria-hidden="true" /><h3>{{ benefit.title }}</h3><p>{{ benefit.text }}</p></article></div><p class="content-note">{{ t('careers.benefitsNote') }}</p></AnimatedContent>
  </div></section>
  <section id="process" class="section-space section-muted"><div class="container">
   <AnimatedContent :stagger="0.08" class="section-heading"><p class="eyebrow">{{ t('careers.processLabel') }}</p><h2>{{ t('careers.processTitle') }}</h2><p class="lead">{{ t('careers.processIntro') }}</p></AnimatedContent>
   <AnimatedContent tag="ol" :stagger="0.08" class="process-grid recruitment-steps"><li v-for="(step, i) in t('careers.steps')" :key="step.title"><span class="process-number">0{{ i + 1 }}</span><h3>{{ step.title }}</h3><p>{{ step.text }}</p></li></AnimatedContent>
   <p class="content-note">{{ t('careers.processNote') }}</p>
  </div></section>
  <section id="apply" class="section-space"><div class="container"><AnimatedContent :stagger="0.08" class="application-panel">
   <div><p class="eyebrow">{{ t('careers.applyLabel') }}</p><h2>{{ t('careers.applyTitle') }}</h2><p class="lead">{{ t('careers.applyIntro') }}</p><ul class="application-materials"><li v-for="item in t('careers.materials')" :key="item"><Check :size="18" aria-hidden="true" /><span>{{ item }}</span></li></ul></div>
   <div class="application-contact"><Mail :size="28" :stroke-width="1.3" aria-hidden="true" /><p class="eyebrow">{{ t('careers.emailLabel') }}</p><a :href="applicationLink" class="application-email">hr@dlim.com<ArrowUpRight :size="24" aria-hidden="true" /></a><div class="email-subject"><span>{{ t('careers.subjectLabel') }}</span><strong>{{ t('careers.subject') }}</strong></div><p class="application-tip">{{ t('careers.tip') }}</p><p class="application-privacy"><ShieldCheck :size="18" aria-hidden="true" /><span>{{ t('careers.privacy') }}</span></p><p class="content-note">{{ t('careers.mailNote') }}</p></div>
  </AnimatedContent></div></section>
 </main>
</template>
