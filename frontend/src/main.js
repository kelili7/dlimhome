import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
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
 history: createWebHistory(),
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
 scrollBehavior(to, from, savedPosition) {
  if (savedPosition) return { ...savedPosition, behavior: 'instant' }
  if (to.hash) return { el: to.hash, top: 110, behavior: to.path !== from.path || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }
  if (to.path === from.path) return false
  return { top: 0, left: 0, behavior: 'instant' }
 },
})
createApp(App).use(router).mount('#app')
