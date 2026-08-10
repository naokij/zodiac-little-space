// 十二星座小太空 · 剧集数据
// 数据真值源: 仓库根 docs/系列设定.md + stories/{slug}.md
// 文件名约定: slug = N-标题.md / .mp3

import type { Character } from './characters';
import { characters } from './characters';

export type EpisodeStatus = 'online' | 'soon';

// 本集画面(情节插图):展示在故事页正文之后、「第N集完」之前的画廊
export interface EpisodeIllustration {
  src: string;          // 主图(翻页动画时是第 1 帧)
  caption: string;      // 图注
  frames?: string[];    // 翻页动画帧(≥2 张时快速来回切换,小爱的"手翻书"玩法,如跳海双图)
}

export interface Episode {
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  duration: string;        // e.g. "约 8 分钟"
  status: EpisodeStatus;
  cover: string;           // '/assets/covers/第一集.jpg'
  audio?: string;          // '/audio/1-想家的大海.mp3'
  banner?: string;
  color: string;           // token key
  excerpt: string;         // 列表卡片摘要（控制在一到两句话，避免卡片过高）
  intro: string;           // 故事开篇一句话
  charactersInScene: string[];   // 角色 id 数组
  illustrations?: EpisodeIllustration[];  // 本集画面(情节插图)
  next?: { title: string; status: EpisodeStatus; slug: string };
}

const charMap = (id: string): Character => characters.find((c) => c.id === id)!;

export const episodes: Episode[] = [
  {
    slug: '1-想家的大海',
    number: 1,
    title: '第一集 想家的大海',
    subtitle: '双鱼座和水瓶座的星空泳池',
    duration: '约 11 分 54 秒',
    status: 'online',
    cover: '/assets/covers/第一集.jpg',
    audio: '/audio/1-想家的大海.mp3',
    color: 'sky',
    excerpt: '双鱼座和水瓶座是两条小美人鱼，她们好想好想家乡的大海。直到月亮姐姐告诉她们：小太空里，有一个水面倒映着星星月亮的地方。',
    intro: '我叫双鱼座，是一条小美人鱼。今天晚上，我好想好想家乡的大海。',
    charactersInScene: ['shuangyu', 'shuiping'],
    illustrations: [
      {
        src: '/assets/episodes/双鱼座激动跳海水瓶座拉住她.jpg',
        caption: '「扑通！」——太激动了，跳下去，又被拉住',
        frames: [
          '/assets/episodes/双鱼座激动跳海水瓶座拉住她.jpg',
          '/assets/episodes/水瓶座激动跳海双鱼座拉住她.jpg',
        ],
      },
      {
        src: '/assets/episodes/泳池安睡.jpg',
        caption: '想家的时候，就跳到星空泳池里来',
      },
    ],
    next: { title: '第二集 会漏水的水瓶', status: 'online', slug: '2-会漏水的水瓶' },
  },
  {
    slug: '2-会漏水的水瓶',
    number: 2,
    title: '第二集 会漏水的水瓶',
    subtitle: '汐涟座来了 · 大漏水名场面',
    duration: '约 12 分 55 秒',
    status: 'online',
    cover: '/assets/covers/第二集.jpg',
    audio: '/audio/2-会漏水的水瓶.mp3',
    color: 'lavender',
    excerpt: '星空泳池来了一位新朋友——会唤来海潮波纹的汐涟座。搞笑笑话日这天,水瓶座的水瓶忽然"咕嘟咕嘟"漏水了!',
    intro: '双鱼座趴在泳池边,轻轻晃着尾巴,哼起了歌。',
    charactersInScene: ['shuangyu', 'shuiping', 'xilianzuo'],
    illustrations: [
      {
        src: '/assets/episodes/大漏水名场面.jpg',
        caption: '双鱼座画的《大漏水名场面》',
      },
    ],
    next: { title: '第三集 晚霞浪花', status: 'online', slug: '3-晚霞浪花' },
  },
  {
    slug: '3-晚霞浪花',
    number: 3,
    title: '第三集 晚霞浪花',
    subtitle: '夕海座来了 · 哄小大海睡觉',
    duration: '约 14 分 14 秒',
    status: 'online',
    cover: '/assets/covers/第三集.jpg',
    audio: '/audio/3-晚霞浪花.mp3',
    color: 'orange',
    excerpt: '汐涟座在大海里的老朋友夕海座悄悄来了——她的浪花是晚霞色的，里面装着太阳最后的阳光。今晚，她要给星空泳池这方"小大海"盖上橘子色的被子。',
    intro: '泳池的水，什么时候变成橘子色的了？',
    charactersInScene: ['shuangyu', 'shuiping', 'xilianzuo', 'xihaizuo'],
    illustrations: [
      {
        src: '/assets/episodes/浪花合体.jpg',
        caption: '「哇，我们的浪花合体啦！」——蓝波纹遇上晚霞浪花',
      },
    ],
    next: { title: '第四集 大射箭名场面', status: 'online', slug: '4-大射箭名场面' },
  },
  {
    slug: '4-大射箭名场面',
    number: 4,
    title: '第四集 大射箭名场面',
    subtitle: '摩羯座和射手座的青青草原',
    duration: '约 12 分 21 秒',
    status: 'online',
    cover: '/assets/covers/第四集.jpg',
    audio: '/audio/4-大射箭名场面.mp3',
    color: 'green',
    excerpt: '修瓶子小分队出发啦！路过青青草原，遇上了草原姐妹——自封"草原第一神箭手"的射手座，和天天帮她捡箭的摩羯座。射手座的大射箭一出手，箭飞得到处都是！',
    intro: '"嗖！笃！"一支金色的小箭飞过来，稳稳地插在不远处的草靶子上。',
    charactersInScene: ['shuangyu', 'shuiping', 'xilianzuo', 'xihaizuo', 'mojie', 'sheshou'],
    illustrations: [
      {
        src: '/assets/episodes/大射箭名场面.jpg',
        caption: '大射箭名场面——「嗖——啪！」箭飞得到处都是',
      },
    ],
    next: { title: '第五集 星砾座的修理铺', status: 'online', slug: '5-星砾座的修理铺' },
  },
  {
    slug: '5-星砾座的修理铺',
    number: 5,
    title: '第五集 星砾座的修理铺',
    subtitle: '星砾座来了 · 瓶子和大海是同款',
    duration: '约 12 分 23 秒',
    status: 'online',
    cover: '/assets/covers/第五集.jpg',
    audio: '/audio/5-星砾座的修理铺.mp3',
    color: 'gold',
    excerpt: '修瓶子小分队终于到啦！超市修理师星砾座有全世界最好的修补材料——星砾。补好的瓶子上多了一条细细的金线；傍晚的晚霞海上,也有一条一模一样的金线……',
    intro: '这天早上,天刚亮,星空泳池边的小木屋门上,响起了敲门声。',
    charactersInScene: ['shuangyu', 'shuiping', 'xilianzuo', 'xihaizuo', 'mojie', 'sheshou', 'xinglizuo'],
    illustrations: [
      {
        src: '/assets/episodes/金粉大战名场面.jpg',
        caption: '金粉大战名场面——「噗——!!!」射手座抢拍猛吹,星砾炸成了满天金粉',
      },
      {
        src: '/assets/episodes/晚霞海.jpg',
        caption: '大海和天空相接的地方有一条金线——晚霞,就是大海的金线',
      },
    ],
    next: { title: '第六集 蒲公英带路的日子', status: 'online', slug: '6-蒲公英带路的日子' },
  },
  {
    slug: '6-蒲公英带路的日子',
    number: 6,
    title: '第六集 蒲公英带路的日子',
    subtitle: '青原座来了 · 真正的青青草原',
    duration: '约 12 分 36 秒',
    status: 'online',
    cover: '/assets/covers/第六集.jpg',
    audio: '/audio/6-蒲公英带路的日子.mp3',
    color: 'mint',
    excerpt: '摩羯座的"改天"真的到了！跟着蒲公英铺成的小路，大家来到真正的青青草原——比小太空的大一万倍！守着草原的青原座送给射手座一支蒲公英箭；练了好久好久的一支箭，在天上变成了一场种子雨……',
    intro: '这天早上,天刚蒙蒙亮,星空泳池边的小木屋门上,贴了一张小纸条。',
    charactersInScene: ['shuangyu', 'shuiping', 'xilianzuo', 'xihaizuo', 'mojie', 'sheshou', 'qingyuanzuo'],
    illustrations: [
      {
        src: '/assets/episodes/花田送花.jpg',
        caption: '青原座送双鱼座一朵蓝色小花——「这朵像大海的颜色」',
      },
      {
        src: '/assets/episodes/蒲公英小路.jpg',
        caption: '跟着蒲公英走!——软绵绵、弹墩墩,一步一弹',
      },
    ],
    next: { title: '第七集 小钳子想牵手', status: 'online', slug: '7-小钳子想牵手' },
  },
  {
    slug: '7-小钳子想牵手',
    number: 7,
    title: '第七集 小钳子想牵手',
    subtitle: '巨蟹座和天蝎座的星星小溪',
    duration: '约 12 分 46 秒',
    status: 'online',
    cover: '/assets/covers/第七集.jpg',
    audio: '/audio/7-小钳子想牵手.mp3',
    color: 'rose',
    excerpt: '射手座探险发现了星星小溪——巨蟹座和天蝎座就住在溪边。玩水玩得正开心,小螃蟹和小红蝎忽然"啪嗒"夹住了自己的主人!原来,没有小手的它们,是想用钳子牵手……',
    intro: '小太空一个安安静静的角落里,有一条小溪,叫星星小溪。',
    charactersInScene: ['juxie', 'tianxie', 'mojie', 'sheshou'],
    illustrations: [
      {
        src: '/assets/episodes/星星小溪踩水花.jpg',
        caption: '「哇——凉丝丝的!」——手拉手,在星星小溪里踩水花',
      },
      {
        src: '/assets/episodes/星星小溪手拉手.jpg',
        caption: '大手牵小手,小螃蟹和小红蝎也想加入',
      },
      {
        src: '/assets/episodes/被小钳子夹住.jpg',
        caption: '被夹名场面——「啪嗒!」原来它们是想用钳子牵手',
      },
    ],
    next: { title: '第八集 云壳里的小惊喜', status: 'online', slug: '8-云壳里的小惊喜' },
  },
  {
    slug: '8-云壳里的小惊喜',
    number: 8,
    title: '第八集 云壳里的小惊喜',
    subtitle: '云螺座来了 · 云螺银线',
    duration: '约 14 分 20 秒',
    status: 'online',
    cover: '/assets/covers/第八集.jpg',
    audio: '/audio/8-云壳里的小惊喜.mp3',
    color: 'cream',
    excerpt: '小溪另一头住着金发小公主云螺座,她做什么都慢慢的——原来她一路在收集好看的东西,要装进云壳送给朋友。看星星洗澡的夜晚,云壳盖子掀开了,一朵一朵小云飘了出来……',
    intro: '小溪的另一头,还住着一位星座女孩,她叫云螺座。',
    charactersInScene: ['juxie', 'tianxie', 'yunluo'],
    illustrations: [
      {
        src: '/assets/episodes/云螺银线.jpg',
        caption: '云螺银线——白天看不见的银线,晚上全都亮晶晶的',
      },
      {
        src: '/assets/episodes/给小蜗牛加油.jpg',
        caption: '「加——油——,小——蜗——牛——」三片草叶,也是很远很远的路哦',
      },
    ],
    next: { title: '第九集 最快的小妹妹', status: 'online', slug: '9-最快的小妹妹' },
  },
  {
    slug: '9-最快的小妹妹',
    number: 9,
    title: '第九集 最快的小妹妹',
    subtitle: '米虾座来了 · 云朵蹦蹦床',
    duration: '约 14 分 43 秒',
    status: 'online',
    cover: '/assets/covers/第九集.jpg',
    audio: '/audio/9-最快的小妹妹.mp3',
    color: 'pink',
    excerpt: '云螺座的妹妹米虾座,是全小溪最快的星座女孩——"嗖"的一下,只剩一条亮亮的小水痕。生日这天,姐姐云壳里最大最大的那朵云,终于打开了……',
    intro: '云螺座还有一个妹妹,叫米虾座。',
    charactersInScene: ['juxie', 'tianxie', 'yunluo', 'mixia'],
    illustrations: [
      {
        src: '/assets/episodes/米虾座倒着弹.jpg',
        caption: '吓一大跳的米虾座,"嗖"的一下倒着弹了出去!',
      },
      {
        src: '/assets/episodes/两条小围巾.jpg',
        caption: '一条快快的亮线,一条慢慢的银线,像小溪的两条围巾',
      },
    ],
  },
];

// 工具
export function getEpisodeBySlug(slug: string): Episode | undefined {
  return episodes.find((e) => e.slug === slug);
}

export function getCharactersInScene(ep: Episode): Character[] {
  return ep.charactersInScene.map((id) => charMap(id)).filter(Boolean);
}

export const onlineEpisodes = episodes.filter((e) => e.status === 'online');
