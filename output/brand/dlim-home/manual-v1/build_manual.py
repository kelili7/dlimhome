"""Build the offline bilingual manual. Standard library only; never edits logo pixels."""
from pathlib import Path
import re, json, html, math

ROOT = Path(__file__).resolve().parent
esc = html.escape
assets = json.loads((ROOT / 'asset-info.json').read_text())
chapters = []
for line in (ROOT / 'outline.md').read_text().splitlines():
    m = re.match(r'### (\d+)\. (.+)', line)
    if m:
        title = m[2].split(' / ', 1)
        chapters.append({'id': int(m[1]), 'zh': title[0], 'en': title[1], 'items': []})
    m = re.match(r'^(\d+\.\d+) (.+?)\s*$', line)
    if m and chapters:
        chapters[-1]['items'].append((m[1], m[2]))
copy = {}
for line in (ROOT / 'content.tsv').read_text().splitlines():
    if line.strip():
        n, zh, en = line.split('|', 2)
        assert n not in copy, n
        copy[n] = (zh, en)
expected = {n for ch in chapters for n, _ in ch['items']}
assert expected == set(copy), (expected - set(copy), set(copy) - expected)
assert len(chapters) == 21

def img(path, alt, cls='', eager=False):
    d = assets[path]
    return f'<img class="{cls}" src="{path}" alt="{esc(alt)}" width="{d["width"]}" height="{d["height"]}" loading="{"eager" if eager else "lazy"}" decoding="async">'

def logo(which='primary-transparent', cls=''):
    path = f'assets/logos/{which}.png'
    d = assets[path]; x, y, r, b = d['bbox']; w, h = r-x, b-y
    style = f'aspect-ratio:{w}/{h};--logo-w:{d["width"]/w*100:.5f}%;--logo-left:{-x/w*100:.5f}%;--logo-top:{-y/h*100:.5f}%'
    return f'<div class="logo-content {cls}" style="{style}">{img(path,"DLIM Home 已批准标志 / Approved logo")}</div>'

def figure(key, title, en, cls=''):
    path = f'assets/applications/{key}.png'
    return f'<figure class="photo {cls}"><button class="image-open" type="button" data-image="{path}" data-caption="{esc(title)}" aria-label="放大查看：{esc(title)}">{img(path,title)}</button><figcaption><span>{esc(title)}</span><span lang="en">{esc(en)} · AI concept</span></figcaption></figure>'

def note(zh, en):
    return f'<div class="note"><p>{zh}</p><p lang="en">{en}</p></div>'

def copy_button(value, label='复制 / Copy'):
    return f'<button class="copy" type="button" data-copy="{esc(value,quote=True)}">{label}</button>'

palette = [('Ink Brown','墨褐','#342F2B'),('Porcelain','瓷白','#F6F3ED'),('Glaze Green','灰绿','#667362'),('Deep Glaze','深釉绿','#465344'),('Stone','石灰白','#E6E1D8'),('Warm Gray','暖灰','#746C63')]

def rgb(hex):
    return tuple(int(hex[i:i+2],16) for i in (1,3,5))
def lum(hex):
    a = [v/255 for v in rgb(hex)]
    a = [v/12.92 if v<=0.04045 else ((v+.055)/1.055)**2.4 for v in a]
    return sum(x*y for x,y in zip(a,[.2126,.7152,.0722]))
def contrast(a,b):
    x,y=sorted([lum(a),lum(b)]); return (y+.05)/(x+.05)

tokens = {
    'color': {'ink':'#342F2B','porcelain':'#F6F3ED','glaze':'#667362','deep-glaze':'#465344','stone':'#E6E1D8','muted':'#655F57','error':'#9C3B32','advisory':'#75552A'},
    'font': {'sans':'"Source Han Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif','serif':'"Source Han Serif SC", "Songti SC", "STSong", serif'},
    'space': {str(v):f'{v}px' for v in [4,8,12,16,24,32,48,64,96]},
    'radius': {'control':'4px','card':'8px'},
    'motion': {'feedback':'180ms','reveal':'320ms','ease':'cubic-bezier(0.2, 0.7, 0.2, 1)'},
}
css_tokens = ':root {\n' + ''.join(f'  --{group}-{k}: {v};\n' for group, entries in tokens.items() for k,v in entries.items()) + '}\n'
(ROOT/'tokens.json').write_text(json.dumps(tokens,indent=2,ensure_ascii=False))
(ROOT/'tokens.css').write_text(css_tokens)

features = {}
features[1] = '<div class="manifesto"><p class="kicker">OUR POINT OF VIEW / 品牌主张建议</p><p class="statement">让手作的温度，<br>进入每天的生活。</p><p lang="en">The warmth of craft.<br>A place in everyday life.</p><div class="balance"><span>60% 手作温度 / Warmth</span><span>40% 克制精度 / Precision</span></div></div>'
features[2] = f'''<div class="logo-stage"><span class="kicker">APPROVED IDENTITY / 已确认标志</span>{logo()}<p>字母交叠，器物署名。<span lang="en">A maker’s signature for everyday ceramics.</span></p></div>
<div class="variant-grid"><div class="variant">{logo('monogram-transparent')}<span>独立印记 / Monogram</span></div><div class="variant">{img('assets/logos/primary-black-on-white.png','黑白标志')}<span>黑白 / Black on white</span></div><div class="variant">{img('assets/logos/primary-white-on-dark.png','反白标志')}<span>反白 / Reversed</span></div></div>
<figure class="board"><button class="image-open" data-image="assets/logos/logo-system-board.png" data-caption="已确认 Logo 规范板" aria-label="放大 Logo 规范板">{img('assets/logos/logo-system-board.png','已确认 Logo 规范板，含安全空间、形态与头像用法')}</button><figcaption>已批准的规范展示板保留原始评审标签。 / Approved board; original review label retained.</figcaption></figure>'''
features[3] = f'''<div class="diagram-grid"><div class="diagram"><span class="kicker">CLEAR SPACE / 安全空间</span><div class="space-guide"><span class="measure top">x</span><span class="measure left">x</span>{logo()}<span class="measure right">x</span><span class="measure bottom">x</span></div><p>x = H ÷ 4，H 为图形标可见高度。<br><span lang="en">A proportional rule, not a production dimension.</span></p></div><div class="diagram"><span class="kicker">FORM STUDY / 形态分析</span><div class="grid-study">{logo('monogram-transparent')}</div><p>保留原始曲线与窄缝。<br><span lang="en">Explain the source; do not redraw it.</span></p></div></div>
<div class="size-row">{''.join(f'<div><div style="height:{s}px;width:{s*820/666:.3f}px">{logo("monogram-transparent")}</div><span>{s} px</span></div>' for s in [64,48,32,16])}</div>
{note('小尺寸按当前屏幕真实 CSS 像素显示；16 px 是极限观察，非批准最小值。','Actual CSS-size previews. Physical ceramic marks require proofing.')}
<div class="misuse-grid">{''.join(f'<div class="misuse"><div class="{c}">{logo()}</div><p>{t}</p></div>' for c,t in [('stretch','禁止拉伸 / No stretching'),('rotate','禁止旋转 / No rotation'),('low-contrast','禁止低对比 / No low contrast'),('shadowed','禁止阴影 / No shadows')])}</div>'''
swatches = []
for en,zh,hx in palette:
    r,g,b=rgb(hx); k=1-max(r,g,b)/255
    cmyk=[round((1-v/255-k)/(1-k)*100) if k<1 else 0 for v in (r,g,b)]+[round(k*100)]
    fg='#FFFFFF' if contrast('#FFFFFF',hx)>contrast('#342F2B',hx) else '#342F2B'
    swatches.append(f'<div class="swatch"><div class="swatch-color" style="background:{hx};color:{fg}"><strong>{zh}</strong><span>{en}</span></div><div class="swatch-info"><code>{hx}</code>{copy_button(hx)}<p>RGB {r}, {g}, {b}<br>CMYK ≈ {", ".join(map(str,cmyk))}%</p></div></div>')
features[4] = '<div class="palette">'+''.join(swatches)+'</div><div class="ratio"><span>70% 瓷白与浅中性色</span><span>20%</span><span>10%</span></div><div class="contrast-table"><h3>文字对比度 / Text contrast</h3>'+''.join(f'<p><span>{a} / {b}</span><strong>{contrast(a,b):.2f}:1</strong></p>' for a,b in [('#342F2B','#F6F3ED'),('#465344','#F6F3ED'),('#667362','#F6F3ED'),('#F6F3ED','#342F2B')])+'</div>'+note('CMYK 仅为未校色的换算参考；Pantone 尚未指定。','Confirm ink, stock and print profile through physical proofs.')
features[5] = '''<div class="type-specimen"><p class="kicker">CHINESE HEADLINE / 中文标题</p><p class="type-display">日常，自有温度。</p><p class="kicker">LATIN & NUMERALS / 英文与数字</p><p class="type-latin">Made for the everyday.</p><p class="type-numbers">0123456789 · RMB 150 · 280 mL</p><div class="type-body"><p>手作的痕迹，留在每一层釉色里。让器物走进日常，让一餐一饮拥有自己的节奏。</p><p lang="en">The trace of making lives in every layer of glaze. Objects for meals, moments and the rhythm of everyday life.</p></div><p class="micro">护理信息示例：适用方式以对应产品说明为准。 / Follow the verified care instructions for each product.</p></div>'''+note('本页优先使用已安装的思源字体，否则使用系统回退；未嵌入或分发字体文件。','The live specimens use installed fonts with system fallbacks. Font files are not bundled.')
features[6] = '<div class="graphic-spec"><div class="arc-field" aria-label="稀疏开口弧线辅助图形">'+''.join('<i></i>' for _ in range(6))+'</div><div><p class="kicker">A SECONDARY GESTURE / 辅助语言</p><h3>用留白，接住器物。</h3><p>弧线辅助版式，不复制品牌印记。</p><p lang="en">An open curve supports the composition.<br>The logo remains intact.</p></div></div>'
features[7] = '<div class="icon-demo"><div><span class="css-search" aria-hidden="true"></span>搜索 / Search</div><div><span class="css-menu" aria-hidden="true"></span>目录 / Menu</div><div><span class="text-icon" aria-hidden="true">×</span>关闭 / Close</div><div><span class="text-icon" aria-hidden="true">↓</span>下载 / Download</div></div>'
features[8] = figure('07-glaze-detail','看见釉层，而不是滤镜。','Glaze, not a filter')+'<div class="image-direction"><div><h3>应该 / Do</h3><p>自然侧光、真实比例、完整器型、克制道具。</p><p lang="en">Natural light, true scale, complete forms, few props.</p></div><div><h3>避免 / Avoid</h3><p>重棕滤镜、塑料质感、缺陷美化、伪工艺故事。</p><p lang="en">Heavy filters, plastic surfaces and invented craft stories.</p></div></div>'
features[9] = '<div class="layout-spec"><div class="grid-twelve">'+''.join('<span></span>' for _ in range(12))+'</div><div class="layout-copy"><span class="kicker">12 COLUMNS / 12 列</span><h3>一页，一个重点。</h3><p>以边缘对齐建立秩序，以留白保留器物的呼吸。</p></div>'+img('assets/applications/07-glaze-detail.png','版式中的釉面局部裁切','layout-photo')+'</div>'
features[10] = f'''<div class="component-lab"><div><p class="kicker">CONTROLS / 控件样张</p><div class="button-row"><button type="button" class="button demo-action">查看系列 / Explore</button><button type="button" class="button secondary demo-action">了解工艺 / Craft</button><button class="button" disabled>暂不可用 / Disabled</button></div><form id="sample-form" novalidate><label for="sample-email">咨询邮箱 / Email</label><div class="input-row"><input id="sample-email" type="email" placeholder="name@example.com" autocomplete="off" aria-describedby="form-note form-error"><button class="button" type="submit">验证 / Validate</button></div><p id="form-note" class="micro">交互样张，仅在本地验证，不发送数据。 / Local demonstration only.</p><p id="form-error" class="form-message" role="status"></p></form></div><div class="dark-sample"><p class="kicker">DARK SURFACE / 深色样张</p><h3>日常的温度</h3><p lang="en">A calm, readable dark surface.</p><button class="button secondary demo-action">查看示例 / Preview</button></div></div><div class="token-panel"><pre>{esc(css_tokens)}</pre>{copy_button(css_tokens,'复制全部变量 / Copy tokens')}<a href="tokens.css" download>下载 CSS</a><a href="tokens.json" download>下载 JSON</a></div>'''
features[11] = f'<div class="motion-demo"><div id="motion-mark">{logo("monogram-transparent")}</div><div><p class="kicker">320 MS · EASE OUT</p><h3>轻轻出现，清晰停留。</h3><p lang="en">A quiet arrival. A stable presence.</p><button type="button" class="button secondary" id="replay">重播示例 / Replay</button></div></div>'
features[12] = '''<div class="office-sheet"><div class="sheet-header"><strong>DLIM Home</strong><span>报价单 / QUOTATION</span></div><p>客户 / Client：待填写　　日期 / Date：待填写　　币种 / Currency：待确认</p><div class="table-wrap"><table><thead><tr><th>SKU</th><th>品名 / Item</th><th>数量 / Qty</th><th>单价 / Unit</th><th>金额 / Total</th></tr></thead><tbody><tr><td>待填写</td><td>待填写</td><td>—</td><td>—</td><td>—</td></tr><tr><td colspan="5">价格、交期、税费与运输条款确认后填写。 / Confirm commercial terms before use.</td></tr></tbody></table></div><p class="micro">版式样张，不构成实际报价。 / Layout specimen, not a commercial quotation.</p></div>'''
features[13] = '<div class="campaign"><div><p class="kicker">CAMPAIGN COPY / 传播文案建议</p><h3>日常，<br>自有温度。</h3><p lang="en">Warmth, every day.</p>'+logo()+'</div>'+img('assets/applications/08-social-scene.png','宣传海报中的日常餐桌','campaign-image')+'</div>'
features[14] = '<div class="website-spec"><div class="mini-nav"><strong>DLIM Home</strong><span>器物　工艺　关于</span></div><div class="mini-hero">'+img('assets/applications/06-table-hero.png','官网首屏视觉示例')+'<div><h3>给日常，<br>一份温润。</h3><p lang="en">Objects for everyday rituals.</p><a class="button" href="#chapter-15">探索包装 / Packaging</a></div></div></div><div class="social-spec">'+figure('08-social-scene','一餐一饮，自有节奏。','A rhythm of your own')+'<div><p class="kicker">SOCIAL TEMPLATE / 社媒模板</p><h3>一只杯子，<br>一个日常片刻。</h3><p lang="en">One cup. An everyday moment.</p><p>标题 2 行以内 · 固定边距 · 器物为主</p><p class="micro">示例图可完整查看，也可按平台构图裁切。核心器物和标志不得被截断。</p></div></div>'
features[15] = figure('02-product-box','从保护，到打开的仪式。','Protection, then a quiet reveal')+'<div class="photo-grid">'+figure('03-shipping-label','运输外箱与产品标签','Shipping and product labels')+figure('04-care-cards','感谢与日常养护','Thanks and everyday care')+'</div>'+figure('05-shopping-bag','把温度带回家。','Take the warmth home','portrait-photo')+note('所有包装图片为应用概念。刀模、承重、跌落测试、底款工艺和护理信息须由实际供应链验证。','Application concepts are not manufacturing artwork or verified product claims.')
features[16] = note('本阶段不适用 / Not applicable at this stage','No store, office or event environment has been specified. All nine subsections remain visible below.')
features[17] = figure('01-ceramic-stamp','署名在底，器物在前。','A discreet signature beneath the object')
features[18] = '<div class="showcase-grid">'+''.join(figure(k,t,e) for k,t,e in [('01-ceramic-stamp','器物底款','Product'),('02-product-box','产品包装','Packaging'),('04-care-cards','护理卡','Care'),('05-shopping-bag','购物袋','Retail'),('06-table-hero','日常餐桌','Everyday'),('08-social-scene','社媒场景','Social')])+'</div>'
features[19] = '<div class="image-direction"><div><h3>保留 / Preserve</h3><p>原始标志、真实信息、自然釉色、清晰层级。</p><p lang="en">Approved masters, truthful copy, natural glaze, clear hierarchy.</p></div><div><h3>拒绝 / Reject</h3><p>随意重绘、虚构认证、滤镜遮掩、装饰过载。</p><p lang="en">Redrawn marks, invented credentials, misleading filters, visual noise.</p></div></div>'
downloads = [('assets/logos/primary-transparent.png','透明主标志 / Primary'),('assets/logos/monogram-transparent.png','独立印记 / Monogram'),('assets/logos/primary-black-on-white.png','黑白版 / Mono'),('assets/logos/primary-white-on-dark.png','反白版 / Reverse'),('assets/logos/logo-system-board.png','规范板 / Logo board'),('tokens.css','CSS 变量'),('tokens.json','JSON 变量'),('image-generation.json','生成提示词 / Prompts')]
downloads += [(f'assets/applications/{key}.png', f'{key[:2]} 应用图 / Application') for key in ['01-ceramic-stamp','02-product-box','03-shipping-label','04-care-cards','05-shopping-bag','06-table-hero','07-glaze-detail','08-social-scene']]
features[20] = '<div class="downloads">'+''.join(f'<a href="{p}" download><span>{t}</span><span aria-hidden="true">↓</span></a>' for p,t in downloads)+'</div><div class="source-links"><p>字体与许可来源 / Font and licence sources</p><a href="https://github.com/adobe-fonts/source-han-sans">思源黑体 / Source Han Sans</a><a href="https://github.com/adobe-fonts/source-han-serif">思源宋体 / Source Han Serif</a><a href="https://github.com/adobe-fonts/source-han-sans/blob/master/LICENSE.txt">Sans OFL 1.1</a><a href="https://github.com/adobe-fonts/source-han-serif/blob/master/LICENSE.txt">Serif OFL 1.1</a></div>'
features[21] = '<div class="governance"><p class="kicker">VERSION 1.0 / 2026.10.19</p><h3>一个清晰的来源，<br>一套持续使用的语言。</h3><p lang="en">One clear source. A language for continued use.</p><p>Logo 与制作范围已确认。品牌负责人、真实 SKU 信息及量产验证由品牌方补充。</p></div>'

intro = {
1:('从每天使用的器物，建立真实的品牌。','Build the brand through objects used every day.'),2:('识别从一枚署名开始。','Recognition begins with a maker’s signature.'),3:('不改变造型，让每次使用都清楚。','Preserve the form. Keep every use clear.'),4:('瓷白留出呼吸，墨褐建立识别。','Porcelain creates space. Ink establishes recognition.'),5:('中文有温度，信息有秩序。','Warm Chinese typography. Clear information.'),6:('辅助图形退后，器物与标志向前。','Secondary graphics support objects and identity.'),7:('每一个小符号，都先回答一个功能。','Every small symbol serves a clear function.'),8:('让光，解释材料。','Let light explain the material.'),9:('在留白中，建立阅读的顺序。','Give reading a rhythm through space.'),10:('把品牌语言，转化成可用的界面。','Translate the identity into usable interfaces.'),11:('有回应，但不打扰。','Responsive, without distraction.'),12:('日常商务，也保持清楚与克制。','Carry clarity into everyday business.'),13:('每一次传播，只说清楚一件事。','One clear thought in each communication.'),14:('从首页到内容，让识别自然延续。','Carry the identity from the homepage into content.'),15:('包装先保护，再表达。','Protection first. Expression follows.'),16:('保留未来空间，不虚构当下。','Leave room for the future without inventing the present.'),17:('以核心产品为中心。','Keep the core ceramics at the center.'),18:('同一份温度，出现在不同触点。','The same warmth across different touchpoints.'),19:('清楚边界，才能保持一致。','Clear boundaries protect consistency.'),20:('让规范可以被使用。','Make the system usable.'),21:('从一次交付，到长期维护。','From delivery to continued stewardship.')}

sections=[]; coverage=[]
for ch in chapters:
    n=ch['id']; zh,en=intro[n]; items=[]; na=0
    for num,title in ch['items']:
        a,b=copy[num]; inactive=a.startswith('本阶段不适用') or a.startswith('当前不建立')
        na+=int(inactive)
        badge='<span class="status">本阶段不适用 / N/A</span>' if inactive else ''
        items.append(f'<article class="rule" id="rule-{num}"><div class="rule-title"><span class="rule-no">{num}</span><h3>{esc(title)}</h3></div>{badge}<p>{esc(a)}</p><p class="en" lang="en">{esc(b)}</p></article>')
    sections.append(f'<section class="chapter" id="chapter-{n:02d}" aria-labelledby="heading-{n}"><header class="chapter-header"><span class="chapter-no">{n:02d}</span><div><p class="kicker">{esc(ch["en"])}</p><h2 id="heading-{n}">{esc(ch["zh"])}</h2><p class="chapter-intro">{zh}<span lang="en">{en}</span></p></div></header>{features.get(n,"")}<div class="rules">{"".join(items)}</div><a class="back-index" href="#top">返回封面 / Back to cover ↑</a></section>')
    status='本阶段不适用，已说明 / N/A explained' if na==len(ch['items']) else '已覆盖，含不适用说明 / Covered with N/A notes' if na else '已覆盖 / Covered'
    coverage.append({'chapter':n,'title':ch['zh'],'subsections':len(ch['items']),'status':status,'na_count':na})
nav=''.join(f'<a href="#chapter-{ch["id"]:02d}"><span>{ch["id"]:02d}</span><span>{ch["zh"]}<small lang="en">{ch["en"]}</small></span></a>' for ch in chapters)
checklist='<section id="coverage" class="coverage"><p class="kicker">COVERAGE CHECKLIST / 完整性检查</p><h2>21 章，逐项可查。</h2><p>共 '+str(len(expected))+' 个编号子项。已覆盖指规范内容完整，不等同于量产验证完成。<br><span lang="en">Coverage confirms documented rules, not completed manufacturing validation.</span></p><div class="table-wrap"><table><thead><tr><th>章节 / Chapter</th><th>子项 / Items</th><th>状态 / Status</th></tr></thead><tbody>'+''.join(f'<tr><td><a href="#chapter-{c["chapter"]:02d}">{c["chapter"]:02d} {c["title"]}</a></td><td>{c["subsections"]}</td><td>{c["status"]}</td></tr>' for c in coverage)+'</tbody></table></div></section>'
css=(ROOT/'manual.css').read_text(); script=(ROOT/'manual.js').read_text()
document=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="DLIM Home 完整中英双语品牌视觉规范，21 章、8 张应用图与已确认 Logo 资产。"><title>DLIM Home — 品牌视觉手册 / Brand Manual</title><style>{css_tokens}\n{css}</style></head><body>
<a class="skip-link" href="#chapter-01">跳转正文 / Skip to content</a>
<header class="mobile-bar"><a href="#top">DLIM Home</a><button type="button" id="menu-toggle" aria-expanded="false" aria-controls="sidebar">目录 / Index</button></header>
<aside id="sidebar"><a class="sidebar-brand" href="#top">DLIM Home<span>品牌视觉手册 / Brand Manual</span></a><div class="sidebar-meta">V.01 · 2026<br>温润 · 克制 · 日常</div><nav aria-label="章节目录 / Chapters">{nav}<a href="#coverage"><span>✓</span><span>覆盖检查<small>Coverage checklist</small></span></a></nav><div class="sidebar-bottom"><a href="#chapter-20">资产下载 / Assets ↓</a><span id="reading-position">01 / 21</span></div></aside>
<main id="main"><section class="cover" id="top"><div class="cover-top"><span>DLIM HOME — IDENTITY GUIDELINES</span><span>2026 / EDITION 01</span></div><div class="cover-body"><div class="cover-copy">{logo('monogram-transparent','cover-mark')}<p class="kicker">A MAKER’S SIGNATURE / 器物署名</p><h1>日常，<br>自有温度。</h1><p class="cover-en" lang="en">The warmth of craft.<br>The rhythm of home.</p><p class="cover-description">DLIM Home 品牌视觉手册<br>手作餐具 · 家居陶瓷 · 日常生活</p><a class="text-link" href="#chapter-01">开始阅读 / Explore the manual <span>↓</span></a></div><div class="cover-image">{img('assets/applications/06-table-hero.png','温润日光中的手作盘碗与杯具','',True)}<span>EVERYDAY OBJECTS, INDIVIDUAL CHARACTER.</span></div></div><div class="cover-bottom"><span>21 CHAPTERS / 完整规范</span><span>08 APPLICATIONS / 应用图像</span><span>中文为主 · ENGLISH SUPPORTED</span></div></section>
<div class="manual-intro"><p>一套围绕日常器物的视觉语言。</p><p lang="en">A visual language built around the objects we live with.</p><div class="intro-links"><a href="#chapter-02">标识 / Identity ↗</a><a href="#chapter-15">包装 / Packaging ↗</a><a href="#chapter-20">资产 / Assets ↗</a></div></div>
{''.join(sections)}{checklist}<footer><p>DLIM Home · 品牌视觉手册 / Brand Identity Manual</p><p>Version 1.0 · 2026-10-19 · 图像概念与生产参数分开管理。</p><a href="#top">回到开始 / Back to top ↑</a></footer></main>
<dialog id="image-dialog" aria-labelledby="image-dialog-title"><div class="dialog-top"><h2 id="image-dialog-title">图片预览</h2><button type="button" id="dialog-close" aria-label="关闭图片预览 / Close preview">关闭 / Close ×</button></div><img id="dialog-image" alt=""><a id="dialog-download" download>下载原图 / Download image ↓</a></dialog><div id="toast" role="status" aria-live="polite"></div><script>{script}</script></body></html>'''
(ROOT/'index.html').write_text(document)
(ROOT/'coverage.json').write_text(json.dumps({'chapters':coverage,'subsection_count':len(expected),'images':len(list((ROOT/'assets/applications').glob('*.png')))},ensure_ascii=False,indent=2))
print(f'Built {len(chapters)} chapters, {len(expected)} numbered subsections; {len(document):,} characters.')
