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
- `frontend/src/motion/settings.js` 集中管理节奏：首屏约 750ms，滚动区块约 650ms（手机 550ms），错峰间隔 60ms。区块保持完整亮度，只在屏幕外预置小幅位移再入场，避免先显示后突然变淡；已展示的内容不会因响应式断点变化重播。页面切换使用透明度与 clip-path，区块只移动 transform；不拆分文字、不新增布局包裹或固定滚动区。系统开启“减少动态效果”时立即还原静态内容。
- 同页锚点由 ScrollToPlugin 平滑定位，保留 URL、查询参数与浏览历史；用户手动滚动可中断。跨页锚点及历史返回立即恢复位置。
- 图片加载、字体完成、筛选或 FAQ 高度变化后合并刷新触发位置；首页双列图片离屏或标签页隐藏时暂停。
- `frontend/tests/motion.spec.js` 覆盖逐帧亮度稳定、断点切换不重播、揭幕节奏与中断、视差方向与图片显示边界、滚动入场、样式恢复、快速导航、动态筛选、减少动态效果及离屏暂停。
