# DLIM HOME 双语企业官网

Vue 3 Composition API + Vite + Vue Router。沿用原 MotionSites 模板的中性色调、首页七个内容区块、胶囊按钮、双列反向滚动、轮播与 FAQ 动画。此次开发仅涉及 `frontend/`。

## 运行与验证

在 `frontend/` 目录执行：

```bash
npm install
npm run dev
npm run build
npm run test:e2e
```

开发地址：<http://127.0.0.1:5173/>。浏览器测试使用本机 Google Chrome；其他配置见 `playwright.config.js`。本轮页面使用本地内容与图片，无需启动 Django。现有 `/api` 代理及环境变量配置保留，供后续联动使用。

## 页面

| 路由 | English | 中文 | 内容 |
| --- | --- | --- | --- |
| `/` | Home | 首页 | 双列图片滚动、精选产品、工艺介绍、产品轮播、品牌理念、FAQ、指南 |
| `/products` | Products | 产品 | 四个产品系列，品类筛选、中英文关键词搜索、空结果与重置 |
| `/factory` | Factory | 工厂 | 陶瓷产品开发流程、品质关注点、系列定制介绍 |
| `/about` | About Us | 关于我们 | 品牌理念、价值观、电商业务与官方店铺 |
| `/support` | Support | 服务支持 | 挑选、养护、订单、商业合作指南与 FAQ |
| `/contact` | Contact Us | 联系我们 | 店铺入口、零售/商业合作分流、本地询盘摘要 |
| `/product/:handle` | Product collection | 产品系列详情 | 产品介绍、图片、特点、店铺入口与带产品上下文的咨询 |

生产环境静态托管时需将页面路由回退至 `index.html`，以支持 Vue Router 的直接访问和刷新。

未使用的 Vite 欢迎页 `HelloWorld.vue`、配套示例图片与图标，以及旧版健康主题图片已清理。`public/` 中的文件会原样进入构建产物；清理资源前须同时检查静态引用与动态路径（例如招聘页公司相册）。`SplitText.vue` 按原有约定保留供复用，当前页面不使用。

## 后续如何修改

- **双语界面文案**：`src/data/messages.js`，对应 `en`、`zh` 两组相同字段。
- **产品、分类、品牌理念、制作流程、指南与 FAQ**：`src/data/site.js`。每段文字采用 `{ en, zh }`；修改产品时保留唯一 `handle`。
- **官方店铺链接**：`src/data/site.js` 中的 `stores`。
- **图片**：`public/images/ceramics/`；引用路径由上述数据文件或对应页面管理，来源见 `ASSET_SOURCES.md`。
- **语言切换**：`src/composables/useLocale.js`。首次访问默认英文，之后在 `localStorage` 的 `dlim-locale` 中记住选择；禁止存储时仍能切换。
- **颜色、布局与动画**：`src/style.css`。沿用原来的 CSS 变量和主区块，新增页面样式集中在文件后半部分。
- **页面结构**：`src/views/`；导航、页脚、按钮、FAQ 与轮播等在 `src/components/`。

品牌与工厂文案为可编辑初稿；未填入未经确认的工厂地址、产能、认证、年份、邮箱或电话号码。餐桌系列使用场景示意图，其他三组产品图片来自公开的 DLIM HOME 商品资料。工艺图片是图库示意，不能当作实际厂房或员工照片。发布前可替换为自有实拍素材和确认后的业务资料。

## 询盘与交易边界

本轮只生成前端。联系表单进行必填项和邮箱格式校验，生成可复制、下载的文本摘要，**不会自动发送邮件、创建订单或保存到后台**。信息仅在当前组件内存中保留，刷新或离开页面即清空；语言切换保留已填内容并翻译摘要字段。访客可将摘要通过官方店铺发送。

页脚输入框用于搜索产品。购买、支付、库存、配送、退换货与订单客服由用户提供的 Amazon / 淘宝店铺承接；详情页不展示虚构的报价、库存或商品认证。
