import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import { ScrollTrigger, waitForPage, reducedMotion, scrollToAnchor, stopAnchorScroll } from './motion/gsap'
import HomeView from './views/HomeView.vue'
import ProductsView from './views/ProductsView.vue'
import FactoryView from './views/FactoryView.vue'
import AboutView from './views/AboutView.vue'
import SupportView from './views/SupportView.vue'
import ContactView from './views/ContactView.vue'
import JoinView from './views/JoinView.vue'
import ProductView from './views/ProductView.vue'
import NotFoundView from './views/NotFoundView.vue'
const router = createRouter({
 history: createWebHistory(import.meta.env.BASE_URL),
 routes: [
  { path: '/', component: HomeView, meta: { titleKey: 'nav.home' } },
  { path: '/products', component: ProductsView, meta: { titleKey: 'nav.products' } },
  { path: '/factory', component: FactoryView, meta: { titleKey: 'nav.factory' } },
  { path: '/about', component: AboutView, meta: { titleKey: 'nav.about' } },
  { path: '/support', component: SupportView, meta: { titleKey: 'nav.support' } },
  { path: '/contact', redirect: to => ({ path: '/contact/business-enquiry', query: to.query, hash: to.hash }) },
  { path: '/contact/business-enquiry', component: ContactView, meta: { titleKey: 'nav.business' } },
  { path: '/contact/join-us', component: JoinView, meta: { titleKey: 'nav.join' } },
  { path: '/product/:handle', component: ProductView, meta: { titleKey: 'nav.products' } },
  { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { titleKey: 'common.missing' } },
 ],
 async scrollBehavior(to, from, savedPosition) {
  await waitForPage(to.path, () => router.currentRoute.value.fullPath === to.fullPath)
  if (router.currentRoute.value.fullPath !== to.fullPath) return false
  if (savedPosition) return { ...savedPosition, behavior: 'instant' }
  if (to.hash) {
   const target = document.getElementById(to.hash.slice(1))
   if (!target) return false
   if (to.path === from.path && !reducedMotion()) { scrollToAnchor(target); return false }
   return { el: target, top: 110, behavior: 'instant' }
  }
  if (to.path === from.path) return false
  return { top: 0, left: 0, behavior: 'instant' }
 },
})
// ScrollTrigger refreshes must preserve Vue Router's ownership of history scroll.
ScrollTrigger.clearScrollMemory('manual')
router.beforeEach(() => { stopAnchorScroll() })
createApp(App).use(router).mount('#app')
