// 十二星座小太空 · 剧集数据
// 数据真值源: 仓库根 docs/系列设定.md + stories/{slug}.md
// 文件名约定: slug = N-标题.md / .mp3

import type { Character } from './characters';
import { characters } from './characters';

export type EpisodeStatus = 'online' | 'soon';

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
