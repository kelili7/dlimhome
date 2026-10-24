import { publicAsset } from '../utils/assets.js'
// Editable bilingual content. Product descriptions are collection-level copy,
// not unverified price, stock, certification or production-capacity claims.
export const bi = (en, zh) => ({ en, zh })
export const stores = {
  amazon: 'https://www.amazon.com/stores/DLIMHOME/page/C4D9CF2D-0C18-4E7E-8167-46A01ED081DA',
  taobao: 'https://shop552623256.taobao.com/',
}
export const contactNavigation = [
  { key: 'business', to: '/contact/business-enquiry' },
  { key: 'join', to: '/contact/join-us' },
]
export const navigation = [
  { key: 'home', to: '/' }, { key: 'products', to: '/products' },
  { key: 'factory', to: '/factory' }, { key: 'about', to: '/about' },
  { key: 'support', to: '/support' }, { key: 'contact', to: '/contact/business-enquiry', children: contactNavigation },
]
export const categories = [
  { id: 'all', label: bi('All pieces', '全部产品') },
  { id: 'dinnerware', label: bi('Dinnerware', '餐桌器皿') },
  { id: 'bowls', label: bi('Bowls', '碗类系列') },
  { id: 'serveware', label: bi('Serveware', '分享餐盘') },
  { id: 'bakeware', label: bi('Bakeware', '烘焙器皿') },
  { id: 'drinkware', label: bi('Drinkware', '杯具系列') },
  { id: 'kitchen-accessories', label: bi('Kitchen accessories', '厨房配件') },
]
export const products = [
  {
    handle: 'serving-bowls', category: 'bowls', image: publicAsset('/images/ceramics/serving-bowls.jpg'),
    name: bi('The Serving Bowl Collection', '双耳盛食碗系列'),
    subtitle: bi('For the joy of sharing', '为分享美味而生'),
    description: bi('Soft curves, a clean white finish and handles that frame the form. A versatile collection for placing something delicious at the centre of the table.', '柔和的弧线、洁净的白色与两侧的双耳设计，让每一道家常美味，都能从容成为餐桌的中心。'),
    finish: bi('Soft white · sculpted handles', '柔白釉色 · 双耳造型'),
    use: bi('Serving, salads & shared meals', '盛食、沙拉与日常分享'),
    gallery: [publicAsset('/images/ceramics/serving-bowls.jpg')],
  },
  {
    handle: 'vintage-platters', category: 'serveware', image: publicAsset('/images/ceramics/platters.jpg'),
    name: bi('The Vintage Platter Collection', '复古浮点长盘系列'),
    subtitle: bi('A little texture. A generous welcome.', '细腻肌理，款待每次相聚。'),
    description: bi('A rectangular silhouette meets a raised, tactile border. These white serving pieces bring a quiet sense of occasion to appetisers, desserts and dishes made to share.', '利落的长方器形，与富有触感的浮点边缘相遇。柔白的分享餐盘，为前菜、甜点与相聚的美味，添上一份恰好的仪式感。'),
    finish: bi('Vintage white · textured border', '复古白色 · 浮点边饰'),
    use: bi('Entertaining, appetisers & desserts', '聚餐款待、前菜与甜点'),
    gallery: [publicAsset('/images/ceramics/platters.jpg')],
  },
  {
    handle: 'everyday-dinnerware', category: 'dinnerware', image: publicAsset('/images/ceramics/dinnerware.jpg'), editorial: true,
    name: bi('Everyday Tableware', '日常餐桌系列'),
    subtitle: bi('A setting to make your own', '搭配属于自己的餐桌'),
    description: bi('Build a table that feels like home. Explore coordinated ceramic plates, bowls and cups, with room for your own way of mixing shapes and textures.', '用协调的盘、碗与杯，搭配出熟悉而自在的餐桌。在器形与肌理之间，保留属于自己的生活趣味。'),
    finish: bi('Considered shapes · coordinated settings', '考究器形 · 协调搭配'),
    use: bi('Everyday dining & table settings', '日常用餐与餐桌布置'),
    gallery: [publicAsset('/images/ceramics/dinnerware.jpg'), publicAsset('/images/ceramics/dining.jpg')],
  },
  {
    handle: 'baking-dishes', category: 'bakeware', image: publicAsset('/images/ceramics/bakeware.jpg'),
    name: bi('The Baking Dish Collection', '陶瓷烘焙盘系列'),
    subtitle: bi('Warm moments, beautifully served', '盛放温暖，也盛放美味'),
    description: bi('Ceramic baking dishes with a simple rectangular form and side handles. Discover pieces for individual portions, weekend recipes and bringing everyone to the table.', '简洁的长方器形，配以便于端取的侧耳。探索适合分餐、周末食谱与家人相聚的陶瓷烘焙器皿。'),
    finish: bi('Clean lines · integrated handles', '简洁线条 · 一体双耳'),
    use: bi('Baking & serving — check item instructions', '烘焙与盛食，使用前请查看具体商品说明'),
    gallery: [publicAsset('/images/ceramics/bakeware.jpg')],
  },
  {
    handle: 'heart-coffee-cups', category: 'drinkware', image: publicAsset('/images/products/heart-coffee-cups.jpg'), photograph: true,
    name: bi('Heart Detail Coffee Cups', '爱心点缀咖啡杯系列'),
    subtitle: bi('A little warmth in every detail', '一抹心意，温暖咖啡时光'),
    description: bi('A softly textured white cup and matching saucer, finished with a red heart detail by the handle. A gentle accent for slow mornings, a favourite coffee and a moment to yourself.', '柔白杯身与同色杯碟相映，杯柄旁一抹红色爱心点缀，为简洁器形添上温度。让清晨的一杯咖啡，成为值得慢慢享受的日常片刻。'),
    material: bi('Ceramic', '陶瓷'),
    finish: bi('Soft white · red heart detail', '柔白杯身 · 红色爱心点缀'),
    use: bi('Coffee moments & table settings', '咖啡时光与餐桌搭配'),
    gallery: [publicAsset('/images/products/heart-coffee-cups.jpg')],
  },
  {
    handle: 'amber-textured-glasses', category: 'drinkware', image: publicAsset('/images/products/amber-textured-glasses.jpg'), photograph: true,
    name: bi('Amber Footed Textured Glasses', '琥珀杯脚纹理杯系列'),
    subtitle: bi('Texture, light and a touch of amber', '透亮纹理，映出琥珀色日常'),
    description: bi('Patterned glass bowls meet short amber-coloured feet. Explore a mix of ribbed and decorative textures that bring character to fruit drinks, coffee and relaxed table settings.', '透亮杯身搭配琥珀色短杯脚，竖纹与装饰纹理呈现不同的光影趣味。用来搭配果饮、咖啡与日常餐桌，让一杯饮品也有自己的表情。'),
    material: bi('Glass', '玻璃'),
    finish: bi('Decorative textures · amber-coloured feet', '装饰纹理 · 琥珀色杯脚'),
    use: bi('Drinks & everyday entertaining', '饮品盛放与日常款待'),
    gallery: [publicAsset('/images/products/amber-textured-glasses.jpg')],
  },
  {
    handle: 'amber-stem-glasses', category: 'drinkware', image: publicAsset('/images/products/amber-stem-glasses.jpg'), photograph: true,
    name: bi('Amber Stem Glassware', '琥珀杯脚高脚杯系列'),
    subtitle: bi('A graceful shape for every gathering', '以优雅器形，点亮相聚时刻'),
    description: bi('Clear, wide bowls pair with amber-coloured stems and bases. Straight and curved stem silhouettes bring a playful rhythm to a drinks table, from a quiet evening to a gathering with friends.', '通透的宽口杯身，与琥珀色杯脚和底座相遇。直线与曲线杯脚带来不同的造型趣味，为小聚、晚间饮品和餐桌布置添上一份仪式感。'),
    material: bi('Glass', '玻璃'),
    finish: bi('Clear bowls · sculptural amber stems', '通透杯身 · 琥珀色造型杯脚'),
    use: bi('Mixed drinks & special table settings', '调饮、聚会与餐桌布置'),
    gallery: [publicAsset('/images/products/amber-stem-glasses.jpg')],
  },
  {
    handle: 'kitchen-lid-racks', category: 'kitchen-accessories', image: publicAsset('/images/products/kitchen-lid-racks.jpg'), photograph: true,
    name: bi('Kitchen Lid & Utensil Racks', '厨房锅盖置物架系列'),
    subtitle: bi('A place for the little things', '让料理台面，更加从容有序'),
    description: bi('Upright supports and a tray-style base create a resting place for lids and cooking utensils. Red and deep green accents bring a little character to the kitchen counter. Confirm the rack dimensions and included pieces in the selected listing.', '竖向支撑与托盘式底座，为锅盖和料理工具提供随手放置的位置。红色与深绿点缀让厨房台面多一点秩序与趣味。具体尺寸及包含配件，请以所选商品页面为准。'),
    material: null,
    finish: bi('Upright supports · red and green accents', '竖向支撑 · 红绿配色'),
    use: bi('Countertop organisation & utensil resting', '厨房台面整理与料理工具放置'),
    gallery: [publicAsset('/images/products/kitchen-lid-racks.jpg')],
  },
]
export const featuredProducts = [products[0], products[1], products[3]]
export const homeProducts = ['heart-coffee-cups', 'amber-textured-glasses', 'kitchen-lid-racks']
  .map(handle => products.find(product => product.handle === handle))
export const craftSteps = [
  { number: '01', title: bi('Start with a purpose', '从用途出发'), text: bi('A dining ritual, a serving idea, a collection brief. Define the shape, scale and feeling before refining the details.', '先明确用餐场景、分享方式与产品需求，再推敲器形、尺寸及整体感受。') },
  { number: '02', title: bi('Give the form its character', '赋予器形个性'), text: bi('Consider the silhouette, rim, handle and surface. Small decisions create a piece that feels coherent in the hand and on the table.', '从轮廓、口沿到把手与表面，微小的选择，让手感与视觉协调统一。') },
  { number: '03', title: bi('Explore the finish', '探索釉面效果'), text: bi('Colour and glaze change how a form catches the light. Review a sample and agree the desired appearance for the collection.', '颜色与釉面，决定器物如何与光线相处。通过样品确认系列所期待的观感。') },
  { number: '04', title: bi('Bring it all together', '完成整体呈现'), text: bi('Review the finished piece, set composition and packaging. Confirm product details and delivery arrangements before an order.', '综合查看成品、套装搭配与包装，并在下单前确认产品细节及交付安排。') },
]
export const values = [
  { icon: 'Shapes', title: bi('Considered\nForm', '考究\n器形') },
  { icon: 'Layers', title: bi('Tactile\nTexture', '细腻\n肌理') },
  { icon: 'Flame', title: bi('Ceramic\nCraft', '陶瓷\n工艺') },
  { icon: 'Coffee', title: bi('Everyday\nRituals', '日常\n仪式') },
  { icon: 'Package', title: bi('Thoughtful\nPresentation', '用心\n呈现') },
  { icon: 'Globe2', title: bi('Connected\nLiving', '连接\n生活') },
]
export const brandValues = [
  { number: '01', title: bi('Less noise. More feeling.', '少一点喧嚣，多一点感受。'), text: bi('Calm colours, thoughtful proportions and textures that invite a closer look. Our point of view is rooted in a home that feels personal.', '以安静的颜色、恰好的比例和耐看的肌理，表达一个有温度、有个人风格的家。') },
  { number: '02', title: bi('Beauty belongs in daily life.', '美好，本就属于日常。'), text: bi('Objects earn their place through the moments around them: a quiet breakfast, a new recipe, a table full of friends.', '器物的意义，来自围绕它发生的时刻：一顿早餐、一份新食谱，或一桌朋友。') },
  { number: '03', title: bi('Close to how people live.', '贴近真实的生活。'), text: bi('Our focus on e-commerce connects the making of ceramics with the homes they become part of. There is always something new to learn from everyday use.', '以电商连接陶瓷制作与真实家庭。从每一次日常使用中，发现值得继续打磨的细节。') },
]
export const guides = [
  { id: 'choosing', category: bi('Choosing ceramics', '挑选指南'), title: bi('Find a piece that fits your everyday.', '挑选契合日常的器物。'), image: publicAsset('/images/ceramics/dining.jpg'), paragraphs: [bi('Start with how you will use it. Consider portion size, storage space, the depth of a bowl and how a serving piece fits your table.', '从使用方式开始。考虑份量、收纳空间、碗的深度，以及餐盘与餐桌的搭配。'), bi('Product photos convey the collection’s character. Confirm dimensions, set contents and finish on the actual store listing before ordering.', '图片传达系列的风格。下单前，请在具体商品页面确认尺寸、套装内容与釉色。')] },
  { id: 'care', category: bi('Care & keeping', '使用养护'), title: bi('Small habits. Beautiful pieces.', '用小小习惯，留住器物之美。'), image: publicAsset('/images/ceramics/ritual.jpg'), paragraphs: [bi('Use a soft sponge and a mild cleaner. Allow pieces to dry before storing, and place a soft layer between delicate stacked surfaces.', '使用柔软海绵与温和清洁剂，晾干后再收纳。叠放易磨损的器物时，可在中间垫上柔软隔层。'), bi('Avoid sudden temperature changes. Oven, microwave and dishwasher suitability varies by item; follow the instructions supplied with your product.', '避免冷热骤变。是否适用于烤箱、微波炉或洗碗机因产品而异，请遵循商品随附说明。')] },
  { id: 'orders', category: bi('Orders & delivery', '订单与配送'), title: bi('From your basket to your table.', '从购物篮，到您的餐桌。'), image: publicAsset('/images/ceramics/gathering.jpg'), paragraphs: [bi('Shop through our official Amazon or Taobao store. Availability, pricing, delivery estimates and returns are displayed by the store you choose.', '请通过官方亚马逊或淘宝店铺选购。库存、价格、预计送达及退换货政策，以购买店铺的展示为准。'), bi('Inspect your delivery when it arrives. If something is damaged, keep the packaging, take clear photographs and contact the store team with your order reference.', '收货后请及时检查。如有破损，请保留包装、拍摄清晰照片，并凭订单信息联系购买店铺的客服。')] },
  { id: 'trade', category: bi('Working together', '合作指南'), title: bi('Turn an idea into a clear brief.', '让想法成为清晰的需求。'), image: publicAsset('/images/ceramics/craft.jpg'), paragraphs: [bi('Share the product category, desired quantities, colours, dimensions, packaging and intended market. Reference images can help communicate the finish you have in mind.', '请提供产品品类、预计数量、颜色、尺寸、包装与目标市场。参考图片也有助于沟通您期待的质感。'), bi('Sampling, minimum quantities, customisation and timelines depend on the project. Confirm the details with our team before making a commitment.', '打样、起订量、定制方案及交期，均需根据具体项目与团队沟通确认。')] },
]
export const faqs = [
  { question: bi('Where can I buy DLIM HOME products?', '在哪里可以购买 DLIM HOME 产品？'), answer: bi('Visit our official Amazon or Taobao store using the links on this website. The selected store provides current products, prices, stock and checkout.', '您可以通过本站链接前往官方亚马逊或淘宝店铺，查看在售产品、价格和库存，并在店铺内完成购买。') },
  { question: bi('Can I discuss a wholesale or custom collection?', '可以咨询批量采购或定制系列吗？'), answer: bi('Yes. Share your product ideas, quantities, preferred finishes and packaging needs through our enquiry page. Our team can discuss the options for your project.', '可以。请通过咨询页面整理产品想法、数量、釉色与包装需求，再与团队沟通适合您项目的方案。') },
  { question: bi('What are the minimum order quantities and lead times?', '起订量与交期如何确定？'), answer: bi('They depend on the selected product, finish, packaging and order volume. Please confirm sampling, minimum quantities and production timing with our team for each project.', '起订量与交期取决于产品、釉色、包装和订单数量。请就具体项目与团队确认打样、起订要求及生产安排。') },
  { question: bi('Are all pieces oven, microwave and dishwasher safe?', '所有产品都适用于烤箱、微波炉与洗碗机吗？'), answer: bi('Suitability varies by item and finish. Always refer to the specific product listing and the instructions supplied with your order. Avoid sudden temperature changes.', '适用范围因具体产品与釉面而异。请以商品详情及随附说明为准，并避免器物经历冷热骤变。') },
  { question: bi('How do I get help with an order?', '如何获取订单售后帮助？'), answer: bi('Contact customer support through the store where you placed the order. Keep your order reference and, for damage or missing items, photographs of the product and packaging.', '请通过购买商品的店铺联系客服，并保留订单信息。如遇破损或缺件，请同时准备产品和包装的照片。') },
]
