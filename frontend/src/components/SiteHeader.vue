<script setup>
import { inject } from 'vue'
import { User } from 'lucide-vue-next'
import { navigation } from '../data/site'
import GradientButton from './GradientButton.vue'

const openDialog = inject('openDialog')
</script>

<template>
  <header class="site-header">
    <div class="container navbar">
      <RouterLink to="/" class="logo" aria-label="Logo home">Logo</RouterLink>
      <nav class="desktop-nav" aria-label="Main navigation">
        <RouterLink v-for="link in navigation" :key="link.label" :to="link.to">{{ link.label }}</RouterLink>
      </nav>
      <div class="nav-actions">
        <RouterLink to="/#products" class="button button-dark nav-start">Get started</RouterLink>
        <GradientButton @click="openDialog('Login', 'This is a frontend template preview. Account sign-in will be connected when the service is configured.')"><User :size="18" /> Login</GradientButton>
      </div>
    </div>
  </header>
</template>
