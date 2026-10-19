<script setup>
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useLocale } from '../composables/useLocale'
const { t, tx } = useLocale()
import { faqs } from '../data/site'

const expanded = ref(null)
function focusQuestion(event, index) {
  const buttons = [...event.currentTarget.closest('.faq-list').querySelectorAll('.faq-trigger')]
  const target = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
  buttons[target].focus()
}
</script>

<template>
  <section id="faq" class="faq-section section-muted" aria-labelledby="faq-heading">
    <div class="container">
      <div class="section-heading"><p class="eyebrow">{{ t('support.faqLabel') }}</p><h2 id="faq-heading">{{ t('support.faqTitle') }}</h2></div>
      <div class="faq-list">
        <article v-for="(faq, index) in faqs" :key="index" class="faq-item" :class="{ expanded: expanded === index }">
          <h3><button :id="`faq-trigger-${index}`" type="button" class="faq-trigger" :aria-expanded="expanded === index" :aria-controls="`faq-panel-${index}`" @click="expanded = expanded === index ? null : index" @keydown.down.prevent="focusQuestion($event, index)" @keydown.up.prevent="focusQuestion($event, index)" @keydown.home.prevent="focusQuestion($event, index)" @keydown.end.prevent="focusQuestion($event, index)">{{ tx(faq.question) }}<Plus :size="24" /></button></h3>
          <div :id="`faq-panel-${index}`" class="faq-answer" role="region" :aria-labelledby="`faq-trigger-${index}`" :aria-hidden="expanded !== index" :inert="expanded !== index"><div><p>{{ tx(faq.answer) }}</p></div></div>
        </article>
      </div>
    </div>
  </section>
</template>
