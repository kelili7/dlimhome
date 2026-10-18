<script setup>
import { inject } from 'vue'
import { Star, Syringe, DollarSign, Truck, ArrowUpRight, Calendar, Pill, CircleCheck, Rabbit, TreePine, Leaf, FlaskConical, Atom, Wheat, ChevronRight } from 'lucide-vue-next'
import { products, guides } from '../data/site'
import GradientButton from '../components/GradientButton.vue'
import ProductCard from '../components/ProductCard.vue'
import ProductMarquee from '../components/ProductMarquee.vue'
import ProductCarousel from '../components/ProductCarousel.vue'
import FaqSection from '../components/FaqSection.vue'
const openDialog = inject('openDialog')
const benefits = [{ icon: Syringe, text: 'Ingredient in Wegovy® & Ozempic®' }, { icon: DollarSign, text: 'No hidden fees' }, { icon: Truck, text: 'Free shipping' }]
const science = [{ icon: Rabbit, label: 'Cruelty\nFree' }, { icon: TreePine, label: 'Inspired by\nNature' }, { icon: Leaf, label: 'Thoughtfully\nSourced' }, { icon: FlaskConical, label: 'Backed by\nScience' }, { icon: Atom, label: 'Made with\nPrecision' }, { icon: Wheat, label: 'Simply\nBetter' }]
const showEligibility = () => openDialog('Is This Right for You?', 'This is the eligibility entry point in the frontend template. The consultation and assessment service will be connected in a later development phase.')
</script>

<template>
  <main id="main-content">
    <section class="hero container" aria-labelledby="hero-title">
      <div class="hero-content">
        <div class="rating-badge"><span class="rating-star"><Star :size="15" fill="currentColor" /></span><span><strong>4.5</strong> Average Rating <span class="rating-separator">•</span> 453 Reviews</span></div>
        <h1 id="hero-title">Compounded Semaglutide for Weight Loss</h1>
        <ul class="hero-benefits"><li v-for="benefit in benefits" :key="benefit.text"><component :is="benefit.icon" :size="20" :stroke-width="1.5" /><span>{{ benefit.text }}</span></li></ul>
        <div class="hero-pricing"><div><p><strong>$296</strong><span>/mo</span></p><small>*No matter the dose</small></div><RouterLink to="/product/semaglutide" class="button button-dark">Get Started</RouterLink></div>
        <button class="info-card" type="button" @click="showEligibility"><img src="/images/tubes.jpg" alt="" width="96" height="96" /><span><strong>Is This Right for You?</strong><small><CircleCheck :size="14" fill="currentColor" /> Find Out</small></span><ArrowUpRight :size="20" /></button>
      </div>
      <ProductMarquee />
    </section>
    <section id="products" class="products-section section-space" aria-labelledby="products-title">
      <div class="container"><div class="section-heading"><p class="eyebrow">OUR MEDS</p><h2 id="products-title">Medication Made Affordable<br class="desktop-break" /> Without The Insurance</h2></div><div class="products-grid"><ProductCard v-for="product in products" :key="product.handle" :product="product" /></div></div>
    </section>
    <section id="weight-loss" class="weight-loss section-muted section-space" aria-labelledby="weight-loss-title">
      <div class="container two-columns"><div class="weight-loss-content"><h2 id="weight-loss-title">Lose weight with a plan made just for you.</h2><ul class="plan-features"><li><Calendar :stroke-width="1.5" /><span>Same-day doctor visits and prescriptions</span></li><li><Pill :stroke-width="1.5" /><span>Access Ozempic®, Wegovy®, Zepbound®, and other GLP-1s</span></li><li><CircleCheck :stroke-width="1.5" /><span>FSA & HSA eligible with all plans</span></li></ul><div class="button-row"><RouterLink to="/#products" class="button button-dark">Get started</RouterLink><GradientButton @click="showEligibility">See if you’re eligible</GradientButton></div><p class="fine-print">*Template demonstration. Services, product eligibility and results depend on the actual provider and individual assessment.</p></div><img class="weight-loss-image" src="/images/fitness.jpg" alt="Woman exercising with a resistance band" loading="lazy" width="640" height="640" /></div>
    </section>
    <ProductCarousel />
    <section id="science" class="science-section section-muted section-space" aria-labelledby="science-title">
      <div class="container"><div class="section-heading"><h2 id="science-title">Discover the harmony<br class="desktop-break" /> of science and nature.</h2><div class="button-row centered"><RouterLink to="/#products" class="button button-dark">Get started</RouterLink><GradientButton href="#guides">Learn more</GradientButton></div></div><div class="science-grid"><article v-for="badge in science" :key="badge.label" class="science-badge"><component :is="badge.icon" :size="80" :stroke-width="1.5" /><h3>{{ badge.label }}</h3></article></div></div>
    </section>
    <FaqSection />
    <section id="guides" class="guides-section section-muted section-space" aria-labelledby="guides-title">
      <div class="container"><div class="section-heading"><h2 id="guides-title">Your guide to health and<br class="desktop-break" /> wellness starts here.</h2><div class="button-row centered"><RouterLink to="/#products" class="button button-dark">Get started</RouterLink><GradientButton href="#guide-cards">Explore the guide</GradientButton></div></div><div id="guide-cards" class="guide-grid"><article v-for="guide in guides" :key="guide.category" class="guide-card"><img :src="guide.image" :alt="guide.category" width="480" height="320" loading="lazy" /><div class="guide-card-content"><h3>{{ guide.title }}</h3><button type="button" class="guide-link" @click="openDialog(guide.category, `${guide.title} This is a sample guide card, ready for your own editorial content.`)">{{ guide.category }}<ChevronRight :size="18" /></button></div></article></div></div>
    </section>
  </main>
</template>
