<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { products } from '../data/site'
import { useLocale } from '../composables/useLocale'
import StoreLinks from '../components/StoreLinks.vue'
import CallToAction from '../components/CallToAction.vue'
import NotFoundView from './NotFoundView.vue'
const { t, tx } = useLocale(), route = useRoute(), imageIndex = ref(0)
const product = computed(() => products.find(p => p.handle === route.params.handle))
watch(() => route.params.handle, () => { imageIndex.value = 0 })
</script>
<template><main v-if="product" id="main-content"><section class="container product-detail section-space"><RouterLink class="back-link" to="/products"><ArrowLeft :size="18" />{{ t('common.back') }}</RouterLink><div class="two-columns"><div class="product-gallery"><img :class="{ 'product-object': !product.editorial }" :src="product.gallery[imageIndex]" :alt="tx(product.name)" width="640" height="640" /><div v-if="product.gallery.length > 1" class="gallery-thumbnails"><button v-for="(image, i) in product.gallery" :key="image" :aria-pressed="imageIndex === i" :aria-label="`${t('common.show')} ${i + 1}`" @click="imageIndex = i"><img :src="image" alt="" width="80" height="80" /></button></div><p v-if="product.editorial" class="fine-print">{{ t('common.imageNote') }}</p></div><div><p class="eyebrow">DLIM HOME · {{ t('common.collection') }}</p><h1>{{ tx(product.name) }}</h1><p class="lead">{{ tx(product.description) }}</p><dl class="product-specs"><div><dt>{{ t('common.material') }}</dt><dd>{{ t('common.ceramic') }}</dd></div><div><dt>{{ t('common.finish') }}</dt><dd>{{ tx(product.finish) }}</dd></div><div><dt>{{ t('common.use') }}</dt><dd>{{ tx(product.use) }}</dd></div></dl><StoreLinks /><RouterLink :to="`/contact?product=${product.handle}&interest=1`" class="text-link product-enquire">{{ t('common.enquire') }} ↗</RouterLink><p class="fine-print">{{ t('common.detailNote') }}</p></div></div></section><CallToAction :title="t('common.productContact')" :copy="t('common.productContactCopy')" /></main><NotFoundView v-else /></template>