# 十二星座小太空 · 工作区规约

> 7 岁的小爱口述的睡前有声故事系列 · 爸爸(Jiang Le)工程化。
> 这是全仓库唯一规约文件,覆盖内容真值源(仓库根)与工程化层(site/)。

## 这是什么

温柔、梦幻的睡前有声故事。十二星座姐妹和特别星座们住在星空里的小太空。
内容真值源在仓库根,`site/` 是把这些内容工程化成的 Astro 静态站,部署到 Cloudflare Pages,正式网址 https://zodiac-little-space.jiangle.name/(`zodiac-little-space.pages.dev` 为默认域名)。
License: **CC BY-NC-SA 4.0**(署名小爱口述 / Jiang Le 整理,非商业,相同协议共享)。

## 仓库布局

```
zodiac-little-space/
├── assets/        原图真值源:characters/ locations/ banners/ covers/ episodes/(中文文件名)
│                  · characters/ 29 张立绘(十二星座 + 爸比座/妈咪座 + 星砾座 + 青原座 + 云螺座 + 米虾座 + 星灵座 + 云穗座 + 月兔座 + 天猫座 + 大海星座汐涟座/夕海座 + 月亮姐姐/月亮妹妹/星星姐妹;爱心座/闪亮座已下线,文件保留备用)
│                  · locations/  星空泳池 / 星月楼梯 / 星座小人超市 / 青青草原(第四集起,摩羯射手家) / 晚霞海(第五集起,远方) / 星星小溪(第七集起,巨蟹天蝎家) / 月光农场(第十集起,金牛天秤家) / 星光森林(第十三集起,狮子白羊家) / 小太空边上的小房子(第十五集起,双子处女一家和天猫座的家)
│                  · banners/    全员图鉴(文字无错,可用);十二星座小太空首页banner(右侧星座名有 AI 错别字,勿当主角展示)
│                  · covers/     第N集.jpg(中文大写集数名)
│                  · episodes/   情节插图(如"双鱼座激动跳海水瓶座拉住她.jpg"),喂给 episodes.ts 的 illustrations 在故事页「本集画面」画廊展示
│                  · constellations/ Q 版星座卡 27 张(AI 生成,agnes/seedream/chatgpt image2;真实 13 张以星位参考图做 img2img,虚构 11 张 text2img,另有月亮姐姐/月亮妹妹/星星姐妹 3 张居民卡)
│                                十二星座 + 天猫座(首个非黄道真实星座,无生日日期,星位参考图 docs/天猫座星位参考图.png 按星表坐标脚本渲染)+ 8 虚构星座(爸比/妈咪/汐涟/夕海/星砾/青原/云螺/米虾),文件名 = 角色中文名(双鱼座.jpg)
│                                图鉴弹窗星空板块:十二星座+天猫座挂「✨ 真实的星空」(真实天文知识+观测季/最亮星/神话;生日日期(constellationDates,约定的占星说法,非天文知识)仅黄道十二宫有,无日期时模板自动跳过该行),
│                                虚构星座挂「🌙 想象中的星空」(形状按角色设定设计,文案向孩子讲清"天上没有")
│                                真实星位坐标保留在 constellations.ts 作天文参考(原版画星图方案产物,现不渲染)
│                                新增虚构星座卡的完整流程见下方「新增虚构星座卡」
│                  · decor/      装饰素材:云朵页脚带(全站页脚上方)/星月分隔串(.flourish 分节符)——透明底 PNG
│                                (白底图用 site/scripts/knockout-white.py 抠白:边缘连通近白区域→腐蚀断缝防漏进白芯→alpha;换图后重跑)
│                                页面引用 WebP 变体保 alpha,不派生 JPG 变体(丢 alpha 变黑底);不依赖 multiply 混合
│                                /十二星座贴纸全家福(站点图标源图)
├── audio/         配音 mp3 真值源:{slug}.mp3
├── public/fonts/  猫啃网风雅宋真值源: display-song-bold.ttf (Bold, 400/700 共用)
├── stories/       故事正文 markdown 真值源:{slug}.md
├── docs/          系列设定.md(角色/世界观真值源)
├── site/          Astro 7 静态站(部署 Cloudflare Pages,正式网址 zodiac-little-space.jiangle.name)
│   ├── src/
│   │   ├── pages/      6 路由: / (= /home) /home /story-list /story/[slug] /characters /scenes
│   │   ├── components/ ResponsiveImage, CharacterPortrait
│   │   ├── data/       episodes.ts / characters.ts / scenes.ts / constellations.ts(星空板块:十二星座真实天文知识+星位坐标存档,虚构星座想象知识) / asset-url.ts / asset-hashes.json
│   │   ├── layouts/    Base.astro (全站布局 + 顶部导航)
│   │   └── styles/     shared.css (全站唯一,OKLch tokens,梦幻夜空主题)
│   ├── scripts/   sync-assets.sh + generate-image-variants / generate-asset-hashes / build-durations
│   │              / generate-zodiac-icons(站点图标) / knockout-white(装饰图抠白,见 decor 注)
│   │              / tts.py(配音+字级时间戳,推荐) / asr.sh+align-asr.py(whisper 备用流程)
│   ├── data/asr/  {slug}.aligned.json(字级时间戳,whisper+拼音对齐产出)
│   └── public/    sync 生成(见下"不要手改/不要提交"清单);logo/ 例外须入 git
└── LICENSE        CC BY-NC-SA 4.0
```

**真值源 vs 派生产物**:仓库根的 `assets/ audio/ stories/ public/fonts/ docs/` 是人写的内容真值源;`site/public/{assets,audio,fonts}` 和 `site/src/data/asset-hashes.json`、`episodes.ts` 里的 `duration` 都是脚本派生产物。改内容改真值源,改完跑 sync。

## 开发命令(都在 `site/` 下跑)

```bash
cd site
npm install          # Node >= 22.12.0
npm run dev          # predev 自动 sync 资源 → astro dev --host
npm run build        # prebuild 自动 sync → astro build(产物 site/dist/)
npm run preview      # 预览构建产物
npm run sync         # 只跑资源同步,不启 dev server
```

`predev`/`prebuild` 钩子会自动调 `scripts/sync-assets.sh`,它做:复制+缩放原图 → 派生 JPG/WebP 多档 → 拷字体/音频 → 生成 `asset-hashes.json` → 扫 mp3 真实时长 patch `episodes.ts` 的 `duration`。**所以改了图/音频/故事后,dev 或 build 会自动同步,不用手动跑 sync。**

站点图标由 `node scripts/generate-zodiac-icons.mjs` 生成,已提交产物:
- app icon / apple-touch-icon ← `assets/decor/十二星座贴纸全家福.jpg`(贴纸全家福)
- 导航 logo / favicon-32 / favicon.ico ← 内嵌月牙 SVG(深靛蓝夜空 + 淡金弯月)
换贴纸全家福:替换该源图后重跑脚本;换月牙:改脚本内 SVG。

## 数据契约(改集数必读)

`site/src/data/episodes.ts` 里每个 episode:

- `slug` = `stories/{slug}.md` 文件名 = `audio/{slug}.mp3` 文件名
- `cover` 路径用**中文原图名**(如 `/assets/covers/第一集.jpg`),**不是** slug;slug 与封面文件名不一致是正常的
- `duration` 字段**不要手写**——`build-durations.mjs` 会读 mp3 真实时长覆盖它
- `status: 'online'` 才会在 `/story/{slug}` 生成路由(`getStaticPaths` 过滤);`'soon'` 是占位
- 角色 id 用拼音(如 `shuangyu` `shuiping` `yueliangjiejie` `xilianzuo`),对应 `characters.ts`
- `illustrations`(可选)= 本集画面:`{ src, caption, frames? }[]`,渲染在故事页正文之后、「第N集完」之前的画廊(在 `#story-text` 容器**外**,不参与逐字高亮/滚动跟随);同时并入**封面翻页查看器**(封面+本集画面一个图组,sticky 封面区箭头就地切换,首次切换后 img 由 src 驱动、去掉 srcset/webp source,点图开 lightbox);`frames` 填 ≥2 张图时是翻页动画(600ms 来回切换,画廊内和 lightbox 里都动;小爱演示的"手翻书"玩法);图放 `assets/episodes/`,画廊缩略图用 `-400/-800.webp` 变体,lightbox 用原图;画廊图和**封面图**都挂到出场角色 `characters.ts` 的 `portraits` 数组(顺序:立绘 → 封面 → 画廊图),图鉴弹窗里可切换浏览

**新增一集的完整发布清单(按序执行,每步完成再打勾):**

1. `stories/N-标题.md` 正文(遵守下方 markdown 写作规范)
2. 配音 + 字级时间戳:`site/scripts/tts.py`(MiniMax API subtitle_type=word,字级时间戳,一步到位,见下方「配音(TTS)」)
3. ~~字级高亮:asr.sh + align-asr.py~~(v13 起由 tts.py 替代;whisper 旧流程留作备用/交叉验证)
4. 封面:**只出提示词,不执行任何生图 skill**——用户拿提示词手动用 AI 工具生成、提供图片后,助手拷入 `assets/covers/第N集.jpg`(1920×1920 正方形 Q 版绘本风,画风锚定前集封面)。提示词经验:**不要写角色名**,改用外观描述 + 参考图编号(提醒用户按编号顺序上传);**场景必须给参考图**——`docs/系列设定.md` 场景速查表里的锚点图(`assets/locations/*.jpg`);构图主体控制在 1–2 个,核心动作用短动词写清;加一句"全画面只有这 N 个角色"防娃娃复制/路人乱入
5. `episodes.ts`:新条目 `status:'online'` + 上一集 `next` 指向本集(`duration` 不手写,build 时脚本回写)
6. **同步检查 `characters.ts`**(易漏!):本集登场角色的 `trait`/`bio` 是否落后于剧情
7. `docs/系列设定.md` 版本 +1:新剧情要点 + 涉及角色行 + 沿革记录
8. `npm run build` 验证:新路由生成、封面多档变体、音频同步、页数 +1
9. commit → push(git 操作每次都要先问用户)

## 新增虚构星座卡(「想象中的星空」)

角色本身的新增(设定/立绘/`characters.ts` 条目)按既有流程;这里只记**星座卡**的加法。弹窗模板是数据驱动的——`characters.astro` 遍历 `imaginaryConstellations` 自动出卡,**不用改页面代码**。

1. **定形状**:虚构星座没有"真实星位",形状和小爱一起定或按 `docs/系列设定.md` 的角色设定设计(如星砾座=小挎包+散落星砾)。
2. **生成卡**(agnes text2img,1024×1024;也可换其他生图工具,提示词通用;画风/背景参考图:`docs/星座图背景.png`,目前已验收的画风是"下方或居中 Q 版人物/形象 + 发光五角星连线",17 张在库卡都是这个风格):

   ```
   正方形儿童插画,画面铺满整个画布,不要任何边框和白边。梦幻粉彩夜空,粉紫到粉蓝柔和渐变,散布细碎的闪光小星星。画面主体在正中央:【形状描述】,整个主体由发光的五角星形状的星星组成,星星之间用细细的金色光线连接,带柔和的暖金色光晕,风格像柔软的贴纸。整体奶油糖果色调,治愈梦幻,光照柔和。不要任何文字。
   ```

   ```bash
   python3 ~/.agents/skills/agnes-cli/scripts/agnes.py image text2img \
     --prompt "上面的模板,替换【形状描述】" --size 1024x1024 --save /tmp/新星座.png
   ```

   (真实十二星座卡要重绘则不同:必须给星位参考图走 img2img,prompt 里写死"星点位置/数量/连线一个都不能变",否则 AI 会乱连。参考图可从 `constellations.ts` 存档坐标渲染,或用现代简化星形素材裁切。)
3. **入库**:检查并裁掉黑边/白框,转 JPG 1024×1024 → `assets/constellations/{角色中文名}.jpg`。**文件名必须 = `characters.ts` 的 `name`**(模板按角色名拼路径)。
4. **数据**:`site/src/data/constellations.ts` 的 `imaginaryConstellations` 加条目——key = 角色拼音 id(同 `characters.ts`),四字段 `shape`(它长什么样)/`home`(它住在哪里)/`power`(它的本领)/`story`(小故事),6 岁儿童口吻,内容向孩子讲清"这是我们想象的,天上没有"。
5. **验证**:`npm run build`(自动 sync 出 400/800 变体+新 hash)→ `/characters` 点该角色,弹窗应出现「🌙 想象中的星空」板块。
6. **提交前自查**:图无黑边、四字段齐全、弹窗标题是🌙不是✨(✨ 只属真实十二星座)。

## 不要手改 / 不要提交(gitignore)

这些是 sync 生成物,改了也会被覆盖,**真值源在仓库根**:

- `site/public/assets/` `site/public/audio/` `site/public/fonts/`
- `site/src/data/asset-hashes.json`(由 `generate-asset-hashes.mjs` 重写)
- `site/dist/` `site/.astro/` `.wrangler/` `.playwright-cli/`
- `episodes.ts` 的 `duration` 字段

**例外:`site/public/logo/` 不在 ignore 列表**——站点图标是项目重要资产,必须入 git。

## 架构边界 / 编辑规则

- **路径别名**:`~/*` → `site/src/*`(tsconfig paths)。Vite `fs.allow: ['..']` 让 site 能 `fs.readFileSync` 读仓库根的 `stories/` `assets/` `audio/`。
- **故事详情页** `site/src/pages/story/[slug].astro`:build 时 `fs.readFileSync('../stories/{slug}.md')`,用 `pinyin-pro` 给每个汉字生成 `<ruby>` 注音。**不要把故事正文复制进 site**——真值源是根目录 markdown。
- **字级卡拉OK高亮**:故事页读 `site/data/asr/{slug}.aligned.json`(字级时间戳),`requestAnimationFrame` 驱动逐字高亮。该 json 由 `site/scripts/tts.py`(MiniMax API subtitle_type=word,配音+时间戳一步到位)产出;备用是 `asr.sh`(whisper tiny 中文)+ `align-asr.py`(拼音空间 difflib 对齐,消解同音字 ASR 错误)。新增集数要做高亮,需先生成 aligned.json,否则页面降级为无高亮纯文本。
- **样式**:全站唯一 `site/src/styles/shared.css`,OKLch token(`--c-{name}` 颜色 / `--r-{name}` 圆角 / `--s-{n}` 间距),浅色棉花糖梦幻主题(奶油白底 + 白卡片 + 粉蓝紫 pastel `--accent`;素材是白底 Q 版贴纸,卡片/立绘底都用近白,不要深色块衬底)。深色只留两处例外:首页 hero banner(夜空窗)和场景 lightbox 查看罩。display 字体用猫啃网风雅宋(本地 TTF),body 用系统黑体。新颜色优先复用已有 `--c-*`,不要硬编码十六进制。
- **缓存策略**:`site/public/_headers` 给 `/assets/ /audio/ /fonts/` 设 `immutable`。改了同名资源必须靠 `asset-hashes.json` 的 `?h=` query 换指纹——所以**改图后务必跑 sync 重生 hash**,否则 CDN 不刷新。

## 命名 / 用词约定

- 故事文件:`stories/N-标题.md`(如 `1-想家的大海`)
- 角色名用**简体规范字**;十二星座写全名(双鱼座、水瓶座……),特别星座:爸比座、妈咪座;大海星座:汐涟座、夕海座(双鱼座/水瓶座兼属大海星座,tags 多分组,见 characters.ts);草原星座:星砾座(纯成员,住小太空青青草原、超市上班)、青原座(纯成员,住真正的青青草原、照料草原),摩羯座/射手座兼属;小溪星座:云螺座(纯成员,住星星小溪另一头、云壳百宝袋+云螺银线)、米虾座(纯成员,云螺座的妹妹、全小溪最快+吓一跳倒着弹),巨蟹座/天蝎座兼属;农场星座:星灵座(纯成员,月亮姐姐的小帮手、小洒水壶送月光,住月光农场栅栏外玻璃花房,白天睡觉夜里上班)、云穗座(纯成员,养云的小姐姐,住农场上空拴在栅栏上的大白云,云宝宝+月光毛毛雨)、月兔座(纯成员,云穗座的妹妹、同住大白云,长耳朵特别灵+记性特别好,抱月亮姐姐送的小月亮灯),金牛座/天秤座兼属(住月光农场,蔬菜白天睡觉、晚上发光);森林星座:狮子座/白羊座兼属(住小太空最深处星光森林,金色/白色蘑菇屋,蘑菇是星星变的、白天合伞睡觉晚上发光);家庭星座:天猫座(纯成员,双子座家的小猫、来自大太空、全小太空最会认路、抱小太阳玩偶),双子座/处女座兼属(来自普通家庭,一家住小太空边上普通小房子,灯总是最后才熄),爸比座/妈咪座兼属特别星座(她们的爸爸妈妈);小太空居民:月亮姐姐、月亮妹妹、星星姐妹。世界观:小太空在**大太空**里面(88 星座含 12,黄道/南天/北天),大太空只是新朋友的来处——故事永远发生在小太空,一次只来一个
- CSS token:`--c-{name}`(颜色,如 `--c-sky`)、`--r-{name}`(圆角)、`--s-{n}`(间距)

## 配音(TTS)

默认音色 **`qiaopi_mengmei`**(俏皮萌妹),全剧集统一。新增集数配音 + 字级时间戳**一步到位**(v13 起,推荐):

```bash
python3 site/scripts/tts.py stories/N-标题.md
# 产出: audio/N-标题.mp3 + site/data/asr/N-标题.aligned.json
# 原理: MiniMax t2a_v2 API 的 subtitle_type=word 返回字级时间戳(每个汉字一个时间窗),
#       与音频天然一致,无需 ASR;脚本再做能量吸附修正(API 时间窗无缝,停顿会被算进后一字,
#       吸附把每字起点对齐到真实发声点)。mmx CLI 未暴露 subtitle_type(只支持句级),所以脚本直调 API。
# 已存在的输出需 --force 才覆盖;--save-subs/--load-subs 可存取 API 原始字幕供调试。
```

**备用流程**(tts.py 不可用时):`mmx speech synthesize --text-file ... --voice qiaopi_mengmei --out ...` 配音,再 `./site/scripts/asr.sh` + `python3 site/scripts/align-asr.py`(拼音空间对齐,消解同音字 ASR 错误;重跑前先删 `site/data/asr/{slug}.json`)。

**配音验收**(v12 教训,TTS 对"X——X——"长破折号链会随机触发拖尾低鸣、单字循环甚至整句漏念):

1. tts.py 自动报警"单字时长 > 3s"(拖尾/卡壳的直接信号);whisper 流程则检查 aligned.json 相邻字空档 >4s + 扫 whisper json 循环段(同一词连续重复 ≥6 次——漏念的字会被对齐器插值铺进循环区,空档检查抓不到)
2. 漏句修法:单独 `mmx speech synthesize --text '漏掉的句子'` 补录,用 ffmpeg `atrim`+`concat` 拼接(注意别和上下文重复);拖尾/循环段直接剪掉,前后各留 ~0.5s
3. **剪过/拼过的 mp3 必须重编码为 CBR**(`-codec:a libmp3lame -b:a 96k`)——`build-durations.mjs` 按首帧码率估算时长,VBR 文件会算成两倍
4. 手工修补过音频后必须重生成对齐数据(tts.py 生成的 aligned.json 与其音频严格对应,剪拼后应重跑 whisper 备用流程对齐修补版)

## 故事 markdown 写作规范(`stories/N-标题.md`)

> 这些是 ASR 对齐 + 渲染的硬约束,违反会导致正文渲染截断或对齐失败。

- **段落分隔用空行**(`\n\n`)或 `---` 横线——两种都支持,`---` 会被自动视为场景分隔,不进 ASR ref_chars
- **可以用 markdown 加粗 `**xxx**`** —— `align-asr.py` 和 `[slug].astro` 都会自动剥离 `**` 标记,只保留中间文字
- **避免单星号 `*`**(markdown 斜体)—— `**` 会被剥离,但单 `*` 不会,会作为裸字符进入 ruby 渲染。例外:段首 `*` 会被整段过滤掉(被当成 markdown 强调列表项),所以更别用
- **不要用其他 markdown 语法**(标题/链接/列表/代码块/图片)——`[slug].astro` 只读取纯文本段落,不解析这些
- 第一行必须是 `# N-标题`(标题行),后续行才进 ref_chars。如果标题含 `：`/`:` 标点会被剥掉
- 中文标点 + 全角符号都按标点处理(零时长紧贴前字,不会被高亮二分命中)
- **时长软预算**:常规集 13–15 分钟(约 4000–4600 字正文),17 分钟为上限——逼近上限要停下来审视是否注水。写完对照自评

## 改敏感区域前先读

- 改角色/世界观 → 先读 `docs/系列设定.md`
- 改故事详情页渲染/高亮 → 先读 `site/src/pages/story/[slug].astro` 顶部注释 + `site/scripts/align-asr.py` 顶部注释
- 改资源同步流程 → 先读 `site/scripts/sync-assets.sh`(原图缩放阈值:characters ≤2048,其余 ≤1920)
