import { ref } from 'vue'
import { messages } from '../data/messages'

function initialLocale() {
  try {
    const savedLocale = localStorage.getItem('dlim-locale')
    return ['en', 'zh'].includes(savedLocale) ? savedLocale : 'zh'
  }
  catch { return 'zh' }
}
const locale = ref(initialLocale())

export function useLocale() {
  function setLocale(value) {
    if (!['en', 'zh'].includes(value)) return
    locale.value = value
    try { localStorage.setItem('dlim-locale', value) } catch { /* Storage can be disabled. */ }
  }
  function tx(value) {
    if (value == null) return ''
    return typeof value === 'object' ? value[locale.value] ?? value.en ?? '' : value
  }
  function t(key) {
    return key.split('.').reduce((value, part) => value?.[part], messages[locale.value]) ?? key
  }
  return { locale, setLocale, tx, t }
}
