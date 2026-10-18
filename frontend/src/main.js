import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import ProductView from './views/ProductView.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: HomeView }, { path: '/product/:handle', component: ProductView }, { path: '/:pathMatch(.*)*', component: ProductView }],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 100, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }
    return { top: 0 }
  },
})
router.afterEach(to => { document.title = to.path === '/' ? 'Logo — Your everyday, feeling better.' : 'Explore your care — Logo' })
createApp(App).use(router).mount('#app')
