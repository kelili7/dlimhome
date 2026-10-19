<script setup>
import { nextTick, provide, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from './composables/useLocale'
const { t, locale } = useLocale()
const route = useRoute()
watchEffect(() => {
 document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'
 document.title = `${t(route.meta.titleKey || 'nav.home')} | DLIM HOME`
 document.querySelector('meta[name=description]')?.setAttribute('content', t('about.intro'))
})
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
  <a class="skip-link" href="#main-content">{{ t('common.skip') }}</a><SiteHeader /><RouterView /><SiteFooter />
  <dialog ref="dialog" class="preview-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-copy" @click="closeBackdrop" @keydown.tab="keepDialogFocus"><div class="dialog-content"><button class="icon-button dialog-close" type="button" :aria-label="t('common.close')" @click="dialog.close()"><X /></button><p class="eyebrow">DLIM HOME</p><h2 id="dialog-title">{{ t(dialogTitle) }}</h2><p id="dialog-copy">{{ t(dialogCopy) }}</p><button class="button button-dark" type="button" @click="dialog.close()">{{ t('common.understood') }}</button></div></dialog>
</template>
