<script setup>
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { products } from '../data/site'
import GradientButton from './GradientButton.vue'

const slides = [products[1], products[2], products[0]]
const active = ref(0)
const current = computed(() => slides[active.value])
function move(direction) { active.value = (active.value + direction + slides.length) % slides.length }
</script>

<template>
  <section class="carousel-section" aria-label="Explore care options">
    <div class="container carousel-layout">
      <article class="feature-product">
        <img :src="products[0].image" alt="Skincare product photography" loading="lazy" width="640" height="640" />
        <div class="feature-product-copy">
          <span class="eyebrow">A little care. A new beginning.</span>
          <p class="feature-price"><span>Starting at</span> $296<span>/mo</span></p>
          <h2>Compounded Semaglutide</h2>
          <GradientButton to="/product/semaglutide">Get Started</GradientButton>
        </div>
      </article>
      <div class="carousel" role="region" aria-roledescription="carousel" aria-label="More programs" @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)">
        <div class="carousel-viewport">
          <div class="carousel-track" :style="{ transform: `translateX(-${active * 100}%)` }">
            <article v-for="(product, index) in slides" :key="product.handle" class="feature-product carousel-slide" :aria-hidden="index !== active" :inert="index !== active" role="group" aria-roledescription="slide" :aria-label="`${index + 1} of ${slides.length}: ${product.name}`">
              <img :src="product.image" :alt="`${product.name} product photograph`" loading="lazy" width="640" height="640" />
              <div class="feature-product-copy">
                <span class="eyebrow">{{ product.category }}</span>
                <p class="feature-price"><span>Starting at</span> ${{ product.price }}<span>/mo</span></p>
                <h2>{{ product.name }}</h2>
                <GradientButton :to="`/product/${product.handle}`">Get Started</GradientButton>
              </div>
            </article>
          </div>
          <div class="carousel-arrows">
            <button type="button" class="icon-button" aria-label="Previous program" @click="move(-1)"><ChevronLeft /></button>
            <button type="button" class="icon-button" aria-label="Next program" @click="move(1)"><ChevronRight /></button>
          </div>
        </div>
        <div class="carousel-dots" aria-label="Choose a program">
          <button v-for="(product, index) in slides" :key="product.handle" type="button" :class="{ active: index === active }" :aria-label="`Show ${product.name}`" :aria-current="index === active ? 'true' : undefined" @click="active = index"><span></span></button>
        </div>
        <p class="sr-only" aria-live="polite">{{ current.name }}, {{ active + 1 }} of {{ slides.length }}</p>
      </div>
    </div>
  </section>
</template>
