# DLIM 企业官网

采用 Django + Vue 的前后端分离项目：

- `backend/`：Django API 与网站内容管理后台
- `frontend/`：Vue 3 + Vite 企业官网前端

## 已完成

- Django 项目与 `website_admin` 后台管理应用
- Django REST Framework 和跨域配置
- django-simpleui 中文管理后台
- SQLite 开发数据库与超级管理员
- Vue 3 健康电商前端模板（按 MotionSites E-commerce Website 描述复刻）
- 前端开发服务器到 Django `/api` 的代理
- `/api/health/` 前后端连通检查

## 环境要求

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- Node.js 20+

## 启动后端

```bash
uv sync
uv run python backend/manage.py migrate
uv run python backend/manage.py runserver
```

后端地址：

- 管理后台：<http://127.0.0.1:8000/admin/>
- API 健康检查：<http://127.0.0.1:8000/api/health/>
- Django 根地址：<http://127.0.0.1:8000/>（自动跳转至 Vue 官网）

当前开发环境超级管理员：

- 账号：`admin`
- 密码：`admin`

> `admin/admin` 仅供本地开发，部署前必须更换为强密码。

如需在新数据库中重新创建该账号：

```bash
uv run python backend/manage.py createsuperuser --username admin
```

## 启动前端

另开一个终端：

```bash
cd frontend
npm install
npm run dev
```

打开 <http://127.0.0.1:5173/>。开发环境会把 `/api` 请求代理至
`http://127.0.0.1:8000`。

## 生产环境 API 地址

复制 `frontend/.env.example` 为对应环境配置，并设置：

```dotenv
VITE_API_BASE_URL=https://api.example.com
```

然后运行 `npm run build`，构建产物位于 `frontend/dist/`。Django 只负责
管理后台和 API，企业官网由 Vue 独立部署。

部署时可通过环境变量配置管理后台“返回网站”按钮和 Django 根地址的跳转目标：

```bash
FRONTEND_URL=https://www.example.com uv run python backend/manage.py runserver
```


## 前端模板与后续修改

本轮只在本地仓库实现，保持 Django API + Vue 独立前端架构。
参考模板：<https://motionsites.ai/?prompt=ecommerce-website-landing>。

- `frontend/src/views/HomeView.vue`：首页各区块的布局与文案。
- `frontend/src/data/site.js`：商品、导航、FAQ 和健康指南内容。
- `frontend/src/components/`：渐变按钮、双列滚动、产品卡片、轮播、FAQ、导航及页脚。
- `frontend/src/style.css`：HSL 主题变量、间距、响应式布局与动画。
- `frontend/public/images/`：本地图库照片，来源与替换说明见 `frontend/ASSET_SOURCES.md`。
- `frontend/src/views/ProductView.vue`：商品链接的前端占位详情页。

已实现 30 秒双列反向无缝滚动、0.8 秒渐变按钮悬停、轮播切换、卡片悬停缩放、FAQ 展开和减少动态效果偏好支持。

参考文件是设计描述，公开预览仅覆盖页面上半部分；缺少完整源码与原图。
当前照片为同类图库素材，未提供的文案为模板占位，不能视作原模板像素级复刻。
登录、资格咨询、政策与社交入口显示预览弹窗，邮箱表单仅作本地校验，不提交数据。

前端采用 history 路由，生产部署时需将非 `/api`、非静态文件的页面请求回退到
`index.html`，以支持 `/product/:handle` 刷新；Django 继续只提供管理后台及 API。

## 验证

```bash
uv run python backend/manage.py check
uv run python backend/manage.py test website_admin
cd frontend
npm run build
npm run test:e2e
```

浏览器测试默认使用本机 Google Chrome。若使用 Playwright 自带 Chromium，先运行
`npx playwright install chromium`，再运行 `PLAYWRIGHT_CHANNEL=chromium npm run test:e2e`。
测试会复用 5173 端口现有服务；未运行时自动启动 Vite。后端健康状态位于页脚。

## 企业介绍与联系页面

- `/about` 增加 DLIM Home 品牌背景、品牌专注与渠道介绍。
- 「联系我们」下设 `/contact/business-enquiry`（业务咨询）与 `/contact/join-us`（加入我们）。旧 `/contact` 链接重定向至业务咨询，并保留查询参数与锚点。
- 业务咨询保留原店铺和本地咨询摘要功能，增加服务说明、准备清单与沟通流程。
- 加入我们提供加入理由、员工福利、招聘流程及简历投递四个板块，投递地址为 `hr@dlim.com`。邮件链接打开邮件客户端，网站不直接收集或发送简历。
- 新增中英文文案维护在 `frontend/src/data/companyMessages.js`；企业资料来源及未确认信息见 `frontend/CONTENT_SOURCES.md`。

## 首页标语与回到顶部

- 首页标语为“让世界每一个角落，都有DLIM HOME的温暖陪伴”，英文同步更新。
- 全站 `BackToTop.vue` 按钮在滚动超过 400px 后显示，点击平滑回顶，顶部附近隐藏；减少动态效果偏好下立即回顶，键盘焦点返回页头 Logo。
- `frontend/tests/back-to-top.spec.js` 覆盖首页标语、回顶显隐、滚动偏好及焦点恢复。

## 页面动效

全站使用 GSAP、ScrollTrigger、ScrollToPlugin 和 CustomEase，保留原页面结构、内容与静止排版。

- `frontend/src/motion/gsap.js` 统一注册插件与缓动曲线，并协调页面挂载和路由滚动恢复。
- `frontend/src/composables/useRouteMotion.js` 提供 180ms 淡出、850ms 自下而上杂志揭幕；遮罩按当前视口计算，兼容历史滚动恢复。滚轮、触摸、阅读按键或内容获得焦点时立即完成揭幕；查询参数与同页锚点更新不会重播整页转场。
- `frontend/src/composables/usePageMotion.js` 在 Vue 挂载后编排首屏图文、滚动区块和卡片错峰入场，卸载时清理 context、触发器与观察器。新增页面只需在现有 `main` 上绑定返回的 `motionRoot`。
- `frontend/src/motion/pageParallax.js` 为场景照片添加轻微景深视差：桌面最大上下各 12px、手机各 6px，以 650ms / 500ms 的 scrub 缓动跟随滚动。照片轻微放大后用补偿遮罩保持原有显示边界，产品白底图与轮播不参与。
- `frontend/src/motion/settings.js` 集中管理节奏：首屏约 750ms，滚动区块约 650ms（手机 550ms），错峰间隔 60ms。未使用 AnimatedContent 的原有区块保持完整亮度，只在屏幕外预置小幅位移再入场，避免先显示后突然变淡；已展示的内容不会因响应式断点变化重播。页面切换使用透明度与 clip-path，区块只移动 transform；普通区块不新增布局包裹或固定滚动区；批注标题使用下述 SplitText。系统开启“减少动态效果”时立即还原静态内容。
- 同页锚点由 ScrollToPlugin 平滑定位，保留 URL、查询参数与浏览历史；用户手动滚动可中断。跨页锚点及历史返回立即恢复位置。
- 图片加载、字体完成、筛选或 FAQ 高度变化后合并刷新触发位置；首页双列图片离屏或标签页隐藏时暂停。
- `frontend/tests/motion.spec.js` 覆盖逐帧亮度稳定、断点切换不重播、揭幕节奏与中断、视差方向与图片显示边界、滚动入场、样式恢复、快速导航、动态筛选、减少动态效果及离屏暂停。

### AnimatedContent 内容入场

`frontend/src/components/AnimatedContent.vue` 根据 [React Bits 官方源码入口](https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/AnimatedContent-TS-CSS.json)
适配为 Vue 3 插槽组件（核对日期：2026-10-21）。复用 npm 管理的 GSAP 3.15 和现有插件注册，
无需运行面向 React 的 shadcn 安装命令。官方此版本没有独立 CSS、字体或图片依赖；组件继承现有 class、style 和原生属性。
完整许可与版权保留于 `frontend/public/licenses/react-bits-LICENSE.md`，生产构建会将其复制到 `dist/licenses/`。

首页三个区块标题和工厂文案均采用官方演示默认参数：从下方 100px 向上入场，透明度 0→1，时长 0.8 秒，缓动 `power3.out`，threshold 为 0.1。
组件根节点替换原有 div，不新增布局层；`usePageMotion` 跳过其内部内容，避免重复入场。
包含 AnimatedContent 或 SplitText 的页面入场时跳过原有整页揭幕遮罩，确保文字与页面内容同步启动；其他页面转场及原有业务交互保留。
起始位移和透明度在挂载时、浏览器首帧绘制前同步设置；只推迟滚动触发器的测量，等待路由恢复滚动位置，避免先显示再突然隐藏。

```vue
<script setup>
import AnimatedContent from './components/AnimatedContent.vue'
</script>

<template>
  <AnimatedContent :distance="100" :duration="0.8" ease="power3.out"
    direction="vertical" :animate-opacity="true" :initial-opacity="0" :threshold="0.1">
    <!-- 原有内容 -->
  </AnimatedContent>
</template>
```

支持的参数（时间单位为秒，位移单位为 px）：

| 参数 | 默认值 | 行为 |
| --- | --- | --- |
| `container` | `null` | 自定义滚动容器元素或选择器；默认使用视口 |
| `distance` / `direction` / `reverse` | `100` / `vertical` / `false` | 起始位移、纵向或横向、反转方向 |
| `duration` / `ease` / `delay` | `0.8` / `power3.out` / `0` | 入场时长、GSAP 缓动和延迟 |
| `initialOpacity` / `animateOpacity` | `0` / `true` | 起始透明度及是否淡入 |
| `scale` | `1` | 起始缩放，最终恢复为 1 |
| `threshold` | `0.1` | 顶边进入滚动视口的 90% 高度线时触发；限制在 0–1 |
| `trigger` | `scroll` | `scroll` 滚动触发一次，或 `mount` 挂载后播放 |
| `disappearAfter` | `0` | 入场结束后等待多久退场；0 禁用 |
| `disappearDuration` / `disappearEase` | `0.5` / `power3.in` | 退场时长和缓动 |

React 的 `children` 对应默认插槽；回调对应 `@start`、`@complete` 和 `@disappearance-complete`。
Vue 适配覆盖本次需求中的全部参数及官方 `trigger` / `onStart`；未移植新版额外的 blur、rotate、tilt、wipe、stagger、once 和 scrub 配置。
未沿用原站专用的 `snap-main-container` 自动查找逻辑，自定义容器需明确传入。
系统减少动态效果设置可实时生效，恢复静态内容并跳过退场；键盘焦点进入组件时立即显示内容并取消退场。
组件卸载、参数变化时清理自身动画、观察器和 ScrollTrigger。默认无隐藏 CSS，初始化前内容可读。


### SplitText 标题拆分动画

`frontend/src/components/SplitText.vue` 由 [React Bits 官方组件入口](https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/SplitText-TS-CSS.json)
适配为 Vue 3（核对日期：2026-10-21）。复用已安装的 GSAP 3.15 及其 `gsap/SplitText`，
不需要 React、`@gsap/react`、shadcn 或新增样式框架。官方当前入口还包含 hover、loop、effect 等扩展；
本项目只移植所需的逐字/词/行入场。版权与完整许可继续保留在 `frontend/public/licenses/react-bits-LICENSE.md`。

覆盖用户批注的 25 处标题：主页 5 处、产品列表 1 处、工厂 4 处、关于我们 6 处、
服务支持 5 处、业务咨询 3 处、加入我们 1 处；对应英文共用翻译绑定，自动接入。
`PageHero.vue` 管理六个内页主标题，其余位置由视图显式使用组件，未批注的卡片标题保持原状。

```vue
<SplitText tag="h2" id="products-title" :text="t('home.productsTitle')"
  :delay="50" :duration="1.25" ease="power3.out"
  :from="{ opacity: 0, y: 40 }" :to="{ opacity: 1, y: 0 }" />
```

- `delay`：字符/词/行之间的错峰间隔，单位 **毫秒**，默认 `50`；并非整体开始延迟。
- `duration`：每个片段的时长，单位 **秒**，默认 `1.25`；`ease` 默认 `power3.out`。
- `from` / `to`：默认从 `{ opacity: 0, y: 40 }` 到 `{ opacity: 1, y: 0 }`，位移单位 px。
- `splitType`：默认 `chars`，也支持 `words`、`lines`、`words, chars`；按行时随宽度自动重拆。
- `threshold` / `rootMargin`：默认 `0.1` / `-100px`，触发线为视口高度的 90% 再向上 100px；
  `rootMargin` 按官方单值格式支持 px、em、rem、%。
- `text` 必填，`tag` 默认 `p`；Vue 原生 `class`、`id`、ARIA 属性直接透传；
  `textAlign` 默认继承页面对齐，以保留左对齐和居中等原有布局。
- 完成回调为 Vue 事件 `@letter-animation-complete`，每段文字完成一次。

同一区块的文字与 AnimatedContent **共用触发时机、同步启动**，不等待父级动画结束或第二条滚动阈值；首屏文字与页面内容同步入场，
不使用整页揭幕遮罩。`usePageMotion` 跳过拆分标题及其祖先的重复位移。
保留原 h1/h2/h3、换行、字号、间距和主题样式，英文保持整词换行，中文可按字换行。
GSAP 提供完整标题的无障碍名称并隐藏片段的重复朗读；减少动态效果设置实时还原普通文本。
语言和参数变化、卸载时清理旧动画及触发器；每次挂载播放一次，已完成标题不会因普通断点变化重播。

`frontend/tests/split-text.spec.js` 验证 25 处双语覆盖、实际入场、移动端布局与换行、实时减少动态效果、
语言切换、路由清理和文字/区块启动时间差；运行 `cd frontend && npm run test:e2e`。
