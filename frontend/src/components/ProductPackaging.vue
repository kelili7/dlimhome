<script setup>
import { publicAsset } from '../utils/assets.js'
import AnimatedContent from './AnimatedContent.vue'
import { Gift, Package, ShoppingBag } from 'lucide-vue-next'
import { useLocale } from '../composables/useLocale'

const { tx } = useLocale()
const introduction = {
  title: { zh: '产品包装', en: 'Product packaging' },
  copy: {
    zh: '从妥帖收纳到用心赠礼，为每一件器物搭配合适的包装。',
    en: 'Thoughtful packaging for every piece, from careful packing to a gift worth giving.',
  },
}
const formats = [
  {
    id: 'gift',
    icon: Gift,
    image: publicAsset('/images/packaging/product-box.jpg'),
    width: 1536,
    height: 1024,
    title: { zh: '礼盒包装', en: 'Gift boxes' },
    copy: {
      zh: '独立内托搭配柔软衬纸，让杯碗成套呈现，为节日赠礼与新居心意增添仪式感。',
      en: 'Fitted inserts and soft tissue bring cups and bowls together for seasonal gifts and new homes.',
    },
    alt: {
      zh: '米白色礼盒内，陶瓷杯碗分别置于独立内托中，搭配白色衬纸',
      en: 'Ivory gift box with a ceramic cup and bowl in separate inserts with white tissue',
    },
  },
  {
    id: 'shipping',
    icon: Package,
    image: publicAsset('/images/packaging/shipping-box.jpg'),
    width: 1536,
    height: 1024,
    title: { zh: '运输包装', en: 'Shipping boxes' },
    copy: {
      zh: '单品纸盒、成型内托与外箱分层组合，围绕器型与装载需求，兼顾收纳与运输保护。',
      en: 'Individual boxes, shaped inserts and outer cartons work together around the piece and its packing needs.',
    },
    alt: {
      zh: '运输外箱、单杯纸盒和包裹陶瓷杯的成型内托',
      en: 'Outer shipping carton, individual mug box and a ceramic cup in a shaped insert',
    },
  },
  {
    id: 'bag',
    icon: ShoppingBag,
    image: publicAsset('/images/packaging/shopping-bag.jpg'),
    width: 1122,
    height: 1402,
    title: { zh: '手提袋', en: 'Shopping bags' },
    copy: {
      zh: '质感纸袋搭配柔韧织带，承装器物与礼盒，让店铺提货和当面赠礼都更从容。',
      en: 'Textured paper and fabric handles carry pieces and gift boxes from the shop to the moment of giving.',
    },
    alt: {
      zh: '两只米白色手提袋搭配深棕色织带，旁边摆放陶瓷杯',
      en: 'Two ivory paper shopping bags with brown fabric handles beside a ceramic mug',
    },
  },
]
</script>

<template>
  <section id="packaging" class="packaging-section section-space" aria-labelledby="packaging-title">
    <div class="container">
      <AnimatedContent :stagger="0.08" class="section-heading packaging-heading">
        <h2 id="packaging-title">{{ tx(introduction.title) }}</h2>
        <p>{{ tx(introduction.copy) }}</p>
      </AnimatedContent>
      <AnimatedContent :stagger="0.08" class="packaging-grid values-grid">
        <article
          v-for="format in formats"
          :key="format.id"
          class="packaging-card"
          :aria-labelledby="`${format.id}-packaging-title`"
        >
          <div class="packaging-photo">
            <img
              :src="format.image"
              :alt="tx(format.alt)"
              :width="format.width"
              :height="format.height"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="packaging-copy">
            <div class="packaging-card-heading">
              <span class="packaging-icon" aria-hidden="true">
                <component :is="format.icon" :size="23" :stroke-width="1.4" />
              </span>
              <h3 :id="`${format.id}-packaging-title`">{{ tx(format.title) }}</h3>
            </div>
            <p>{{ tx(format.copy) }}</p>
          </div>
        </article>
      </AnimatedContent>
    </div>
  </section>
</template>

<style scoped>
.packaging-heading p {
  max-width: 680px;
  margin: 24px auto 0;
  color: hsl(var(--body-ink));
  font-size: 17px;
  line-height: 1.8;
  text-wrap: pretty;
}

.packaging-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 24px;
}

.packaging-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid hsl(var(--ceramic-border));
  border-radius: 24px;
  background: hsl(var(--card));
}

.packaging-photo {
  flex-shrink: 0;
  aspect-ratio: 1;
  overflow: hidden;
  background: hsl(var(--ceramic-surface));
}

.packaging-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.packaging-copy {
  flex: 1;
  padding: 28px;
}

.packaging-card-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.packaging-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: hsl(var(--ceramic-ink));
  background: hsl(var(--ceramic-surface));
}

.packaging-copy h3 {
  font-size: 24px;
  line-height: 1.35;
  letter-spacing: -.025em;
}

.packaging-copy p {
  font-size: 16px;
  line-height: 1.8;
  color: hsl(var(--body-ink));
  text-wrap: pretty;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .packaging-grid { gap: 16px; }
  .packaging-copy { padding: 24px 18px; }
  .packaging-card-heading { gap: 10px; min-height: 54px; }
  .packaging-copy h3 { font-size: 20px; }
  .packaging-icon { width: 36px; height: 36px; }
}

@media (max-width: 767px) {
  .packaging-heading { margin-bottom: 32px; }
  .packaging-heading p { margin-top: 20px; font-size: 16px; }
  .packaging-grid { grid-template-columns: 1fr; }
  .packaging-copy { padding: 24px; }
}
</style>
