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
    duration: '约 11 分 59 秒',
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
