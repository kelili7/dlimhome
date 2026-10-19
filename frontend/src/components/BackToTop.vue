<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { ArrowUp } from 'lucide-vue-next'
import { useLocale } from '../composables/useLocale'
const { t } = useLocale()
const visible = ref(false)
function updateVisibility() { visible.value = window.scrollY > 400 }
function backToTop() {
 // Move keyboard focus to a stable top-of-page destination before hiding the button.
 document.querySelector('.site-header .logo')?.focus({ preventScroll: true })
 window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
onMounted(() => {
 updateVisibility()
 window.addEventListener('scroll', updateVisibility, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', updateVisibility))
</script>
<template>
 <button v-if="visible" class="back-to-top" type="button" :aria-label="t('common.backToTop')" :title="t('common.backToTop')" @click="backToTop"><ArrowUp :size="20" aria-hidden="true" /><span>{{ t('common.backToTop') }}</span></button>
</template>
<style scoped>
.back-to-top { position: fixed; right: max(24px, env(safe-area-inset-right)); bottom: calc(24px + env(safe-area-inset-bottom)); z-index: 40; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-width: 48px; min-height: 48px; padding: 12px 18px; border: 1px solid hsl(var(--border)); border-radius: var(--radius); background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: var(--shadow); font-size: 13px; transition: opacity .2s; }
.back-to-top:hover { opacity: .85; }
@media (max-width: 600px) { .back-to-top { right: max(16px, env(safe-area-inset-right)); bottom: calc(16px + env(safe-area-inset-bottom)); padding: 12px; } .back-to-top span { display: none; } }
@media (prefers-reduced-motion: reduce) { .back-to-top { transition: none; } }
</style>
