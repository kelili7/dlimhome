<script setup>
import AnimatedContent from '../components/AnimatedContent.vue'
import { usePageMotion } from '../composables/usePageMotion'
const motionRoot = usePageMotion()
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { products } from '../data/site'
import { useLocale } from '../composables/useLocale'
import StoreLinks from '../components/StoreLinks.vue'
import CallToAction from '../components/CallToAction.vue'
import NotFoundView from './NotFoundView.vue'
const { t, tx } = useLocale(), route = useRoute(), imageIndex = ref(0)
const router = useRouter()
// The preceding history entry retains the exact URL, filters and scroll position,
// including when the detail page is reloaded before returning.
const sourceList = computed(() => {
 void route.fullPath
 const back = router.options.history.state.back
 if (typeof back !== 'string' || !back.startsWith('/') || back.startsWith('//')) return null
 const { path } = router.resolve(back)
 return path === '/' || path === '/products' ? back : null
})
const returnTo = computed(() => sourceList.value || '/products#catalogue')
function returnToProducts(event) {
 if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
 event.preventDefault()
 if (sourceList.value) router.back()
 else router.push(returnTo.value)
}
const product = computed(() => products.find(p => p.handle === route.params.handle))
watch(() => route.params.handle, () => { imageIndex.value = 0 })
</script>
<template><main ref="motionRoot" v-if="product" id="main-content"><section class="container product-detail section-space"><a class="back-link" :href="router.resolve(returnTo).href" @click="returnToProducts"><ArrowLeft :size="18" />{{ t('common.back') }}</a><div class="two-columns"><AnimatedContent :stagger="0.08" class="product-gallery"><img :class="{ 'product-object': !product.editorial && !product.photograph, 'product-photograph': product.photograph }" :src="product.gallery[imageIndex]" :alt="tx(product.name)" width="640" height="640" /><div v-if="product.gallery.length > 1" class="gallery-thumbnails"><button v-for="(image, i) in product.gallery" :key="image" :aria-pressed="imageIndex === i" :aria-label="`${t('common.show')} ${i + 1}`" @click="imageIndex = i"><img :src="image" alt="" width="80" height="80" /></button></div><p v-if="product.editorial" class="fine-print">{{ t('common.imageNote') }}</p></AnimatedContent><AnimatedContent :stagger="0.08"><p class="eyebrow">DLIM HOME · {{ t('common.collection') }}</p><h1>{{ tx(product.name) }}</h1><p class="lead">{{ tx(product.description) }}</p><dl class="product-specs"><div v-if="product.material !== null"><dt>{{ t('common.material') }}</dt><dd>{{ product.material ? tx(product.material) : t('common.ceramic') }}</dd></div><div><dt>{{ t('common.finish') }}</dt><dd>{{ tx(product.finish) }}</dd></div><div><dt>{{ t('common.use') }}</dt><dd>{{ tx(product.use) }}</dd></div></dl><StoreLinks /><RouterLink :to="`/contact/business-enquiry?product=${product.handle}&interest=1`" class="text-link product-enquire">{{ t('common.enquire') }} ↗</RouterLink><p class="fine-print">{{ t('common.detailNote') }}</p></AnimatedContent></div></section><CallToAction :title="t('common.productContact')" :copy="t('common.productContactCopy')" /></main><NotFoundView v-else /></template>
