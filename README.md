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

### 业务布局世界地图

关于我们页面的两张业务卡片下方使用 `frontend/src/components/WorldMapDemo.vue`，
根据 [Aceternity UI World Map](https://ui.aceternity.com/components/world-map) 与
[官方 registry 源码](https://ui.aceternity.com/registry/world-map-demo.json) 适配为 Vue 3。
保留点阵底图、渐变弧线、错峰绘制和节点脉冲，沿用现有 CSS 主题与中英文文案。
连接线仅示意深圳与欧美市场的关系，不代表办公室位置或实际物流路线。

官方的 React Motion / next-themes 逻辑改为 Vue 生命周期与 CSS 动画，无需新增 React、Next.js 或 Tailwind。
地图进入视口后绘制一次，离屏暂停；节点脉冲播放三轮后停止，系统减少动态效果设置实时切换为静态图。
`dotted-map` 作为开发依赖预生成静态 SVG 和使用相同投影的节点坐标，生产浏览器不加载国家数据或计算底图。
修改节点或底图参数后，在 `frontend/` 运行 `npm run generate:world-map`，并同时提交
`src/assets/world-map.svg`、`src/data/worldMap.json`。生成脚本位于 `frontend/scripts/generate-world-map.mjs`。
`frontend/tests/world-map.spec.js` 覆盖插入位置、地图加载、绘制结果、双语、窄屏和减少动态效果。

## 首页标语与回到顶部

- 首页标语为“让世界每一个角落，都有DLIM HOME的温暖陪伴”，英文同步更新。
- 全站 `BackToTop.vue` 按钮在滚动超过 400px 后显示，点击平滑回顶，顶部附近隐藏；减少动态效果偏好下立即回顶，键盘焦点返回页头 Logo。
- `frontend/tests/back-to-top.spec.js` 覆盖首页标语、回顶显隐、滚动偏好及焦点恢复。

## 页面动效

全站使用 GSAP、ScrollTrigger 和 ScrollToPlugin，保留原页面内容、静止排版与业务交互。

- `frontend/src/components/AnimatedContent.vue` 统一负责内容与图片的上移淡入；页面中显式使用组件，避免自动扫描 DOM 叠加另一套动画。
- 首页工艺图、各内页首屏图、场景图、产品图、包装卡片与办公环境照片均随所属内容组入场。旧照片视差、缩放裁切和小幅区块入场已移除，图片完成后恢复原尺寸。
- `frontend/src/composables/usePageMotion.js` 保留页面挂载协调、锚点导航，以及字体、筛选、FAQ 高度变化后的触发位置刷新。
- `frontend/src/composables/useRouteMotion.js` 保留页面离开的 180ms 淡出；含内容动画的页面跳过整页遮罩，避免遮住入场开头。查询参数和同页锚点更新不会重播整页动画。
- 同页锚点由 ScrollToPlugin 平滑定位，保留 URL、查询参数与浏览历史；跨页锚点及历史返回立即恢复位置。
- 组件卸载会清理自身动画、触发器和监听器；系统减少动态效果设置实时恢复静态内容。键盘聚焦可立即显示内容，鼠标聚焦不会改变按下位置而吞掉点击。
- 首页双列图片滚动、轮播切换、地图连线仍由各自组件负责，导航和页脚不额外添加入场。
- `frontend/tests/page-entrances.spec.js` 覆盖桌面与手机上的全站图片/内容轨迹、尺寸、单次播放和减少动态效果；其他测试继续覆盖导航、历史、筛选、表单、FAQ 与轮播。

### AnimatedContent 内容入场

`frontend/src/components/AnimatedContent.vue` 根据 [React Bits 官方 JS/CSS 源码入口](https://reactbits.dev/r/AnimatedContent-JS-CSS.json)
适配为 Vue 3 插槽组件（核对日期：2026-10-22）。复用 npm 管理的 GSAP 3.15 和现有插件注册，
无需运行面向 React 的 shadcn 安装命令。官方此版本没有独立 CSS、字体或图片依赖；组件继承现有 class、style 和原生属性。
完整许可与版权保留于 `frontend/public/licenses/react-bits-LICENSE.md`，生产构建会将其复制到 `dist/licenses/`。

首页及产品、工厂、关于我们、服务支持、业务咨询、加入我们、产品详情和 404 页采用官网当前 **Scroll / Rise** 演示配置：从下方 100px 向上入场，透明度 0→1，时长 0.8 秒，缓动 `power3.out`，threshold 为 0.1，直接子元素间隔 `0.08` 秒。
注意：组件源码的 `stagger` 默认值为 `0`，官网演示默认值为 `0.08`，页面显式传入后者。对照的是官网默认 Rise，不是可切换的 Blur / Flip / Spring 等预设。
这些内容区标题作为整体入场，不再叠加 SplitText 逐字位移与淡入。首页首屏与产品页一致：左侧文案组按 0.08 秒错峰入场，右侧图片区域整体上移淡入；首次打开及从其他页面返回时均播放。主标题仍是普通 h1，整段入场而不逐字拆分，右侧图片原有循环滚动保留。官网预览容器的 Smooth Scroll 属于演示环境，不是 AnimatedContent 依赖，因此保留本站原生滚动和锚点行为。
组件默认替换原有 div；Vue 扩展参数 `tag` 可保留 `img`、`figure`、`form`、`ol`、`dl` 等语义节点，不新增布局包裹。图片默认整体入场，列表和文案组显式设置 `stagger=0.08`。
产品筛选结果以产品 handle 集合作为组件 key，结果变化时清理旧动画并注册新内容；输入框与筛选按钮保持原节点和焦点。
包含 AnimatedContent 或 SplitText 的页面入场时跳过原有整页揭幕遮罩，确保文字与页面内容同步启动；其他页面转场及原有业务交互保留。
起始位移和透明度在挂载时、浏览器首帧绘制前同步设置；只推迟滚动触发器的测量，等待路由恢复滚动位置，避免先显示再突然隐藏。
图片及含图片的内容组在进入视口后等待加载与解码完成，再播放一次完整入场，避免慢加载时图片突然出现在动画中途。未进入视口的板块保留懒加载；图片失败不会阻塞其他内容，切换页面或启用减少动态效果会取消等待。`frontend/tests/image-loading.spec.js` 覆盖慢加载、解码、加载失败及卸载清理。

```vue
<script setup>
import AnimatedContent from './components/AnimatedContent.vue'
</script>

<template>
  <AnimatedContent :distance="100" :duration="0.8" ease="power3.out"
    direction="vertical" :animate-opacity="true" :initial-opacity="0" :threshold="0.1" :stagger="0.08">
    <!-- 原有内容 -->
  </AnimatedContent>
</template>
```

支持的参数（时间单位为秒，位移单位为 px）：

| 参数 | 默认值 | 行为 |
| --- | --- | --- |
| `tag`（Vue 扩展） | `div` | 根 HTML 标签；`tag="img"` 原样透传 src、alt、尺寸及懒加载属性 |
| `container` | `null` | 自定义滚动容器元素或选择器；未指定时查找 `snap-main-container`，否则使用视口 |
| `distance` / `direction` / `reverse` | `100` / `vertical` / `false` | 起始位移、纵向或横向、反转方向 |
| `duration` / `ease` / `delay` | `0.8` / `power3.out` / `0` | 入场时长、GSAP 缓动和延迟 |
| `initialOpacity` / `animateOpacity` | `0` / `true` | 起始透明度及是否淡入 |
| `scale` | `1` | 起始缩放，最终恢复为 1 |
| `blur` / `rotate` / `tilt` | `0` / `0` / `0` | 起始模糊 px、旋转角度和 3D 翻转角度 |
| `wipe` | `none` | 柔边遮罩：`up` / `down` / `left` / `right` / `center` |
| `stagger` / `staggerFrom` | `0` / `start` | 直接子元素错峰秒数及顺序 |
| `once` / `scrub` | `true` / `false` | 是否只播一次；是否随滚动进度播放（数字指定平滑秒数） |
| `threshold` | `0.1` | 顶边进入滚动视口的 90% 高度线时触发；限制在 0–1 |
| `trigger` | `scroll` | `scroll` 滚动触发，或 `mount` 挂载后播放 |
| `disappearAfter` | `0` | 入场结束后等待多久退场；0 禁用 |
| `disappearDuration` / `disappearEase` | `0.5` / `power3.in` | 退场时长和缓动 |

React 的 `children` 对应默认插槽；回调对应 `@start`、`@complete` 和 `@disappearance-complete`。
Vue 适配覆盖官方 JS/CSS 入口的全部动效参数；`once=false` 回滚出视口时反向播放，`scrub` 忽略入场延迟，只有 `once=true` 且关闭 `scrub` 时执行自动退场。
系统减少动态效果设置可实时生效，恢复静态内容并跳过退场；键盘焦点进入组件时立即显示内容并取消退场。
组件卸载、参数变化时清理自身动画、观察器和 ScrollTrigger。默认无隐藏 CSS，初始化前内容可读。


### SplitText 标题拆分动画

`frontend/src/components/SplitText.vue` 由 [React Bits 官方组件入口](https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/SplitText-TS-CSS.json)
适配为 Vue 3（核对日期：2026-10-21）。复用已安装的 GSAP 3.15 及其 `gsap/SplitText`，
不需要 React、`@gsap/react`、shadcn 或新增样式框架。官方当前入口还包含 hover、loop、effect 等扩展；
本项目只移植所需的逐字/词/行入场。版权与完整许可继续保留在 `frontend/public/licenses/react-bits-LICENSE.md`。

该组件保留供复用，当前页面不再使用。首页首屏标题为普通 h1，保留双语内容和换行，与其他页面一样由 AnimatedContent 整段入场。

```vue
<SplitText tag="h2" :text="title"
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

如将 SplitText 嵌入 AnimatedContent，两者共用触发时机。当前首页内容区使用普通标题，避免叠加两层入场；首屏标题整段上移淡入，
不使用整页揭幕遮罩。
保留原 h1/h2/h3、换行、字号、间距和主题样式，英文保持整词换行，中文可按字换行。
GSAP 提供完整标题的无障碍名称并隐藏片段的重复朗读；减少动态效果设置实时还原普通文本。
语言和参数变化、卸载时清理旧动画及触发器；每次挂载播放一次，已完成标题不会因普通断点变化重播。

`frontend/tests/split-text.spec.js` 验证首页标题不拆分、双语切换、移动端换行、减少动态效果及路由清理；运行 `cd frontend && npm run test:e2e`。
