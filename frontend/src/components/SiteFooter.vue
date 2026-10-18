<script setup>
import { inject, onMounted, ref } from 'vue'
import { ArrowRight, Facebook, Instagram, Linkedin, Youtube, ShieldCheck, Cross } from 'lucide-vue-next'
const openDialog = inject('openDialog')
const email = ref('')
const subscribed = ref(false)
const apiStatus = ref('正在连接后台服务…')
const apiOnline = ref(false)
const groups = [
  { title: 'Popular', links: [{ label: 'Weight Loss', to: '/#weight-loss' }, { label: 'Strength', to: '/#products' }, { label: 'Anti-Aging', to: '/product/anti-aging' }, { label: 'Hair Growth', to: '/product/hair-growth' }, { label: 'Mood', to: '/#guides' }] },
  { title: 'Company', links: [{ label: 'About us', to: '/#science' }, { label: 'Health guide', to: '/#guides' }, { label: 'FAQs', to: '/#faq' }, { label: 'Contact us', dialog: 'Contact us' }] },
  { title: 'Legal', links: [{ label: 'Privacy policy', dialog: 'Privacy policy' }, { label: 'Terms of service', dialog: 'Terms of service' }, { label: 'Refund policy', dialog: 'Refund policy' }, { label: 'Accessibility', dialog: 'Accessibility' }] },
]
function showPage(title) { openDialog(title, 'This template section is ready for your own content. Service policies, social profiles and contact details have not been configured.') }
onMounted(async () => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/health/`, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    await response.json()
    apiOnline.value = true
    apiStatus.value = '后台服务运行正常'
  } catch { apiStatus.value = '后台服务暂未启动' }
  finally { clearTimeout(timeout) }
})
</script>
<template>
  <footer class="site-footer"><div class="container">
    <div class="footer-top"><div class="footer-signup"><RouterLink to="/" class="logo">Logo</RouterLink><h2>A little wellness in your inbox.</h2><p>Fresh perspectives. Thoughtful tips. Stay in the loop.</p><form class="newsletter" @submit.prevent="subscribed = true"><label for="newsletter-email" class="sr-only">Email address</label><input id="newsletter-email" v-model="email" type="email" placeholder="Enter your email address" autocomplete="email" required @input="subscribed = false" /><button type="submit" aria-label="Subscribe to newsletter"><ArrowRight :size="22" /></button></form><p v-if="subscribed" class="newsletter-result" role="status">Preview only — your email has not been submitted.</p><p class="signup-privacy">By subscribing, you agree to our <button type="button" @click="showPage('Privacy policy')">Privacy Policy</button>.</p></div><div class="footer-links"><div v-for="group in groups" :key="group.title"><h3>{{ group.title }}</h3><ul><li v-for="link in group.links" :key="link.label"><RouterLink v-if="link.to" :to="link.to">{{ link.label }}</RouterLink><button v-else type="button" @click="showPage(link.dialog)">{{ link.label }}</button></li></ul></div></div></div>
    <div class="footer-middle"><div class="social-links" aria-label="Social media"><button v-for="social in [{ name: 'Facebook', icon: Facebook }, { name: 'Instagram', icon: Instagram }]" :key="social.name" type="button" :aria-label="social.name" @click="showPage(social.name)"><component :is="social.icon" :size="20" /></button><button type="button" aria-label="X" @click="showPage('X')"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.2-8.3L.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.5L17.8 20Z" /></svg></button><button type="button" aria-label="TikTok" @click="showPage('TikTok')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 3v12a5 5 0 1 1-5-5M14 3c1 4 3 5 7 5" /></svg></button><button v-for="social in [{ name: 'LinkedIn', icon: Linkedin }, { name: 'YouTube', icon: Youtube }]" :key="social.name" type="button" :aria-label="social.name" @click="showPage(social.name)"><component :is="social.icon" :size="20" /></button></div><div class="footer-badges"><div><ShieldCheck :size="30" /><span>LegitScript<small>Badge placeholder</small></span></div><div><Cross :size="30" /><span>Compounding pharmacy<small>Badge placeholder</small></span></div></div></div>
    <div class="footer-disclaimer"><p>Design template preview. Ratings, prices and marketing copy reproduce the reference or serve as sample content. Photos are replaceable stock imagery. Badges are placeholders. This preview does not provide medical services, purchases, subscriptions or account services.</p></div><div class="footer-bottom"><span>© {{ new Date().getFullYear() }} Logo. All rights reserved.</span><span class="service-status" role="status"><span :class="['status-dot', { online: apiOnline }]" />{{ apiStatus }}</span></div>
  </div></footer>
</template>
