# DLIM Home — 品牌视觉手册 / Brand Manual v1.0

交付日期 / Date: 2026-10-19

## 打开 / Open

用浏览器打开 `index.html`。请保留 `assets/` 与入口文件的相对位置。手册不依赖外部 CDN、网络字体或构建服务，可直接离线阅读。

Open `index.html` in a browser and preserve the folder structure. The manual works offline with no CDN or remote font dependency.

也可在本目录运行 `python3 -m http.server 8766 --bind 127.0.0.1`，访问本机预览。完整 ZIP 是与本目录并列的独立交付包，页面内可逐项下载资产。

## 包含 / Included

- 21 章，203 个可见编号子项，中英双语且中文优先。
- 已确认 A「器物署名」Logo 的 5 份 PNG：透明主标志、透明独立印记、黑白、反白与规范展示板。
- 8 张独立应用图：陶瓷底款、产品包装、运输标签、护理卡、购物袋、餐桌首屏、釉面细节、社媒场景。
- 色彩、字体、版式、辅助图形、图标、数字组件、动效、办公与宣传物料规范。
- 可复制色值和 CSS 变量，CSS / JSON 设计变量，图片放大、原图下载、响应式目录与覆盖清单。
- 可编辑源文件及浏览器验证截图、报告。

## 源文件 / Editable sources

- `content.tsv`：203 条双语规范，格式为编号、中文、英文，使用 `|` 分隔。
- `outline.md`：固定的 21 章结构及子项标题。
- `build_manual.py`：使用 Python 标准库生成 `index.html`、`tokens.css`、`tokens.json`、`coverage.json`。
- `manual.css` / `manual.js`：手册样式与交互；构建时嵌入 HTML。
- `asset-info.json`：PNG 宽高与透明标志可见边界，用于保持比例与 CSS 裁切；不重绘 Logo。
- `image-generation.json`：内置 image_gen 工具的 8 条完整应用图提示词与来源文件 ID。
- `assets/logos/`：已批准的图片母版；禁止用生成场景中的印记替代母版。
- `assets/applications/`：8 张应用概念原图。
- `qa/`：浏览器验证脚本、报告与关键页面截图。

更新源文件后执行：

```bash
python3 build_manual.py
```

Logo 始终直接复用已批准 PNG。页面内的可见边界裁切、缩放与错误示例仅是 HTML/CSS 展示，不生成矢量重构。

## 验证 / QA

本机 Google Chrome / Playwright 验证通过：

- 21 章与 203 个子项完整，无重复或缺失编号。
- 本地图片与下载链接有效，图片比例保留。
- 1440、1024、768、390、375 px 宽度无页面横向溢出。
- 色值复制在 HTTP 与本地 file URL 下通过。
- 图片对话框支持 Escape 与关闭后返回焦点。
- 手机目录当前项、表单无效/有效输入、减少动态效果检查通过。
- 无 JavaScript 运行错误。

`qa/check.cjs` 使用本项目现有 `frontend/node_modules/@playwright/test`；从仓库根目录运行，并先启动 8766 端口预览服务。源码修改后重新构建与验证。外部协作者可自行安装 Playwright 并调整依赖路径。

## 使用边界 / Production notes

应用图片为 AI 生成的品牌概念，不代表真实 SKU、工厂能力、合格认证或实测护理性能。细小标志在场景中可能有生成与透视差异；生产始终取独立 Logo 母版。

底款尺寸、印刷细缝、包装结构、承重与跌落、SKU 参数及护理声明需用实际产品验证。CMYK 数字为未校色数学参考，Pantone 未指定。PNG 不是刀模、分色或矢量源文件。

品牌使命、愿景与传播文案以建议标注；中文名称、实体空间与多数非陶瓷周边不适用原因已在对应子项中写明。完整内容覆盖不等于全部生产参数已核验。

## 字体 / Fonts

建议思源宋体与思源黑体，官方采用 SIL OFL 1.1：

- https://github.com/adobe-fonts/source-han-sans/blob/master/LICENSE.txt
- https://github.com/adobe-fonts/source-han-serif/blob/master/LICENSE.txt

本包不附字体文件。页面优先使用已安装字体，其次使用苹方、宋体等系统回退；实际显示会随设备变化。分发字体时遵循对应许可。

## 确认记录 / Approval record

1. 用户提供完整品牌简报。
2. 用户批准 A/B/C 三路出图，并选择 A「器物署名」。
3. 用户确认最终 Logo 图片资产。
4. 用户确认 21 章 VI 结构、8 张应用图及 HTML 制作。
5. 本次完成制作与验证；后续修改以版本记录管理。

没有改动现有 Vue/Django 网站业务代码，品牌手册作为独立可分享交付物保存。
