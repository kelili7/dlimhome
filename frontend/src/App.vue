<script setup>
import { nextTick, provide, ref } from 'vue'
import { X } from 'lucide-vue-next'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
const dialog = ref(null)
const dialogTitle = ref('')
const dialogCopy = ref('')
async function openDialog(title, copy) {
  dialogTitle.value = title
  dialogCopy.value = copy
  await nextTick()
  dialog.value.showModal()
}
provide('openDialog', openDialog)
function closeBackdrop(event) { if (event.target === dialog.value) dialog.value.close() }
function keepDialogFocus(event) {
  const buttons = [...dialog.value.querySelectorAll('button')]
  const first = buttons[0]
  const last = buttons.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>
<template>
  <a class="skip-link" href="#main-content">Skip to content</a><SiteHeader /><RouterView /><SiteFooter />
  <dialog ref="dialog" class="preview-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-copy" @click="closeBackdrop" @keydown.tab="keepDialogFocus"><div class="dialog-content"><button class="icon-button dialog-close" type="button" aria-label="Close dialog" @click="dialog.close()"><X /></button><p class="eyebrow">Template preview</p><h2 id="dialog-title">{{ dialogTitle }}</h2><p id="dialog-copy">{{ dialogCopy }}</p><button class="button button-dark" type="button" @click="dialog.close()">Got it</button></div></dialog>
</template>
