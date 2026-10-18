<script setup>
import { RouterLink } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({ to: { type: String, default: '' }, href: { type: String, default: '' } })
// Do not pass an undefined href to RouterLink: it overrides its generated URL.
const attributes = computed(() => props.to ? { to: props.to } : props.href ? { href: props.href } : { type: 'button' })
</script>

<template>
  <component :is="to ? RouterLink : href ? 'a' : 'button'" v-bind="attributes" class="gradient-button">
    <span class="gradient-button-inner"><slot /></span>
  </component>
</template>
