# 模板与图片来源

## 模板

保留此前基于用户提供的 `E-commerce Website.md` 与 [MotionSites 模板](https://motionsites.ai/?prompt=ecommerce-website-landing) 实现的布局、色调与动画。该模板不是用户企业的实际官网。此次在现有 Vue 代码上扩展为陶瓷企业双语官网。

## DLIM HOME 产品参考

用户提供的 [Amazon 品牌店](https://www.amazon.com/stores/DLIMHOME/page/C4D9CF2D-0C18-4E7E-8167-46A01ED081DA) 与 [淘宝店](https://shop552623256.taobao.com/) 作为正式跳转入口。店铺首页存在访问限制，因此通过公开索引中的 DLIM HOME 商品资料核对品类与图片，未声称读取了完整店铺目录。

下列图片保存在 `public/images/ceramics/`，用于本地前端开发。它们不是图库授权照片；正式发布前请由企业确认可使用相应产品摄影，或替换为企业提供的原图。

| 文件 | 公开商品资料 / 图源 | 说明 |
| --- | --- | --- |
| `platters.jpg` | [Ibspot DLIM HOME 陶瓷长盘](https://ibspot.com/products/dlim-home-rectangular-ceramic-serving-platters-set-of-3-vintage-white)；[图片](https://images.ibspot.com/fp1930e1sur6r2jndr8g3qy9iwiw?width=1000&height=1000&format=jpeg) | 复古白色浮点边缘长盘 |
| `serving-bowls.jpg` | [带把手盛食碗产品汇总](https://fenlandyouthradio.com/serving-bowls-with-handles/)中的 DLIM HOME 条目；[Amazon 图片](https://m.media-amazon.com/images/I/31JIs3PDMQL._SL500_.jpg) | 双耳白色盛食碗，原图约 500px，后续建议替换高清自有图 |
| `bakeware.jpg` | 公开 Zola 商品条目中品牌为 DLIM HOME 的 12oz 矩形陶瓷烘焙盘；[商品图片](https://images.zola.com/c6c324e1-4254-4b46-ae89-9c9a08006489?fit=fill&w=1000&h=1000) | 只参考商品信息，未使用用户或注册表个人资料 |

目录按系列展示，不代表完整在售 SKU。价格、尺寸、食品接触资质、耐热范围、库存、配送与退换政策均以官方店铺具体商品信息为准。

## 陶瓷生活与工艺示意图

这些图片用来建立陶瓷生活场景，**不是企业工厂、生产线、员工或品牌产品的实拍证明**。工厂页提供配图说明；餐桌系列详情也标注为场景配图。

| 文件 | Pexels 来源页 |
| --- | --- |
| `dining.jpg` | https://www.pexels.com/photo/ceramic-plates-on-the-table-6794575/ |
| `craft.jpg` | https://www.pexels.com/photo/hands-making-clay-bowl-8063870/ |
| `atelier.jpg` | https://www.pexels.com/photo/hands-of-a-potter-working-with-clay-6611351/ |
| `ritual.jpg` | https://www.pexels.com/photo/ceramic-plates-and-mugs-in-neutral-colours-10622354/ |
| `gathering.jpg` | https://www.pexels.com/photo/ceramic-plates-on-the-table-7472695/ |
| `dinnerware.jpg` | https://www.pexels.com/photo/ceramic-plates-on-the-table-6794583/ |

[Pexels 使用条款](https://www.pexels.com/license/)。照片保持原始内容，通过 CSS 裁切或留白展示。旧版健康主题图片（`public/images/` 根目录中的 `botanical.jpg`、`care.jpg`、`fitness.jpg`、`ritual.jpg`、`skin.jpg`、`tubes.jpg`）已在确认无引用后移除；当前使用的 `public/images/ceramics/ritual.jpg` 保留。

## 品牌工作环境实拍

2026-10-19 用户在本次会话中提供以下三张公司相册照片，用于官网品牌与招聘页面。
仅进行了网页分辨率与 JPEG 压缩优化，未重绘、移除水印或改变实景内容。

| 文件 | 场景 |
| --- | --- |
| `public/images/company/shared-space.jpg` | 公共空间与茶水区 |
| `public/images/company/studio.jpg` | 拍摄区域与公共通道 |
| `public/images/company/office.jpg` | 团队办公区 |

招聘页使用办公区实拍作为首屏配图，并展示全部三张照片；相册链接支持查看完整照片。

## 新增产品素材（2026-10-19）

用户提供目录 `DLIM web产品图片开发素材` 中的四张产品照片，用于首页双列滚动和产品目录。
以下是根据照片外观编辑的中英文系列名称，不代表已确认的 SKU、容量、套装件数或耐热规格。
图片仅转为网页 JPEG、适度压缩，保留原图内容；前端采用 contain 展示，避免裁掉杯脚及配件。

| 原文件 | 站内文件 | 系列 |
| --- | --- | --- |
| 已粘贴 2026-10-19 下午1.25.00.png | `public/images/products/heart-coffee-cups.jpg` | 爱心点缀咖啡杯 |
| 已粘贴 2026-10-19 下午1.26.30.png | `public/images/products/amber-textured-glasses.jpg` | 琥珀杯脚纹理杯 |
| 已粘贴 2026-10-19 下午1.41.33.png | `public/images/products/amber-stem-glasses.jpg` | 琥珀杯脚高脚杯 |
| 已粘贴 2026-10-19 下午1.34.11.png | `public/images/products/kitchen-lid-racks.jpg` | 厨房锅盖置物架 |

新增杯具和厨房配件分类。玻璃杯单独显示玻璃材质；置物架未确认材质，详情页不展示材质项。

## 官网 Logo（2026-10-19）

`public/images/brand/dlim-home.svg` 来自用户提供的 `DLIM-Home-transparent.svg`。仅收紧 SVG 的 viewBox 以移除外围留白，保留原始矢量路径与比例。页头显示黑色，深色页脚通过 CSS 反白；两处均链接至首页。

## 首页场景图片更新（2026-10-19）

用户在会话中提供两张餐桌产品图，转换为 JPEG 并压缩后用于首页双列滚动；未重绘图片内容。

| 用户附件 | 站内文件 | 场景 |
| --- | --- | --- |
| `codex-clipboard-d2b4489d-6f72-43d3-ba6f-26c20eccaa7d.png` | `public/images/ceramics/sage-table-setting.jpg` | 青绿釉餐具与用餐场景 |
| `codex-clipboard-88417cee-cd65-4e6d-a39d-b73336ef4224.png` | `public/images/ceramics/sage-breakfast-table.jpg` | 木桌上的杯碗与水果 |

双列滚动移除三张白底产品图。首页三张产品卡片改为爱心咖啡杯、琥珀纹理杯、厨房置物架，使用已有产品照片与对应详情链接；卡片以 cover 填满画面，咖啡杯靠右裁切保留杯柄，产品详情仍完整展示原图。
