# AGENTS.md

本文件是本仓库中 AI 编码代理的项目指南。除非用户另有明确要求，修改代码时应遵守以下约定。

## 项目概览

DLIM 企业官网采用前后端分离架构：

- 后端：Django + Django REST Framework
- 管理后台：Django Admin + django-simpleui
- 前端：Vue 3 + Vite
- 开发数据库：SQLite
- Python 依赖管理：uv
- Node 依赖管理：npm

Django 只负责管理后台、数据模型和 API，不负责渲染企业官网页面。Vue 是唯一的官网前端。

## 目录结构

```text
.
├── backend/
│   ├── config/              # Django 项目配置、根路由、ASGI/WSGI
│   ├── website_admin/       # 网站后台管理应用及 API
│   ├── db.sqlite3           # 本地开发数据库，不提交 Git
│   └── manage.py
├── frontend/
│   ├── public/              # 原样复制的静态资源
│   ├── src/                 # Vue 源码
│   ├── .env.example         # 前端环境变量示例
│   └── vite.config.js       # Vite 配置和开发代理
├── src/dlim_home_web/       # Python 项目包
├── pyproject.toml           # Python 项目与依赖声明
├── uv.lock                  # Python 锁文件
└── README.md                # 使用说明
```

## 开发环境

要求：

- Python 3.12+
- uv
- Node.js 20+
- npm

安装后端依赖：

```bash
uv sync
```

安装前端依赖：

```bash
cd frontend
npm install
```

添加 Python 依赖时使用 `uv add <package>`，并同时提交 `pyproject.toml` 和 `uv.lock` 的变更。添加前端依赖时在 `frontend/` 中使用 `npm install <package>`，并同时更新 `package.json` 和 `package-lock.json`。

## 启动服务

在项目根目录启动 Django：

```bash
uv run python backend/manage.py migrate
uv run python backend/manage.py runserver 127.0.0.1:8000
```

在第二个终端启动 Vue：

```bash
cd frontend
npm run dev
```

本地地址：

- 官网：<http://127.0.0.1:5173/>
- 管理后台：<http://127.0.0.1:8000/admin/>
- 健康检查：<http://127.0.0.1:8000/api/health/>

Vite 将 `/api` 代理到 `http://127.0.0.1:8000`。前端请求后端时优先使用相对路径，例如 `/api/products/`，不要在业务代码中硬编码本地地址。生产环境 API 地址通过 `VITE_API_BASE_URL` 配置。

## Django 约定

- Django 设置位于 `backend/config/settings.py`。
- 根路由位于 `backend/config/urls.py`。
- 网站管理相关模型、后台注册和 API 放在 `backend/website_admin/`。
- 新增模型后必须创建并提交迁移：

  ```bash
  uv run python backend/manage.py makemigrations
  uv run python backend/manage.py migrate
  ```

- 新 API 应放在 `/api/` 命名空间下，并在 `website_admin/urls.py` 中声明。
- API 默认返回 JSON；不要新增用于官网页面的 Django Template。
- `simpleui` 必须保持在 `INSTALLED_APPS` 中 `django.contrib.admin` 之前。
- 后台默认语言保持 `zh-hans`，时区保持 `Asia/Shanghai`。
- 新增需要后台维护的模型时，应同步在 `website_admin/admin.py` 中注册并提供适当的列表、搜索和筛选配置。

## Vue 约定

- 使用 Vue 3 Composition API 和 `<script setup>`。
- 页面与组件放在 `frontend/src/`，可复用组件放在 `frontend/src/components/`。
- 样式应兼顾桌面端与移动端，并保持中文内容可读性。
- 不要将 Django Admin 的样式或模板引入 Vue 前端。
- 环境变量必须以 `VITE_` 开头；密钥和真实生产配置不得提交 Git。
- `frontend/dist/` 和 `frontend/node_modules/` 是生成目录，不要直接编辑或提交。

## 验证与测试

完成后端修改后运行：

```bash
uv run python backend/manage.py check
uv run python backend/manage.py test website_admin
```

完成前端修改后运行：

```bash
cd frontend
npm run build
```

涉及前后端联动时，还应同时启动两个服务并确认：

- `/api/health/` 返回 HTTP 200。
- 官网能够正常加载且显示“后台服务运行正常”。
- 管理后台登录页使用中文 simple-ui 界面。

前端浏览器交互测试：

```bash
cd frontend
npm run test:e2e
```

默认使用本机 Google Chrome，配置见 `frontend/playwright.config.js`；
测试会自动启动或复用 Vite。测试覆盖导航、轮播、FAQ、弹窗、邮箱校验、移动端溢出、
动画参数与 reduced-motion。无 Chrome 时可安装 Playwright Chromium 并设置
`PLAYWRIGHT_CHANNEL=chromium`。

当前项目没有配置独立的 lint 或格式化脚本，不要假设 `npm run lint` 存在。若新增相关工具，应同步更新本文件和 README。

## 数据与安全

- `backend/db.sqlite3` 是本地开发数据，不提交 Git，也不要在没有用户明确授权的情况下删除或重建。
- 当前开发超级管理员为 `admin/admin`，仅限本地开发。不要把该密码用于部署环境。
- 不得提交 `.env`、API 密钥、生产数据库凭据或其他秘密信息。
- 修改 CORS、CSRF、`ALLOWED_HOSTS`、`DEBUG` 或 `SECRET_KEY` 时，应区分本地开发与生产环境，避免放宽生产安全设置。
- 不要覆盖用户已有的未提交更改；修改前先检查 `git status`。

## 变更原则

- 保持前后端职责分离，不把 Vue 构建产物接回 Django 模板系统，除非用户明确要求改变部署架构。
- 优先做范围小、可验证的修改，避免与当前任务无关的重构。
- 新功能应补充对应测试；至少保证 Django 检查、后端测试和 Vue 构建通过。
- 如果启动服务时提示端口已占用，先确认现有服务是否已经运行，不要随意终止未知进程。
- 对启动方式、环境变量或目录结构的修改，应同步更新 `README.md`。
