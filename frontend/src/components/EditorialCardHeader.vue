<script setup>
defineProps({
  number: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
})
</script>

<template>
  <div class="editorial-card-header">
    <span class="editorial-card-icon" aria-hidden="true">
      <component :is="icon" :size="26" :stroke-width="1.4" />
    </span>
    <span class="step-number">{{ number }}</span>
  </div>
</template>
